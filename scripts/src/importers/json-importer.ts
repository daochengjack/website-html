import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger.js';
import { readJsonFile, listJsonFiles, ensureDir } from '../utils/fs.js';
import {
  ScrapedCategory,
  ScrapedProduct,
  ScrapedBlogPost,
  ScrapedStaticPage,
  ImportStats,
  ImporterConfig,
} from '../types/index.js';

const logger = createLogger('JsonImporter');

export class JsonImporter {
  private prisma: PrismaClient;
  private config: ImporterConfig;
  private stats: ImportStats;

  constructor(prisma: PrismaClient, config: ImporterConfig) {
    this.prisma = prisma;
    this.config = config || { dataDir: './data', locale: 'en', logProgress: true };
    this.stats = {
      totalProcessed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      startedAt: new Date(),
      completedAt: new Date(),
      errorLog: [],
    };
  }

  async importAll(): Promise<ImportStats> {
    logger.info('Starting data import from JSON files...', { dataDir: this.config.dataDir });

    try {
      await this.importCategories();
      await this.throttle();

      await this.importProducts();
      await this.throttle();

      await this.importBlogPosts();
      await this.throttle();

      await this.importStaticPages();
      await this.throttle();

      this.stats.completedAt = new Date();
      this.printSummary();

      return this.stats;
    } catch (error) {
      logger.error('Import failed', error);
      this.stats.completedAt = new Date();
      throw error;
    }
  }

  private async importCategories(): Promise<void> {
    logger.info('📁 Importing product categories...');

    const filePath = `${this.config.dataDir}/categories.json`;

    try {
      const categories = (await readJsonFile<ScrapedCategory[]>(filePath)) || [];

      for (const cat of categories) {
        try {
          const result = await this.upsertCategory(cat);
          this.stats.totalProcessed++;

          if (result.created) this.stats.created++;
          else this.stats.updated++;

          if (this.config.logProgress) {
            logger.debug(`Category: ${cat.slug}`);
          }
        } catch (error) {
          this.stats.errors++;
          this.stats.errorLog.push({
            item: `category/${cat.slug}`,
            error: error instanceof Error ? error.message : String(error),
          });
          logger.warn(`Failed to import category ${cat.slug}`, error);
        }
      }

      logger.success(`Imported ${categories.length} categories`);
    } catch (error) {
      logger.warn(`Categories file not found: ${filePath}`, error);
    }
  }

  private async importProducts(): Promise<void> {
    logger.info('📦 Importing products...');

    const filePath = `${this.config.dataDir}/products.json`;

    try {
      const products = (await readJsonFile<ScrapedProduct[]>(filePath)) || [];

      for (const product of products) {
        try {
          const result = await this.upsertProduct(product);
          this.stats.totalProcessed++;

          if (result.created) this.stats.created++;
          else this.stats.updated++;

          if (this.config.logProgress) {
            logger.debug(`Product: ${product.sku}`);
          }
        } catch (error) {
          this.stats.errors++;
          this.stats.errorLog.push({
            item: `product/${product.sku}`,
            error: error instanceof Error ? error.message : String(error),
          });
          logger.warn(`Failed to import product ${product.sku}`, error);
        }
      }

      logger.success(`Imported ${products.length} products`);
    } catch (error) {
      logger.warn(`Products file not found: ${filePath}`, error);
    }
  }

  private async importBlogPosts(): Promise<void> {
    logger.info('📝 Importing blog posts...');

    const filePath = `${this.config.dataDir}/blog-posts.json`;

    try {
      const posts = (await readJsonFile<ScrapedBlogPost[]>(filePath)) || [];

      for (const post of posts) {
        try {
          const result = await this.upsertBlogPost(post);
          this.stats.totalProcessed++;

          if (result.created) this.stats.created++;
          else this.stats.updated++;

          if (this.config.logProgress) {
            logger.debug(`Blog post: ${post.slug}`);
          }
        } catch (error) {
          this.stats.errors++;
          this.stats.errorLog.push({
            item: `blog/${post.slug}`,
            error: error instanceof Error ? error.message : String(error),
          });
          logger.warn(`Failed to import blog post ${post.slug}`, error);
        }
      }

      logger.success(`Imported ${posts.length} blog posts`);
    } catch (error) {
      logger.warn(`Blog posts file not found: ${filePath}`, error);
    }
  }

  private async importStaticPages(): Promise<void> {
    logger.info('📄 Importing static pages...');

    const filePath = `${this.config.dataDir}/static-pages.json`;

    try {
      const pages = (await readJsonFile<ScrapedStaticPage[]>(filePath)) || [];

      for (const page of pages) {
        try {
          const result = await this.upsertStaticPage(page);
          this.stats.totalProcessed++;

          if (result.created) this.stats.created++;
          else this.stats.updated++;

          if (this.config.logProgress) {
            logger.debug(`Static page: ${page.slug}`);
          }
        } catch (error) {
          this.stats.errors++;
          this.stats.errorLog.push({
            item: `page/${page.slug}`,
            error: error instanceof Error ? error.message : String(error),
          });
          logger.warn(`Failed to import static page ${page.slug}`, error);
        }
      }

      logger.success(`Imported ${pages.length} static pages`);
    } catch (error) {
      logger.warn(`Static pages file not found: ${filePath}`, error);
    }
  }

  private async upsertCategory(
    cat: ScrapedCategory
  ): Promise<{ created: boolean; updated: boolean }> {
    const existingCat = await this.prisma.productCategory.findUnique({
      where: { slug: cat.slug },
    });

    if (existingCat) {
      // Update category
      await this.prisma.productCategory.update({
        where: { id: existingCat.id },
        data: {
          path: cat.path,
          parentId: cat.parentSlug
            ? (await this.prisma.productCategory.findUnique({ where: { slug: cat.parentSlug } }))?.id
            : undefined,
          position: cat.position || 0,
          isPublished: cat.isPublished !== false,
          showInMenu: cat.showInMenu !== false,
          iconUrl: cat.iconUrl,
          imageUrl: cat.imageUrl,
        },
      });

      // Upsert translation
      await this.prisma.productCategoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: existingCat.id,
            locale: cat.locale || this.config.locale || 'en',
          },
        },
        create: {
          categoryId: existingCat.id,
          locale: cat.locale || this.config.locale || 'en',
          name: cat.name,
          description: cat.description,
          metaTitle: cat.metaTitle,
          metaDescription: cat.metaDescription,
          isPublished: cat.isPublished !== false,
        },
        update: {
          name: cat.name,
          description: cat.description,
          metaTitle: cat.metaTitle,
          metaDescription: cat.metaDescription,
          isPublished: cat.isPublished !== false,
        },
      });

      return { created: false, updated: true };
    } else {
      // Create category
      const parentId = cat.parentSlug
        ? (await this.prisma.productCategory.findUnique({ where: { slug: cat.parentSlug } }))?.id
        : undefined;

      const newCat = await this.prisma.productCategory.create({
        data: {
          slug: cat.slug,
          path: cat.path,
          parentId,
          position: cat.position || 0,
          isPublished: cat.isPublished !== false,
          showInMenu: cat.showInMenu !== false,
          iconUrl: cat.iconUrl,
          imageUrl: cat.imageUrl,
        },
      });

      // Create translation
      await this.prisma.productCategoryTranslation.create({
        data: {
          categoryId: newCat.id,
          locale: cat.locale || this.config.locale || 'en',
          name: cat.name,
          description: cat.description,
          metaTitle: cat.metaTitle,
          metaDescription: cat.metaDescription,
          isPublished: cat.isPublished !== false,
        },
      });

      return { created: true, updated: false };
    }
  }

  private async upsertProduct(
    product: ScrapedProduct
  ): Promise<{ created: boolean; updated: boolean }> {
    const categoryId = product.categorySlug
      ? (await this.prisma.productCategory.findUnique({ where: { slug: product.categorySlug } }))?.id
      : undefined;

    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: product.sku },
    });

    if (existingProduct) {
      // Update product
      await this.prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          categoryId,
          isFeatured: product.isFeatured || false,
          position: product.position || 0,
          status: product.isPublished !== false ? 'PUBLISHED' : 'DRAFT',
        },
      });

      // Upsert translation
      await this.prisma.productTranslation.upsert({
        where: {
          productId_locale: {
            productId: existingProduct.id,
            locale: product.locale || this.config.locale || 'en',
          },
        },
        create: {
          productId: existingProduct.id,
          locale: product.locale || this.config.locale || 'en',
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          features: product.features,
          applications: product.applications,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          isPublished: product.isPublished !== false,
          publishedAt: product.isPublished !== false ? new Date() : undefined,
        },
        update: {
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          features: product.features,
          applications: product.applications,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          isPublished: product.isPublished !== false,
        },
      });

      await this.addProductImages(existingProduct.id, product.images);
      await this.addProductAssets(existingProduct.id, product.assets);
      await this.addProductSpecifications(existingProduct.id, product.specifications);
      await this.addProductTags(existingProduct.id, product.tags);

      return { created: false, updated: true };
    } else {
      // Create product
      const newProduct = await this.prisma.product.create({
        data: {
          sku: product.sku,
          categoryId,
          status: product.isPublished !== false ? 'PUBLISHED' : 'DRAFT',
          isFeatured: product.isFeatured || false,
          position: product.position || 0,
          publishedAt: product.isPublished !== false ? new Date() : undefined,
        },
      });

      // Create translation
      await this.prisma.productTranslation.create({
        data: {
          productId: newProduct.id,
          locale: product.locale || this.config.locale || 'en',
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          features: product.features,
          applications: product.applications,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          isPublished: product.isPublished !== false,
          publishedAt: product.isPublished !== false ? new Date() : undefined,
        },
      });

      await this.addProductImages(newProduct.id, product.images);
      await this.addProductAssets(newProduct.id, product.assets);
      await this.addProductSpecifications(newProduct.id, product.specifications);
      await this.addProductTags(newProduct.id, product.tags);

      return { created: true, updated: false };
    }
  }

  private async addProductImages(
    productId: string,
    images?: Array<{ url: string; altText?: string; isPrimary?: boolean }>
  ): Promise<void> {
    if (!images || images.length === 0) return;

    // Clear existing images
    await this.prisma.productImage.deleteMany({ where: { productId } });

    for (const [index, image] of images.entries()) {
      await this.prisma.productImage.create({
        data: {
          productId,
          url: image.url,
          altText: image.altText,
          position: index,
          isPrimary: image.isPrimary || index === 0,
        },
      });
    }
  }

  private async addProductAssets(
    productId: string,
    assets?: Array<{ type: string; url: string; fileName: string; title?: string }>
  ): Promise<void> {
    if (!assets || assets.length === 0) return;

    for (const [index, asset] of assets.entries()) {
      await this.prisma.productAsset.create({
        data: {
          productId,
          type: asset.type,
          url: asset.url,
          fileName: asset.fileName,
          title: asset.title,
          position: index,
        },
      });
    }
  }

  private async addProductSpecifications(
    productId: string,
    specifications?: Array<{ key: string; value: string; unit?: string }>
  ): Promise<void> {
    if (!specifications || specifications.length === 0) return;

    // Clear existing specs
    await this.prisma.productSpecification.deleteMany({ where: { productId } });

    for (const [index, spec] of specifications.entries()) {
      await this.prisma.productSpecification.create({
        data: {
          productId,
          key: spec.key,
          value: spec.value,
          unit: spec.unit,
          position: index,
        },
      });
    }
  }

  private async addProductTags(productId: string, tagNames?: string[]): Promise<void> {
    if (!tagNames || tagNames.length === 0) return;

    const locale = this.config.locale || 'en';

    for (const tagName of tagNames) {
      const slug = tagName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const tag = await this.prisma.productTag.upsert({
        where: { slug },
        create: {
          slug,
          isPublished: true,
        },
        update: {},
      });

      await this.prisma.productTagTranslation.upsert({
        where: { tagId_locale: { tagId: tag.id, locale } },
        create: {
          tagId: tag.id,
          locale,
          name: tagName,
          isPublished: true,
        },
        update: { name: tagName },
      });

      await this.prisma.productTagOnProduct.upsert({
        where: { productId_tagId: { productId, tagId: tag.id } },
        create: { productId, tagId: tag.id },
        update: {},
      });
    }
  }

  private async upsertBlogPost(post: ScrapedBlogPost): Promise<{ created: boolean; updated: boolean }> {
    const locale = post.locale || this.config.locale || 'en';
    const existingPost = await this.prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (existingPost) {
      // Update post
      await this.prisma.blogPost.update({
        where: { id: existingPost.id },
        data: {
          isPublished: post.isPublished !== false,
          publishedAt: post.isPublished !== false ? new Date(post.publishedAt || new Date()) : undefined,
          featuredImageUrl: post.featuredImageUrl,
          authorName: post.authorName,
        },
      });

      // Upsert translation
      await this.prisma.blogPostTranslation.upsert({
        where: {
          postId_locale: {
            postId: existingPost.id,
            locale,
          },
        },
        create: {
          postId: existingPost.id,
          locale,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags || [],
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          isPublished: post.isPublished !== false,
          publishedAt: post.isPublished !== false ? new Date(post.publishedAt || new Date()) : undefined,
        },
        update: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags || [],
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          isPublished: post.isPublished !== false,
        },
      });

      return { created: false, updated: true };
    } else {
      // Create post
      const newPost = await this.prisma.blogPost.create({
        data: {
          slug: post.slug,
          isPublished: post.isPublished !== false,
          publishedAt: post.isPublished !== false ? new Date(post.publishedAt || new Date()) : undefined,
          featuredImageUrl: post.featuredImageUrl,
          authorName: post.authorName,
        },
      });

      // Create translation
      await this.prisma.blogPostTranslation.create({
        data: {
          postId: newPost.id,
          locale,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags || [],
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          isPublished: post.isPublished !== false,
          publishedAt: post.isPublished !== false ? new Date(post.publishedAt || new Date()) : undefined,
        },
      });

      return { created: true, updated: false };
    }
  }

  private async upsertStaticPage(page: ScrapedStaticPage): Promise<{ created: boolean; updated: boolean }> {
    const locale = page.locale || this.config.locale || 'en';
    const existingPage = await this.prisma.staticPage.findUnique({
      where: { slug: page.slug },
    });

    if (existingPage) {
      // Update page
      await this.prisma.staticPage.update({
        where: { id: existingPage.id },
        data: {
          isPublished: page.isPublished !== false,
        },
      });

      // Upsert translation
      await this.prisma.staticPageTranslation.upsert({
        where: {
          pageId_locale: {
            pageId: existingPage.id,
            locale,
          },
        },
        create: {
          pageId: existingPage.id,
          locale,
          slug: page.slug,
          title: page.title,
          content: page.content,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          isPublished: page.isPublished !== false,
        },
        update: {
          slug: page.slug,
          title: page.title,
          content: page.content,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          isPublished: page.isPublished !== false,
        },
      });

      return { created: false, updated: true };
    } else {
      // Create page
      const newPage = await this.prisma.staticPage.create({
        data: {
          slug: page.slug,
          pageKey: page.pageKey,
          isPublished: page.isPublished !== false,
        },
      });

      // Create translation
      await this.prisma.staticPageTranslation.create({
        data: {
          pageId: newPage.id,
          locale,
          slug: page.slug,
          title: page.title,
          content: page.content,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          isPublished: page.isPublished !== false,
        },
      });

      return { created: true, updated: false };
    }
  }

  private async throttle(): Promise<void> {
    if (this.config.throttleMs && this.config.throttleMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.throttleMs));
    }
  }

  private printSummary(): void {
    logger.group('📊 Import Summary');
    logger.info(`Total Processed: ${this.stats.totalProcessed}`);
    logger.info(`Created: ${this.stats.created}`);
    logger.info(`Updated: ${this.stats.updated}`);
    logger.info(`Skipped: ${this.stats.skipped}`);
    logger.info(`Errors: ${this.stats.errors}`);

    const duration = this.stats.completedAt.getTime() - this.stats.startedAt.getTime();
    logger.info(`Duration: ${(duration / 1000).toFixed(2)}s`);

    if (this.stats.errorLog.length > 0) {
      logger.warn('Errors encountered:');
      this.stats.errorLog.forEach((error) => {
        logger.warn(`  - ${error.item}: ${error.error}`);
      });
    }

    logger.groupEnd();
  }
}

export async function importFromJson(config?: ImporterConfig): Promise<ImportStats> {
  const { getPrismaClient, disconnectPrisma } = await import('../utils/prisma-client.js');

  const prisma = getPrismaClient();
  const importer = new JsonImporter(
    prisma,
    config || {
      dataDir: './data',
      locale: 'en',
      logProgress: true,
    }
  );

  try {
    const stats = await importer.importAll();
    return stats;
  } finally {
    await disconnectPrisma();
  }
}
