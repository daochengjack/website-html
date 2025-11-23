import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { FilterTestimonialsDto } from './dto/filter-testimonials.dto';

@Injectable()
export class AdminTestimonialsService {
  async findAll(filters: FilterTestimonialsDto) {
    const { page = 1, limit = 10, locale, isPublished } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (locale) where.locale = locale;
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;

    const [items, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.testimonial.count({ where }),
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
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }

    return testimonial;
  }

  async create(dto: CreateTestimonialDto) {
    // Get the highest position for this locale and increment
    const maxPosition = await prisma.testimonial.findFirst({
      where: { locale: dto.locale },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = dto.position ?? (maxPosition?.position ?? 0) + 1;

    return prisma.testimonial.create({
      data: {
        ...dto,
        position,
      },
    });
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const testimonial = await this.findOne(id);

    return prisma.testimonial.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const testimonial = await this.findOne(id);

    return prisma.testimonial.delete({
      where: { id },
    });
  }

  async updatePosition(id: string, position: number) {
    const testimonial = await this.findOne(id);

    // Check if position is already taken
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        locale: testimonial.locale,
        position,
        id: { not: id },
      },
    });

    if (existingTestimonial) {
      throw new ConflictException('Position is already taken');
    }

    return prisma.testimonial.update({
      where: { id },
      data: { position },
    });
  }

  async publish(id: string) {
    const testimonial = await this.findOne(id);

    return prisma.testimonial.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    const testimonial = await this.findOne(id);

    return prisma.testimonial.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}