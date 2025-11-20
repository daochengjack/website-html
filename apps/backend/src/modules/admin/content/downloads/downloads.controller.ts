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

import { CreateDownloadDocumentDto } from './dto/create-download-document.dto';
import { UpdateDownloadDocumentDto } from './dto/update-download-document.dto';
import { FilterDownloadDocumentsDto } from './dto/filter-download-documents.dto';
import { AdminDownloadsService } from '../downloads.service';

@Controller('admin/content/downloads')
export class AdminDownloadsController {
  constructor(private readonly downloadsService: AdminDownloadsService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterDownloadDocumentsDto) {
    return this.downloadsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.downloadsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateDownloadDocumentDto) {
    return this.downloadsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateDownloadDocumentDto) {
    return this.downloadsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.downloadsService.remove(id);
  }

  @Put(':id/position')
  async updatePosition(@Param('id') id: string, @Body('position') position: number) {
    return this.downloadsService.updatePosition(id, position);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.downloadsService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.downloadsService.unpublish(id);
  }
}