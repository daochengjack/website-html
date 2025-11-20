import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { AdminCategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoryTranslationDto } from './dto/update-category-translation.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Patch(':id/translations')
  async updateTranslation(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateCategoryTranslationDto,
  ) {
    return this.categoriesService.updateTranslation(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }

  @Post('reorder')
  async reorder(@Body(ValidationPipe) dto: ReorderCategoriesDto) {
    return this.categoriesService.reorder(dto);
  }
}
