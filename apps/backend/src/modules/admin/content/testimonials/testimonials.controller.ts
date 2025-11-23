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

import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { FilterTestimonialsDto } from './dto/filter-testimonials.dto';
import { AdminTestimonialsService } from '../testimonials.service';

@Controller('admin/content/testimonials')
export class AdminTestimonialsController {
  constructor(private readonly testimonialsService: AdminTestimonialsService) {}

  @Get()
  async findAll(@Query(ValidationPipe) filters: FilterTestimonialsDto) {
    return this.testimonialsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }

  @Put(':id/position')
  async updatePosition(@Param('id') id: string, @Body('position') position: number) {
    return this.testimonialsService.updatePosition(id, position);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    return this.testimonialsService.publish(id);
  }

  @Put(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.testimonialsService.unpublish(id);
  }
}