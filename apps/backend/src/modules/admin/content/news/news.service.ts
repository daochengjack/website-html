import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { FilterNewsArticlesDto } from './dto/filter-news-articles.dto';

@Injectable()
export class AdminNewsService {
  async findAll(filters: FilterNewsArticlesDto) {
    const { page = 1, limit = 10, locale, isPublished } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }
    if (locale) {
      where.translations = {
        some: { locale }
      };
    }

    const [items, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        skip,
        take: limit,
        include: {
          translations: {
            where: locale ? { locale } : undefined,
            select: {
              locale: true,
              title: true,
              slug: true,
              excerpt: true,
              isPublished: true,
              publishedAt: true,
            },
          },
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.newsArticle.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const article = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('News article not found');
    }

    return article;
  }

  async findBySlug(slug: string) {
    const article = await prisma.newsArticle.findUnique({
      where: { slug },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('News article not found');
    }

    return article;
  }

  async create(dto: CreateNewsArticleDto) {
    // Check if slug already exists
    const existingArticle = await prisma.newsArticle.findUnique({
      where: { slug: dto.slug },
    });

    if (existingArticle) {
      throw new ConflictException('Slug already exists');
    }

    // Check if translation slugs already exist for each locale
    for (const translation of dto.translations) {
      const existingTranslation = await prisma.newsArticleTranslation.findFirst({
        where: {
          slug: translation.slug,
          locale: translation.locale,
        },
      });

      if (existingTranslation) {
        throw new ConflictException(`Translation slug "${translation.slug}" already exists for locale "${translation.locale}"`);
      }
    }

    return prisma.newsArticle.create({
      data: {
        slug: dto.slug,
        featuredImageUrl: dto.featuredImageUrl,
        authorName: dto.authorName,
        translations: {
          create: dto.translations.map(translation => ({
            ...translation,
            publishedAt: translation.isPublished ? new Date() : null,
          })),
        },
      },
      include: {
        translations: true,
      },
    });
  }

  async update(id: string, dto: UpdateNewsArticleDto) {
    const article = await this.findOne(id);

    // Check if new slug conflicts with existing articles
    if (dto.slug && dto.slug !== article.slug) {
      const existingArticle = await prisma.newsArticle.findUnique({
        where: { slug: dto.slug },
      });

      if (existingArticle) {
        throw new ConflictException('Slug already exists');
      }
    }

    // Check for translation slug conflicts
    if (dto.translations) {
      for (const translation of dto.translations) {
        if (translation.slug) {
          const existingTranslation = await prisma.newsArticleTranslation.findFirst({
            where: {
              slug: translation.slug,
              locale: translation.locale,
              articleId: { not: id },
            },
          });

          if (existingTranslation) {
            throw new ConflictException(`Translation slug "${translation.slug}" already exists for locale "${translation.locale}"`);
          }
        }
      }
    }

    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.featuredImageUrl !== undefined) updateData.featuredImageUrl = dto.featuredImageUrl;
    if (dto.authorName !== undefined) updateData.authorName = dto.authorName;

    if (dto.translations) {
      updateData.translations = {
        upsert: dto.translations.map(translation => ({
          where: {
            articleId_locale: {
              articleId: id,
              locale: translation.locale,
            },
          },
          update: {
            ...translation,
            publishedAt: translation.isPublished && !article.translations.find(t => t.locale === translation.locale)?.isPublished 
              ? new Date() 
              : translation.publishedAt,
          },
          create: {
            ...translation,
            publishedAt: translation.isPublished ? new Date() : null,
          },
        })),
      };
    }

    return prisma.newsArticle.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
      },
    });
  }

  async remove(id: string) {
    const article = await this.findOne(id);

    return prisma.newsArticle.delete({
      where: { id },
    });
  }

  async publish(id: string) {
    const article = await this.findOne(id);

    return prisma.newsArticle.update({
      where: { id },
      data: { 
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async unpublish(id: string) {
    const article = await this.findOne(id);

    return prisma.newsArticle.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async updateFeaturedImage(id: string, imageUrl: string) {
    const article = await this.findOne(id);

    return prisma.newsArticle.update({
      where: { id },
      data: { featuredImageUrl: imageUrl },
    });
  }
}