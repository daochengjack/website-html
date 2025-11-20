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

import { CreateClientLogoDto } from './dto/create-client-logo.dto';
import { UpdateClientLogoDto } from './dto/update-client-logo.dto';
import { FilterClientLogosDto } from './dto/filter-client-logos.dto';
import { AdminClientLogosService } from '../client-logos.service';

@Controller('admin/content/client-logos')
export class AdminClientLogosController {
  constructor(private readonly clientLogosService: AdminClientLogosService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterClientLogosDto) {
    return this.clientLogosService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientLogosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateClientLogoDto) {
    return this.clientLogosService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateClientLogoDto) {
    return this.clientLogosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.clientLogosService.remove(id);
  }

  @Put(':id/position')
  async updatePosition(@Param('id') id: string, @Body('position') position: number) {
    return this.clientLogosService.updatePosition(id, position);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.clientLogosService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.clientLogosService.unpublish(id);
  }
}