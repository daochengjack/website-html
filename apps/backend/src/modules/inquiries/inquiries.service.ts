import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma as db } from '@repo/db';

import { EmailService } from '../../services/email/email.service';
import {
  generateInquiryNotificationHtml,
  generateInquiryNotificationText,
  InquiryNotificationData,
} from '../../services/email/templates/inquiry-notification.template';
import { JobService } from '../../services/job/job.service';

import { AddInquiryMessageDto } from './dto/add-inquiry-message.dto';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';
import { CreateProductInquiryDto } from './dto/create-product-inquiry.dto';
import { FilterInquiriesDto } from './dto/filter-inquiries.dto';
import { UpdateInquiryStatusDto, InquiryStatusType } from './dto/update-inquiry-status.dto';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);
  private readonly prisma = db;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly jobService: JobService,
  ) {}

  async createContactInquiry(dto: CreateContactInquiryDto) {
    try {
      const newStatus = await this.prisma.inquiryStatus.findFirst({
        where: { slug: InquiryStatusType.NEW },
      });

      if (!newStatus) {
        throw new BadRequestException('Inquiry status configuration error');
      }

      const refNumber = this.generateRefNumber();

      const inquiry = await this.prisma.inquiry.create({
        data: {
          refNumber,
          statusId: newStatus.id,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          companyName: dto.companyName,
          subject: dto.subject,
          initialMessage: dto.message,
        },
        include: {
          status: true,
        },
      });

      await this.sendInquiryNotification(inquiry, dto.sourcePage);

      this.logger.log(`Contact inquiry created: ${inquiry.refNumber}`);

      return {
        success: true,
        data: {
          id: inquiry.id,
          refNumber: inquiry.refNumber,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create contact inquiry: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createProductInquiry(dto: CreateProductInquiryDto) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        include: {
          translations: {
            where: { locale: 'en' },
            take: 1,
          },
        },
      });

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      const newStatus = await this.prisma.inquiryStatus.findFirst({
        where: { slug: InquiryStatusType.NEW },
      });

      if (!newStatus) {
        throw new BadRequestException('Inquiry status configuration error');
      }

      const refNumber = this.generateRefNumber();
      const subject =
        dto.subject || `Product inquiry: ${product.translations[0]?.name || product.sku}`;

      const inquiry = await this.prisma.inquiry.create({
        data: {
          refNumber,
          statusId: newStatus.id,
          productId: dto.productId,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          companyName: dto.companyName,
          subject,
          initialMessage: dto.message,
        },
        include: {
          status: true,
          product: {
            include: {
              translations: {
                where: { locale: 'en' },
                take: 1,
              },
            },
          },
        },
      });

      await this.sendInquiryNotification(inquiry, dto.sourcePage, product);

      this.logger.log(`Product inquiry created: ${inquiry.refNumber}`);

      return {
        success: true,
        data: {
          id: inquiry.id,
          refNumber: inquiry.refNumber,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create product inquiry: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(filters: FilterInquiriesDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (filters.status) {
      const status = await this.prisma.inquiryStatus.findFirst({
        where: { slug: filters.status },
      });
      if (status) {
        whereClause.statusId = status.id;
      }
    }

    if (filters.productId) {
      whereClause.productId = filters.productId;
    }

    if (filters.assignedToId) {
      whereClause.assignedToId = filters.assignedToId;
    }

    if (filters.customerEmail) {
      whereClause.customerEmail = { contains: filters.customerEmail, mode: 'insensitive' };
    }

    if (filters.search) {
      whereClause.OR = [
        { refNumber: { contains: filters.search, mode: 'insensitive' } },
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { customerEmail: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { initialMessage: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          status: true,
          product: {
            include: {
              translations: {
                where: { locale: 'en' },
                take: 1,
              },
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.inquiry.count({ where: whereClause }),
    ]);

    return {
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        status: true,
        product: {
          include: {
            translations: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    return inquiry;
  }

  async updateStatus(id: string, dto: UpdateInquiryStatusDto, userId?: string) {
    const inquiry = await this.findOne(id);

    const status = await this.prisma.inquiryStatus.findFirst({
      where: { slug: dto.status },
    });

    if (!status) {
      throw new BadRequestException('Invalid status');
    }

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: {
        statusId: status.id,
      },
      include: {
        status: true,
      },
    });

    if (dto.note) {
      await this.addMessage(
        id,
        {
          message: `Status changed to ${dto.status}. Note: ${dto.note}`,
          isInternal: true,
        },
        userId,
      );
    }

    this.logger.log(`Inquiry ${inquiry.refNumber} status updated to ${dto.status}`);

    return updated;
  }

  async addMessage(id: string, dto: AddInquiryMessageDto, userId?: string) {
    const inquiry = await this.findOne(id);

    const message = await this.prisma.inquiryMessage.create({
      data: {
        inquiryId: id,
        userId: userId,
        senderName: userId ? 'Admin' : inquiry.customerName,
        senderEmail: userId ? undefined : inquiry.customerEmail,
        message: dto.message,
        isInternal: dto.isInternal ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Message added to inquiry ${inquiry.refNumber}`);

    return message;
  }

  async markAsSpam(id: string, userId?: string) {
    return this.updateStatus(
      id,
      {
        status: InquiryStatusType.SPAM,
        note: 'Marked as spam',
      },
      userId,
    );
  }

  private generateRefNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INQ-${timestamp}-${random}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async sendInquiryNotification(inquiry: any, sourcePage?: string, product?: any) {
    const recipients = this.configService
      .get<string>('INQUIRY_NOTIFICATION_EMAILS', 'admin@example.com')
      .split(',');
    const baseUrl = this.configService.get<string>('ADMIN_BASE_URL', 'http://localhost:3000');

    const notificationData: InquiryNotificationData = {
      inquiryRefNumber: inquiry.refNumber,
      customerName: inquiry.customerName,
      customerEmail: inquiry.customerEmail,
      customerPhone: inquiry.customerPhone,
      companyName: inquiry.companyName,
      subject: inquiry.subject,
      message: inquiry.initialMessage,
      productId: inquiry.productId,
      productName: product?.translations?.[0]?.name,
      productSku: product?.sku,
      sourcePage,
      inquiryUrl: `${baseUrl}/admin/inquiries/${inquiry.id}`,
    };

    const html = generateInquiryNotificationHtml(notificationData);
    const text = generateInquiryNotificationText(notificationData);

    await this.jobService.enqueueEmailJob({
      recipients,
      subject: `New Inquiry: ${inquiry.subject}`,
      html,
      text,
    });

    await this.emailService.sendInquiryNotification(
      recipients,
      `New Inquiry: ${inquiry.subject}`,
      html,
      text,
    );
  }
}
