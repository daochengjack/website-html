import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { FilterBlogPostsDto } from './dto/filter-blog-posts.dto';

@Injectable()
export class AdminBlogService {
  async findAll(filters: FilterBlogPostsDto) {
    const { page = 1, limit = 10, locale, isPublished, categorySlug } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }
    if (categorySlug) {
      where.categorySlug = categorySlug;
    }
    if (locale) {
      where.translations = {
        some: { locale }
      };
    }

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
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
              tags: true,
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
      prisma.blogPost.count({ where }),
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
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async findBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async create(dto: CreateBlogPostDto) {
    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: dto.slug },
    });

    if (existingPost) {
      throw new ConflictException('Slug already exists');
    }

    // Check if translation slugs already exist for each locale
    for (const translation of dto.translations) {
      const existingTranslation = await prisma.blogPostTranslation.findFirst({
        where: {
          slug: translation.slug,
          locale: translation.locale,
        },
      });

      if (existingTranslation) {
        throw new ConflictException(`Translation slug "${translation.slug}" already exists for locale "${translation.locale}"`);
      }
    }

    return prisma.blogPost.create({
      data: {
        slug: dto.slug,
        categorySlug: dto.categorySlug,
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

  async update(id: string, dto: UpdateBlogPostDto) {
    const post = await this.findOne(id);

    // Check if new slug conflicts with existing posts
    if (dto.slug && dto.slug !== post.slug) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });

      if (existingPost) {
        throw new ConflictException('Slug already exists');
      }
    }

    // Check for translation slug conflicts
    if (dto.translations) {
      for (const translation of dto.translations) {
        if (translation.slug) {
          const existingTranslation = await prisma.blogPostTranslation.findFirst({
            where: {
              slug: translation.slug,
              locale: translation.locale,
              postId: { not: id },
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
    if (dto.categorySlug !== undefined) updateData.categorySlug = dto.categorySlug;
    if (dto.featuredImageUrl !== undefined) updateData.featuredImageUrl = dto.featuredImageUrl;
    if (dto.authorName !== undefined) updateData.authorName = dto.authorName;

    if (dto.translations) {
      updateData.translations = {
        upsert: dto.translations.map(translation => ({
          where: {
            postId_locale: {
              postId: id,
              locale: translation.locale,
            },
          },
          update: {
            ...translation,
            publishedAt: translation.isPublished && !post.translations.find(t => t.locale === translation.locale)?.isPublished 
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

    return prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
      },
    });
  }

  async remove(id: string) {
    const post = await this.findOne(id);

    return prisma.blogPost.delete({
      where: { id },
    });
  }

  async publish(id: string) {
    const post = await this.findOne(id);

    return prisma.blogPost.update({
      where: { id },
      data: { 
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async unpublish(id: string) {
    const post = await this.findOne(id);

    return prisma.blogPost.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async updateFeaturedImage(id: string, imageUrl: string) {
    const post = await this.findOne(id);

    return prisma.blogPost.update({
      where: { id },
      data: { featuredImageUrl: imageUrl },
    });
  }
}