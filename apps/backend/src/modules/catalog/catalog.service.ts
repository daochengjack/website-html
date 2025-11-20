import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class CatalogService {
  /**
   * Get all published categories in tree structure
   */
  async getCategories(query: QueryCategoriesDto) {
    const { locale = 'en', parentId } = query;

    const categories = await prisma.productCategory.findMany({
      where: {
        isPublished: true,
        showInMenu: true,
        parentId: parentId || null,
      },
      include: {
        translations: {
          where: { locale, isPublished: true },
        },
        children: {
          where: {
            isPublished: true,
            showInMenu: true,
          },
          include: {
            translations: {
              where: { locale, isPublished: true },
            },
            children: {
              where: {
                isPublished: true,
                showInMenu: true,
              },
              include: {
                translations: {
                  where: { locale, isPublished: true },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });

    return categories.map(cat => this.mapCategory(cat, locale));
  }

  /**
   * Get category tree (all categories in hierarchy)
   */
  async getCategoryTree(locale: string = 'en') {
    const categories = await prisma.productCategory.findMany({
      where: {
        isPublished: true,
        showInMenu: true,
      },
      include: {
        translations: {
          where: { locale, isPublished: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { position: 'asc' },
    });

    const categoryMap = new Map();
    const tree: any[] = [];

    // First pass: create nodes
    categories.forEach(cat => {
      const node = {
        id: cat.id,
        slug: cat.slug,
        path: cat.path,
        parentId: cat.parentId,
        name: cat.translations[0]?.name || cat.slug,
        description: cat.translations[0]?.description,
        iconUrl: cat.iconUrl,
        imageUrl: cat.imageUrl,
        productCount: cat._count.products,
        children: [],
      };
      categoryMap.set(cat.id, node);
    });

    // Second pass: build tree
    categoryMap.forEach(node => {
      if (node.parentId) {
        const parent = categoryMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  /**
   * Get a single category by slug with breadcrumbs and siblings
   */
  async getCategoryBySlug(slug: string, locale: string = 'en') {
    const category = await prisma.productCategory.findFirst({
      where: { slug, isPublished: true },
      include: {
        translations: {
          where: { locale, isPublished: true },
        },
        parent: {
          include: {
            translations: {
              where: { locale, isPublished: true },
            },
          },
        },
        children: {
          where: {
            isPublished: true,
            showInMenu: true,
          },
          include: {
            translations: {
              where: { locale, isPublished: true },
            },
            _count: {
              select: { products: true },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category not found: ${slug}`);
    }

    // Build breadcrumbs
    const breadcrumbs = await this.buildBreadcrumbs(category.path, locale);

    // Get siblings if this category has a parent
    let siblings: any[] = [];
    if (category.parentId) {
      const siblingCategories = await prisma.productCategory.findMany({
        where: {
          parentId: category.parentId,
          isPublished: true,
          showInMenu: true,
        },
        include: {
          translations: {
            where: { locale, isPublished: true },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { position: 'asc' },
      });
      siblings = siblingCategories.map(cat => this.mapCategory(cat, locale));
    }

    const translation = category.translations[0];

    const tagEntries = await prisma.productTag.findMany({
      where: {
        isPublished: true,
        productMappings: {
          some: {
            product: {
              status: ProductStatus.PUBLISHED,
              categoryId: category.id,
            },
          },
        },
      },
      include: {
        translations: {
          where: { locale, isPublished: true },
        },
      },
      orderBy: { slug: 'asc' },
    });

    const availableTags = tagEntries.map(tag => ({
      id: tag.id,
      slug: tag.slug,
      name: tag.translations[0]?.name || tag.slug,
    }));

    return {
      id: category.id,
      slug: category.slug,
      path: category.path,
      name: translation?.name || category.slug,
      description: translation?.description,
      iconUrl: category.iconUrl,
      imageUrl: category.imageUrl,
      metaTitle: translation?.metaTitle,
      metaDescription: translation?.metaDescription,
      ogImage: translation?.ogImage,
      productCount: category._count.products,
      parent: category.parent ? this.mapCategory(category.parent, locale) : null,
      children: category.children.map(cat => this.mapCategory(cat, locale)),
      siblings,
      breadcrumbs,
      availableTags,
    };
  }

  /**
   * Get products with filters and pagination
   */
  async getProducts(query: QueryProductsDto) {
    const {
      locale = 'en',
      categoryId,
      search,
      tags,
      sort = 'newest',
      page = 1,
      pageSize = 12,
      featuredOnly = false,
    } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Build where clause
    const where: any = {
      status: ProductStatus.PUBLISHED,
      translations: {
        some: {
          locale,
          isPublished: true,
        },
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    if (search) {
      where.translations = {
        some: {
          locale,
          isPublished: true,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { shortDescription: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    if (tags) {
      const tagSlugs = tags.split(',').map(t => t.trim());
      where.tagAssignments = {
        some: {
          tag: {
            slug: { in: tagSlugs },
            isPublished: true,
          },
        },
      };
    }

    // Build order clause
    let orderBy: any = {};
    switch (sort) {
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { publishedAt: 'desc' }];
        break;
      case 'name-asc':
      case 'name-desc':
        // Can't sort directly by translation field, will sort in memory
        orderBy = { publishedAt: 'desc' };
        break;
      default:
        orderBy = { publishedAt: 'desc' };
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          translations: {
            where: { locale, isPublished: true },
          },
          images: {
            where: { isPrimary: true },
            orderBy: { position: 'asc' },
            take: 1,
          },
          category: {
            include: {
              translations: {
                where: { locale, isPublished: true },
              },
            },
          },
          tagAssignments: {
            include: {
              tag: {
                include: {
                  translations: {
                    where: { locale },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Map products to response format
    let mappedProducts = products.map(product => {
      const translation = product.translations[0];
      const primaryImage = product.images[0];

      return {
        id: product.id,
        sku: product.sku,
        slug: translation?.slug || product.sku,
        name: translation?.name || product.sku,
        shortDescription: translation?.shortDescription,
        imageUrl: primaryImage?.url,
        imageAlt: primaryImage?.altText,
        isFeatured: product.isFeatured,
        publishedAt: product.publishedAt,
        category: product.category
          ? {
              id: product.category.id,
              slug: product.category.slug,
              name:
                product.category.translations[0]?.name || product.category.slug,
            }
          : null,
        tags: product.tagAssignments.map(ta => ({
          id: ta.tag.id,
          slug: ta.tag.slug,
          name: ta.tag.translations[0]?.name || ta.tag.slug,
        })),
      };
    });

    // Sort by name if requested (in memory)
    if (sort === 'name-asc') {
      mappedProducts = mappedProducts.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    } else if (sort === 'name-desc') {
      mappedProducts = mappedProducts.sort((a, b) =>
        b.name.localeCompare(a.name),
      );
    }

    const totalPages = Math.ceil(total / pageSize);

    return {
      products: mappedProducts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get hot/featured products
   */
  async getHotProducts(locale: string = 'en', limit: number = 5) {
    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        isFeatured: true,
        translations: {
          some: {
            locale,
            isPublished: true,
          },
        },
      },
      take: limit,
      orderBy: [{ position: 'asc' }, { publishedAt: 'desc' }],
      include: {
        translations: {
          where: { locale, isPublished: true },
        },
        images: {
          where: { isPrimary: true },
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
    });

    return products.map(product => {
      const translation = product.translations[0];
      const primaryImage = product.images[0];

      return {
        id: product.id,
        sku: product.sku,
        slug: translation?.slug || product.sku,
        name: translation?.name || product.sku,
        shortDescription: translation?.shortDescription,
        imageUrl: primaryImage?.url,
        imageAlt: primaryImage?.altText,
      };
    });
  }

  /**
   * Helper: Build breadcrumbs from category path
   */
  private async buildBreadcrumbs(path: string, locale: string) {
    const pathSegments = path.split('/').filter(Boolean);
    const breadcrumbs: any[] = [];

    for (let i = 0; i < pathSegments.length; i++) {
      const segmentPath = '/' + pathSegments.slice(0, i + 1).join('/');
      const category = await prisma.productCategory.findFirst({
        where: { path: segmentPath },
        include: {
          translations: {
            where: { locale, isPublished: true },
          },
        },
      });

      if (category) {
        breadcrumbs.push({
          id: category.id,
          slug: category.slug,
          path: category.path,
          name: category.translations[0]?.name || category.slug,
        });
      }
    }

    return breadcrumbs;
  }

  /**
   * Helper: Map category to response format
   */
  private mapCategory(category: any, locale: string) {
    const translation = category.translations?.find(
      (t: any) => t.locale === locale,
    );

    return {
      id: category.id,
      slug: category.slug,
      path: category.path,
      name: translation?.name || category.slug,
      description: translation?.description,
      iconUrl: category.iconUrl,
      imageUrl: category.imageUrl,
      productCount: category._count?.products || 0,
      children: category.children?.map((child: any) =>
        this.mapCategory(child, locale),
      ),
    };
  }
}
