import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CreateStaticPageDto } from './dto/create-static-page.dto';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { FilterStaticPagesDto } from './dto/filter-static-pages.dto';
import { AdminPagesService } from '../pages.service';

@Controller('admin/content/pages')
export class AdminPagesController {
  constructor(private readonly pagesService: AdminPagesService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterStaticPagesDto) {
    return this.pagesService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Get('key/:pageKey')
  async findByKey(@Param('pageKey') pageKey: string) {
    return this.pagesService.findByKey(pageKey);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateStaticPageDto) {
    return this.pagesService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateStaticPageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.pagesService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.pagesService.unpublish(id);
  }
}