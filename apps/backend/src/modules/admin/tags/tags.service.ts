import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateTagTranslationDto } from './dto/update-tag-translation.dto';

@Injectable()
export class AdminTagsService {
  async findAll() {
    return prisma.productTag.findMany({
      include: {
        translations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tag = await prisma.productTag.findUnique({
      where: { id },
      include: {
        translations: true,
        productMappings: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async create(dto: CreateTagDto) {
    const { translation, ...tagData } = dto;

    // Validate slug uniqueness
    const existing = await prisma.productTag.findUnique({
      where: { slug: tagData.slug },
    });

    if (existing) {
      throw new BadRequestException(`Tag slug "${tagData.slug}" already exists`);
    }

    return prisma.productTag.create({
      data: {
        ...tagData,
        translations: {
          create: [translation],
        },
      },
      include: {
        translations: true,
      },
    });
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await prisma.productTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // Check if slug is being changed and if it's unique
    if (dto.slug && dto.slug !== tag.slug) {
      const existing = await prisma.productTag.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new BadRequestException(`Tag slug "${dto.slug}" already exists`);
      }
    }

    return prisma.productTag.update({
      where: { id },
      data: dto,
      include: {
        translations: true,
      },
    });
  }

  async updateTranslation(id: string, dto: UpdateTagTranslationDto) {
    const tag = await prisma.productTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    const existing = await prisma.productTagTranslation.findUnique({
      where: { tagId_locale: { tagId: id, locale: dto.locale } },
    });

    if (existing) {
      return prisma.productTagTranslation.update({
        where: { tagId_locale: { tagId: id, locale: dto.locale } },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
        },
      });
    }

    return prisma.productTagTranslation.create({
      data: {
        tagId: id,
        locale: dto.locale,
        name: dto.name || 'Untitled',
        isPublished: dto.isPublished ?? true,
      },
    });
  }

  async delete(id: string) {
    const tag = await prisma.productTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return prisma.productTag.delete({
      where: { id },
    });
  }
}
