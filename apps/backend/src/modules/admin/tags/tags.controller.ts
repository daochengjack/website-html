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

import { AdminTagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateTagTranslationDto } from './dto/update-tag-translation.dto';

@Controller('admin/tags')
export class AdminTagsController {
  constructor(private readonly tagsService: AdminTagsService) {}

  @Get()
  async findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @Patch(':id/translations')
  async updateTranslation(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateTagTranslationDto,
  ) {
    return this.tagsService.updateTranslation(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tagsService.delete(id);
  }
}
