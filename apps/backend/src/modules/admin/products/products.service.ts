import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductTranslationDto } from './dto/update-product-translation.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { ManageProductTagsDto } from './dto/manage-product-tags.dto';

@Injectable()
export class AdminProductsService {
  async findAll(filters?: { status?: string; categoryId?: string; search?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { translations: { some: { name: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    return prisma.product.findMany({
      where,
      include: {
        category: true,
        translations: true,
        images: { orderBy: { position: 'asc' } },
        tagAssignments: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        translations: true,
        images: { orderBy: { position: 'asc' } },
        assets: { orderBy: { position: 'asc' } },
        tagAssignments: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
        specifications: { orderBy: { position: 'asc' } },
        related: {
          include: {
            relatedProduct: {
              include: {
                translations: true,
              },
            },
          },
        },
        faqs: { orderBy: { position: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const { translation, ...productData } = dto;

    // Validate SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: { sku: productData.sku },
    });

    if (existing) {
      throw new BadRequestException(`Product SKU "${productData.sku}" already exists`);
    }

    // Validate category if provided
    if (productData.categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: productData.categoryId },
      });

      if (!category) {
        throw new BadRequestException(`Category with ID ${productData.categoryId} not found`);
      }
    }

    // Check if translation slug is unique within locale
    const existingTranslation = await prisma.productTranslation.findFirst({
      where: {
        locale: translation.locale,
        slug: translation.slug,
      },
    });

    if (existingTranslation) {
      throw new BadRequestException(
        `Product slug "${translation.slug}" already exists for locale "${translation.locale}"`,
      );
    }

    return prisma.product.create({
      data: {
        ...productData,
        publishedAt: productData.status === 'PUBLISHED' ? new Date() : null,
        translations: {
          create: [translation],
        },
      },
      include: {
        category: true,
        translations: true,
        tagAssignments: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if SKU is being changed and if it's unique
    if (dto.sku && dto.sku !== product.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (existing) {
        throw new BadRequestException(`Product SKU "${dto.sku}" already exists`);
      }
    }

    // Validate category if being changed
    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);
      }
    }

    const updateData: any = {
      ...dto,
    };

    // Update published timestamp if status is changing to PUBLISHED
    if (dto.status === 'PUBLISHED' && product.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        translations: true,
        tagAssignments: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });
  }

  async updateTranslation(id: string, dto: UpdateProductTranslationDto) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const existing = await prisma.productTranslation.findUnique({
      where: { productId_locale: { productId: id, locale: dto.locale } },
    });

    if (existing) {
      // Check if slug is being changed and if it's unique
      if (dto.slug && dto.slug !== existing.slug) {
        const slugExists = await prisma.productTranslation.findFirst({
          where: {
            locale: dto.locale,
            slug: dto.slug,
            productId: { not: id },
          },
        });

        if (slugExists) {
          throw new BadRequestException(
            `Product slug "${dto.slug}" already exists for locale "${dto.locale}"`,
          );
        }
      }

      return prisma.productTranslation.update({
        where: { productId_locale: { productId: id, locale: dto.locale } },
        data: {
          ...(dto.slug && { slug: dto.slug }),
          ...(dto.name && { name: dto.name }),
          ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.features !== undefined && { features: dto.features }),
          ...(dto.applications !== undefined && { applications: dto.applications }),
          ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
          ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
          ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
          ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
        },
      });
    }

    return prisma.productTranslation.create({
      data: {
        productId: id,
        locale: dto.locale,
        slug: dto.slug || `product-${Date.now()}`,
        name: dto.name || 'Untitled',
        shortDescription: dto.shortDescription,
        description: dto.description,
        features: dto.features,
        applications: dto.applications,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogImage: dto.ogImage,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateProductStatusDto) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    } else if (dto.status === 'ARCHIVED') {
      updateData.archivedAt = new Date();
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        translations: true,
      },
    });
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return prisma.product.delete({
      where: { id },
    });
  }

  async manageTags(productId: string, dto: ManageProductTagsDto) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Delete existing tag assignments
    await prisma.productTagOnProduct.deleteMany({
      where: { productId },
    });

    // Create new tag assignments
    const assignments = await Promise.all(
      dto.tagIds.map((tagId) =>
        prisma.productTagOnProduct.create({
          data: {
            productId,
            tagId,
          },
        }),
      ),
    );

    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        tagAssignments: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });
  }
}
