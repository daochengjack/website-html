import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateClientLogoDto } from './dto/create-client-logo.dto';
import { UpdateClientLogoDto } from './dto/update-client-logo.dto';
import { FilterClientLogosDto } from './dto/filter-client-logos.dto';

@Injectable()
export class AdminClientLogosService {
  async findAll(filters: FilterClientLogosDto) {
    const { page = 1, limit = 10, isPublished } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;

    const [items, total] = await Promise.all([
      prisma.clientLogo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.clientLogo.count({ where }),
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
    const logo = await prisma.clientLogo.findUnique({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundException('Client logo not found');
    }

    return logo;
  }

  async create(dto: CreateClientLogoDto) {
    // Get the highest position and increment
    const maxPosition = await prisma.clientLogo.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = dto.position ?? (maxPosition?.position ?? 0) + 1;

    return prisma.clientLogo.create({
      data: {
        ...dto,
        position,
      },
    });
  }

  async update(id: string, dto: UpdateClientLogoDto) {
    const logo = await this.findOne(id);

    return prisma.clientLogo.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const logo = await this.findOne(id);

    return prisma.clientLogo.delete({
      where: { id },
    });
  }

  async updatePosition(id: string, position: number) {
    const logo = await this.findOne(id);

    // Check if position is already taken
    const existingLogo = await prisma.clientLogo.findFirst({
      where: {
        position,
        id: { not: id },
      },
    });

    if (existingLogo) {
      throw new ConflictException('Position is already taken');
    }

    return prisma.clientLogo.update({
      where: { id },
      data: { position },
    });
  }

  async publish(id: string) {
    const logo = await this.findOne(id);

    return prisma.clientLogo.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    const logo = await this.findOne(id);

    return prisma.clientLogo.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}