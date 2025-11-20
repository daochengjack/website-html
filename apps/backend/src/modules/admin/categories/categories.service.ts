import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoryTranslationDto } from './dto/update-category-translation.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Injectable()
export class AdminCategoriesService {
  async findAll() {
    return prisma.productCategory.findMany({
      include: {
        translations: true,
        children: {
          include: {
            translations: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        translations: true,
        parent: true,
        children: {
          include: {
            translations: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const { locale, name, description, metaTitle, metaDescription, ogImage, ...categoryData } = dto;

    // Validate slug uniqueness
    const existing = await prisma.productCategory.findUnique({
      where: { slug: categoryData.slug },
    });

    if (existing) {
      throw new BadRequestException(`Category slug "${categoryData.slug}" already exists`);
    }

    // Generate path
    let path = `/${categoryData.slug}`;
    if (categoryData.parentId) {
      const parent = await prisma.productCategory.findUnique({
        where: { id: categoryData.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${categoryData.parentId} not found`);
      }

      path = `${parent.path}/${categoryData.slug}`;
    }

    return prisma.productCategory.create({
      data: {
        ...categoryData,
        path,
        translations: {
          create: [
            {
              locale,
              name,
              description,
              metaTitle,
              metaDescription,
              ogImage,
            },
          ],
        },
      },
      include: {
        translations: true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const { locale, name, description, metaTitle, metaDescription, ogImage, ...categoryData } = dto;

    // Check if slug is being changed and if it's unique
    if (categoryData.slug && categoryData.slug !== category.slug) {
      const existing = await prisma.productCategory.findUnique({
        where: { slug: categoryData.slug },
      });

      if (existing) {
        throw new BadRequestException(`Category slug "${categoryData.slug}" already exists`);
      }
    }

    // If parentId is being changed, update path
    let newPath = category.path;
    if (categoryData.parentId && categoryData.parentId !== category.parentId) {
      const parent = await prisma.productCategory.findUnique({
        where: { id: categoryData.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${categoryData.parentId} not found`);
      }

      const slug = categoryData.slug || category.slug;
      newPath = `${parent.path}/${slug}`;
    } else if (categoryData.slug && categoryData.slug !== category.slug) {
      newPath = category.path.substring(0, category.path.lastIndexOf('/')) + '/' + categoryData.slug;
    }

    const updateData: any = {
      ...categoryData,
      ...(newPath !== category.path && { path: newPath }),
    };

    // Update translation if locale-specific data provided
    if (locale && (name || description !== undefined)) {
      const existingTranslation = await prisma.productCategoryTranslation.findUnique({
        where: { categoryId_locale: { categoryId: id, locale } },
      });

      if (existingTranslation) {
        await prisma.productCategoryTranslation.update({
          where: { categoryId_locale: { categoryId: id, locale } },
          data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(metaTitle !== undefined && { metaTitle }),
            ...(metaDescription !== undefined && { metaDescription }),
            ...(ogImage !== undefined && { ogImage }),
          },
        });
      } else {
        await prisma.productCategoryTranslation.create({
          data: {
            categoryId: id,
            locale,
            name: name || 'Untitled',
            description,
            metaTitle,
            metaDescription,
            ogImage,
          },
        });
      }
    }

    return prisma.productCategory.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
      },
    });
  }

  async updateTranslation(id: string, dto: UpdateCategoryTranslationDto) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const existing = await prisma.productCategoryTranslation.findUnique({
      where: { categoryId_locale: { categoryId: id, locale: dto.locale } },
    });

    if (existing) {
      return prisma.productCategoryTranslation.update({
        where: { categoryId_locale: { categoryId: id, locale: dto.locale } },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
          ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
          ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
          ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
        },
      });
    }

    return prisma.productCategoryTranslation.create({
      data: {
        categoryId: id,
        locale: dto.locale,
        name: dto.name || 'Untitled',
        description: dto.description,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogImage: dto.ogImage,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async delete(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return prisma.productCategory.delete({
      where: { id },
    });
  }

  async reorder(dto: ReorderCategoriesDto) {
    const updates = dto.items.map((item) =>
      prisma.productCategory.update({
        where: { id: item.id },
        data: { position: item.position },
      }),
    );

    await Promise.all(updates);

    return { success: true, message: 'Categories reordered successfully' };
  }
}
