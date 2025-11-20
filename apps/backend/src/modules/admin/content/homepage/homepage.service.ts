import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateHomepageSectionDto } from './dto/create-homepage-section.dto';
import { UpdateHomepageSectionDto } from './dto/update-homepage-section.dto';
import { FilterHomepageSectionsDto } from './dto/filter-homepage-sections.dto';

@Injectable()
export class AdminHomepageService {
  async findAll(filters: FilterHomepageSectionsDto) {
    const { page = 1, limit = 10, locale, sectionKey, isPublished } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (locale) where.locale = locale;
    if (sectionKey) where.sectionKey = sectionKey;
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;

    const [items, total] = await Promise.all([
      prisma.homepageSection.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.homepageSection.count({ where }),
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
    const section = await prisma.homepageSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Homepage section not found');
    }

    return section;
  }

  async findByKey(sectionKey: string, locale: string) {
    const section = await prisma.homepageSection.findUnique({
      where: {
        locale_sectionKey: {
          locale,
          sectionKey,
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Homepage section not found');
    }

    return section;
  }

  async create(dto: CreateHomepageSectionDto) {
    // Check if section key already exists for this locale
    const existing = await prisma.homepageSection.findUnique({
      where: {
        locale_sectionKey: {
          locale: dto.locale,
          sectionKey: dto.sectionKey,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Section key already exists for this locale');
    }

    // Get the highest position and increment
    const maxPosition = await prisma.homepageSection.findFirst({
      where: { locale: dto.locale },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = dto.position ?? (maxPosition?.position ?? 0) + 1;

    return prisma.homepageSection.create({
      data: {
        ...dto,
        position,
      },
    });
  }

  async update(id: string, dto: UpdateHomepageSectionDto) {
    const section = await this.findOne(id);

    // If updating section key or locale, check for conflicts
    if (dto.sectionKey || dto.locale) {
      const newLocale = dto.locale ?? section.locale;
      const newSectionKey = dto.sectionKey ?? section.sectionKey;

      if (newLocale !== section.locale || newSectionKey !== section.sectionKey) {
        const existing = await prisma.homepageSection.findUnique({
          where: {
            locale_sectionKey: {
              locale: newLocale,
              sectionKey: newSectionKey,
            },
          },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException('Section key already exists for this locale');
        }
      }
    }

    return prisma.homepageSection.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const section = await this.findOne(id);

    return prisma.homepageSection.delete({
      where: { id },
    });
  }

  async updatePosition(id: string, position: number) {
    const section = await this.findOne(id);

    // Check if position is already taken
    const existingSection = await prisma.homepageSection.findFirst({
      where: {
        locale: section.locale,
        position,
        id: { not: id },
      },
    });

    if (existingSection) {
      throw new ConflictException('Position is already taken');
    }

    return prisma.homepageSection.update({
      where: { id },
      data: { position },
    });
  }

  async publish(id: string) {
    const section = await this.findOne(id);

    return prisma.homepageSection.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    const section = await this.findOne(id);

    return prisma.homepageSection.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}