import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateDownloadDocumentDto } from './dto/create-download-document.dto';
import { UpdateDownloadDocumentDto } from './dto/update-download-document.dto';
import { FilterDownloadDocumentsDto } from './dto/filter-download-documents.dto';

@Injectable()
export class AdminDownloadsService {
  async findAll(filters: FilterDownloadDocumentsDto) {
    const { page = 1, limit = 10, locale, categoryKey, isPublished } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (locale) where.locale = locale;
    if (categoryKey) where.categoryKey = categoryKey;
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;

    const [items, total] = await Promise.all([
      prisma.downloadDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.downloadDocument.count({ where }),
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
    const document = await prisma.downloadDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Download document not found');
    }

    return document;
  }

  async create(dto: CreateDownloadDocumentDto) {
    // Get the highest position for this locale and category and increment
    const maxPosition = await prisma.downloadDocument.findFirst({
      where: { 
        locale: dto.locale,
        categoryKey: dto.categoryKey,
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = dto.position ?? (maxPosition?.position ?? 0) + 1;

    return prisma.downloadDocument.create({
      data: {
        ...dto,
        position,
      },
    });
  }

  async update(id: string, dto: UpdateDownloadDocumentDto) {
    const document = await this.findOne(id);

    return prisma.downloadDocument.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const document = await this.findOne(id);

    return prisma.downloadDocument.delete({
      where: { id },
    });
  }

  async updatePosition(id: string, position: number) {
    const document = await this.findOne(id);

    // Check if position is already taken
    const existingDocument = await prisma.downloadDocument.findFirst({
      where: {
        locale: document.locale,
        categoryKey: document.categoryKey,
        position,
        id: { not: id },
      },
    });

    if (existingDocument) {
      throw new ConflictException('Position is already taken');
    }

    return prisma.downloadDocument.update({
      where: { id },
      data: { position },
    });
  }

  async publish(id: string) {
    const document = await this.findOne(id);

    return prisma.downloadDocument.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    const document = await this.findOne(id);

    return prisma.downloadDocument.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}