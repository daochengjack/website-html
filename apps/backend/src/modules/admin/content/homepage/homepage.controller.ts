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

import { CreateHomepageSectionDto } from './dto/create-homepage-section.dto';
import { UpdateHomepageSectionDto } from './dto/update-homepage-section.dto';
import { FilterHomepageSectionsDto } from './dto/filter-homepage-sections.dto';
import { AdminHomepageService } from '../homepage.service';

@Controller('admin/content/homepage')
export class AdminHomepageController {
  constructor(private readonly homepageService: AdminHomepageService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterHomepageSectionsDto) {
    return this.homepageService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.homepageService.findOne(id);
  }

  @Get('by-key/:sectionKey')
  async findByKey(@Param('sectionKey') sectionKey: string, @Query('locale') locale: string) {
    return this.homepageService.findByKey(sectionKey, locale);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateHomepageSectionDto) {
    return this.homepageService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateHomepageSectionDto) {
    return this.homepageService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.homepageService.remove(id);
  }

  @Put(':id/position')
  async updatePosition(@Param('id') id: string, @Body('position') position: number) {
    return this.homepageService.updatePosition(id, position);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.homepageService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.homepageService.unpublish(id);
  }
}