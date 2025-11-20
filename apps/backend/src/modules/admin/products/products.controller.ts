import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { AdminProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductTranslationDto } from './dto/update-product-translation.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { ManageProductTagsDto } from './dto/manage-product-tags.dto';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({ status, categoryId, search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/translations')
  async updateTranslation(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateProductTranslationDto,
  ) {
    return this.productsService.updateTranslation(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateProductStatusDto) {
    return this.productsService.updateStatus(id, dto);
  }

  @Patch(':id/tags')
  async manageTags(@Param('id') id: string, @Body(ValidationPipe) dto: ManageProductTagsDto) {
    return this.productsService.manageTags(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
