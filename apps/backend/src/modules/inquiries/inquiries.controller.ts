import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../../common/decorators/public.decorator';
import { CaptchaGuard } from '../../common/guards/captcha.guard';

import { AddInquiryMessageDto } from './dto/add-inquiry-message.dto';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';
import { CreateProductInquiryDto } from './dto/create-product-inquiry.dto';
import { FilterInquiriesDto } from './dto/filter-inquiries.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { InquiriesService } from './inquiries.service';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post('contact')
  @Public()
  @UseGuards(CaptchaGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async createContactInquiry(@Body(ValidationPipe) dto: CreateContactInquiryDto) {
    return this.inquiriesService.createContactInquiry(dto);
  }

  @Post('product')
  @Public()
  @UseGuards(CaptchaGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async createProductInquiry(@Body(ValidationPipe) dto: CreateProductInquiryDto) {
    return this.inquiriesService.createProductInquiry(dto);
  }

  @Get('admin')
  async findAll(@Query(ValidationPipe) filters: FilterInquiriesDto) {
    return this.inquiriesService.findAll(filters);
  }

  @Get('admin/:id')
  async findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch('admin/:id/status')
  async updateStatus(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateInquiryStatusDto) {
    return this.inquiriesService.updateStatus(id, dto);
  }

  @Post('admin/:id/messages')
  async addMessage(@Param('id') id: string, @Body(ValidationPipe) dto: AddInquiryMessageDto) {
    return this.inquiriesService.addMessage(id, dto);
  }

  @Patch('admin/:id/spam')
  async markAsSpam(@Param('id') id: string) {
    return this.inquiriesService.markAsSpam(id);
  }
}
