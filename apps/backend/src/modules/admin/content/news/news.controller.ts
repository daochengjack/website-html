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

import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { FilterNewsArticlesDto } from './dto/filter-news-articles.dto';
import { AdminNewsService } from '../news.service';

@Controller('admin/content/news')
export class AdminNewsController {
  constructor(private readonly newsService: AdminNewsService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterNewsArticlesDto) {
    return this.newsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateNewsArticleDto) {
    return this.newsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateNewsArticleDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.newsService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.newsService.unpublish(id);
  }

  @Put(':id/featured-image')
  async updateFeaturedImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    return this.newsService.updateFeaturedImage(id, imageUrl);
  }
}