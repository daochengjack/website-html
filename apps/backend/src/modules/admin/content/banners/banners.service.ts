import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { FilterBannersDto } from './dto/filter-banners.dto';

@Injectable()
export class AdminBannersService {
  async findAll(filters: FilterBannersDto) {
    const { page = 1, limit = 10, locale, isPublished } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (locale) where.locale = locale;
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;

    const [items, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.banner.count({ where }),
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
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async create(dto: CreateBannerDto) {
    // Get the highest position for this locale and increment
    const maxPosition = await prisma.banner.findFirst({
      where: { locale: dto.locale },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = dto.position ?? (maxPosition?.position ?? 0) + 1;

    return prisma.banner.create({
      data: {
        ...dto,
        position,
      },
    });
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.findOne(id);

    return prisma.banner.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const banner = await this.findOne(id);

    return prisma.banner.delete({
      where: { id },
    });
  }

  async updatePosition(id: string, position: number) {
    const banner = await this.findOne(id);

    // Check if position is already taken
    const existingBanner = await prisma.banner.findFirst({
      where: {
        locale: banner.locale,
        position,
        id: { not: id },
      },
    });

    if (existingBanner) {
      throw new ConflictException('Position is already taken');
    }

    return prisma.banner.update({
      where: { id },
      data: { position },
    });
  }

  async publish(id: string) {
    const banner = await this.findOne(id);

    return prisma.banner.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    const banner = await this.findOne(id);

    return prisma.banner.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}