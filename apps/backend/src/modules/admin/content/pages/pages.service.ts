import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateStaticPageDto } from './dto/create-static-page.dto';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { FilterStaticPagesDto } from './dto/filter-static-pages.dto';

@Injectable()
export class AdminPagesService {
  async findAll(filters: FilterStaticPagesDto) {
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
      prisma.staticPage.findMany({
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
              isPublished: true,
            },
          },
        },
        orderBy: [
          { pageKey: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.staticPage.count({ where }),
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
    const page = await prisma.staticPage.findUnique({
      where: { id },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Static page not found');
    }

    return page;
  }

  async findBySlug(slug: string) {
    const page = await prisma.staticPage.findUnique({
      where: { slug },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Static page not found');
    }

    return page;
  }

  async findByKey(pageKey: string) {
    const page = await prisma.staticPage.findUnique({
      where: { pageKey },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Static page not found');
    }

    return page;
  }

  async create(dto: CreateStaticPageDto) {
    // Check if slug or pageKey already exists
    const existingPage = await prisma.staticPage.findFirst({
      where: {
        OR: [
          { slug: dto.slug },
          { pageKey: dto.pageKey },
        ],
      },
    });

    if (existingPage) {
      if (existingPage.slug === dto.slug) {
        throw new ConflictException('Slug already exists');
      }
      if (existingPage.pageKey === dto.pageKey) {
        throw new ConflictException('Page key already exists');
      }
    }

    // Check if translation slugs already exist for each locale
    for (const translation of dto.translations) {
      const existingTranslation = await prisma.staticPageTranslation.findFirst({
        where: {
          slug: translation.slug,
          locale: translation.locale,
        },
      });

      if (existingTranslation) {
        throw new ConflictException(`Translation slug "${translation.slug}" already exists for locale "${translation.locale}"`);
      }
    }

    return prisma.staticPage.create({
      data: {
        slug: dto.slug,
        pageKey: dto.pageKey,
        isPublished: dto.isPublished,
        translations: {
          create: dto.translations.map(translation => ({
            ...translation,
          })),
        },
      },
      include: {
        translations: true,
      },
    });
  }

  async update(id: string, dto: UpdateStaticPageDto) {
    const page = await this.findOne(id);

    // Check if new slug or pageKey conflicts with existing pages
    if (dto.slug || dto.pageKey) {
      const newSlug = dto.slug ?? page.slug;
      const newPageKey = dto.pageKey ?? page.pageKey;

      const existingPage = await prisma.staticPage.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { slug: newSlug },
                { pageKey: newPageKey },
              ],
            },
          ],
        },
      });

      if (existingPage) {
        if (existingPage.slug === newSlug) {
          throw new ConflictException('Slug already exists');
        }
        if (existingPage.pageKey === newPageKey) {
          throw new ConflictException('Page key already exists');
        }
      }
    }

    // Check for translation slug conflicts
    if (dto.translations) {
      for (const translation of dto.translations) {
        if (translation.slug) {
          const existingTranslation = await prisma.staticPageTranslation.findFirst({
            where: {
              slug: translation.slug,
              locale: translation.locale,
              pageId: { not: id },
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
    if (dto.pageKey !== undefined) updateData.pageKey = dto.pageKey;
    if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;

    if (dto.translations) {
      updateData.translations = {
        upsert: dto.translations.map(translation => ({
          where: {
            pageId_locale: {
              pageId: id,
              locale: translation.locale,
            },
          },
          update: translation,
          create: translation,
        })),
      };
    }

    return prisma.staticPage.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
      },
    });
  }

  async remove(id: string) {
    const page = await this.findOne(id);

    return prisma.staticPage.delete({
      where: { id },
    });
  }

  async publish(id: string) {
    const page = await this.findOne(id);

    return prisma.staticPage.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    const page = await this.findOne(id);

    return prisma.staticPage.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}