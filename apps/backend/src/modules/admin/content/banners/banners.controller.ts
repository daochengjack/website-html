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

import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { FilterBannersDto } from './dto/filter-banners.dto';
import { AdminBannersService } from '../banners.service';

@Controller('admin/content/banners')
export class AdminBannersController {
  constructor(private readonly bannersService: AdminBannersService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterBannersDto) {
    return this.bannersService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }

  @Put(':id/position')
  async updatePosition(@Param('id') id: string, @Body('position') position: number) {
    return this.bannersService.updatePosition(id, position);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.bannersService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.bannersService.unpublish(id);
  }
}