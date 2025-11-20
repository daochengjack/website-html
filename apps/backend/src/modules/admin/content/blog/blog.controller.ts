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

import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { FilterBlogPostsDto } from './dto/filter-blog-posts.dto';
import { AdminBlogService } from '../blog.service';

@Controller('admin/content/blog')
export class AdminBlogController {
  constructor(private readonly blogService: AdminBlogService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterBlogPostsDto) {
    return this.blogService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.blogService.unpublish(id);
  }

  @Put(':id/featured-image')
  async updateFeaturedImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    return this.blogService.updateFeaturedImage(id, imageUrl);
  }
}