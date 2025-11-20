import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../../services/email/email.service';
import { JobService } from '../../services/job/job.service';

import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';
import { CreateProductInquiryDto } from './dto/create-product-inquiry.dto';
import { InquiryStatusType } from './dto/update-inquiry-status.dto';
import { InquiriesService } from './inquiries.service';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    inquiry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    inquiryStatus: {
      findFirst: jest.fn(),
    },
    inquiryMessage: {
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('InquiriesService', () => {
  let service: InquiriesService;
  let emailService: EmailService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jobService: JobService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiriesService,
        {
          provide: ConfigService,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            get: jest.fn((key: string, defaultValue?: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const config: Record<string, any> = {
                INQUIRY_NOTIFICATION_EMAILS: 'test@example.com',
                ADMIN_BASE_URL: 'http://localhost:3000',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendInquiryNotification: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: JobService,
          useValue: {
            enqueueEmailJob: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<InquiriesService>(InquiriesService);
    emailService = module.get<EmailService>(EmailService);
    jobService = module.get<JobService>(JobService);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma = (service as any).prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createContactInquiry', () => {
    it('should create a contact inquiry successfully', async () => {
      const dto: CreateContactInquiryDto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        companyName: 'ACME Corp',
        subject: 'General Inquiry',
        message: 'This is a test message',
        sourcePage: 'https://example.com/contact',
      };

      const mockStatus = { id: 'status-1', slug: 'new', name: 'New' };
      const mockInquiry = {
        id: 'inquiry-1',
        refNumber: 'INQ-123',
        statusId: mockStatus.id,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        subject: dto.subject,
        initialMessage: dto.message,
        status: mockStatus,
      };

      prisma.inquiryStatus.findFirst.mockResolvedValue(mockStatus);
      prisma.inquiry.create.mockResolvedValue(mockInquiry);

      const result = await service.createContactInquiry(dto);

      expect(result.success).toBe(true);
      expect(result.data.refNumber).toBe(mockInquiry.refNumber);
      expect(prisma.inquiryStatus.findFirst).toHaveBeenCalledWith({
        where: { slug: InquiryStatusType.NEW },
      });
      expect(prisma.inquiry.create).toHaveBeenCalled();
      expect(emailService.sendInquiryNotification).toHaveBeenCalled();
    });

    it('should throw error if status not found', async () => {
      prisma.inquiryStatus.findFirst.mockResolvedValue(null);

      const dto: CreateContactInquiryDto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
      };

      await expect(service.createContactInquiry(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createProductInquiry', () => {
    it('should create a product inquiry successfully', async () => {
      const dto: CreateProductInquiryDto = {
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        productId: 'product-1',
        message: 'Interested in this product',
      };

      const mockProduct = {
        id: 'product-1',
        sku: 'PROD-001',
        translations: [{ name: 'Test Product', locale: 'en' }],
      };

      const mockStatus = { id: 'status-1', slug: 'new', name: 'New' };
      const mockInquiry = {
        id: 'inquiry-1',
        refNumber: 'INQ-456',
        statusId: mockStatus.id,
        productId: dto.productId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        initialMessage: dto.message,
        status: mockStatus,
        product: mockProduct,
      };

      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.inquiryStatus.findFirst.mockResolvedValue(mockStatus);
      prisma.inquiry.create.mockResolvedValue(mockInquiry);

      const result = await service.createProductInquiry(dto);

      expect(result.success).toBe(true);
      expect(result.data.refNumber).toBe(mockInquiry.refNumber);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: dto.productId },
        include: {
          translations: {
            where: { locale: 'en' },
            take: 1,
          },
        },
      });
    });

    it('should throw error if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const dto: CreateProductInquiryDto = {
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        productId: 'invalid-product',
        message: 'Test message',
      };

      await expect(service.createProductInquiry(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated inquiries', async () => {
      const mockInquiries = [
        {
          id: 'inquiry-1',
          refNumber: 'INQ-001',
          subject: 'Test 1',
          status: { slug: 'new' },
        },
        {
          id: 'inquiry-2',
          refNumber: 'INQ-002',
          subject: 'Test 2',
          status: { slug: 'new' },
        },
      ];

      prisma.inquiry.findMany.mockResolvedValue(mockInquiries);
      prisma.inquiry.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockInquiries);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a single inquiry', async () => {
      const mockInquiry = {
        id: 'inquiry-1',
        refNumber: 'INQ-001',
        subject: 'Test',
        messages: [],
      };

      prisma.inquiry.findUnique.mockResolvedValue(mockInquiry);

      const result = await service.findOne('inquiry-1');

      expect(result).toEqual(mockInquiry);
      expect(prisma.inquiry.findUnique).toHaveBeenCalledWith({
        where: { id: 'inquiry-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if inquiry not found', async () => {
      prisma.inquiry.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update inquiry status', async () => {
      const mockInquiry = {
        id: 'inquiry-1',
        refNumber: 'INQ-001',
        statusId: 'status-1',
      };

      const mockNewStatus = {
        id: 'status-2',
        slug: 'acknowledged',
        name: 'Acknowledged',
      };

      const mockUpdatedInquiry = {
        ...mockInquiry,
        statusId: mockNewStatus.id,
        status: mockNewStatus,
      };

      prisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      prisma.inquiryStatus.findFirst.mockResolvedValue(mockNewStatus);
      prisma.inquiry.update.mockResolvedValue(mockUpdatedInquiry);

      const result = await service.updateStatus('inquiry-1', {
        status: InquiryStatusType.ACKNOWLEDGED,
      });

      expect(result.statusId).toBe(mockNewStatus.id);
      expect(prisma.inquiry.update).toHaveBeenCalled();
    });
  });

  describe('addMessage', () => {
    it('should add a message to an inquiry', async () => {
      const mockInquiry = {
        id: 'inquiry-1',
        refNumber: 'INQ-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
      };

      const mockMessage = {
        id: 'message-1',
        inquiryId: 'inquiry-1',
        message: 'Test reply',
        isInternal: false,
      };

      prisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      prisma.inquiryMessage.create.mockResolvedValue(mockMessage);

      const result = await service.addMessage('inquiry-1', {
        message: 'Test reply',
        isInternal: false,
      });

      expect(result).toEqual(mockMessage);
      expect(prisma.inquiryMessage.create).toHaveBeenCalled();
    });
  });

  describe('markAsSpam', () => {
    it('should mark inquiry as spam', async () => {
      const mockInquiry = {
        id: 'inquiry-1',
        refNumber: 'INQ-001',
      };

      const mockSpamStatus = {
        id: 'status-spam',
        slug: 'spam',
        name: 'Spam',
      };

      prisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      prisma.inquiryStatus.findFirst.mockResolvedValue(mockSpamStatus);
      prisma.inquiry.update.mockResolvedValue({
        ...mockInquiry,
        statusId: mockSpamStatus.id,
        status: mockSpamStatus,
      });
      prisma.inquiryMessage.create.mockResolvedValue({});

      const result = await service.markAsSpam('inquiry-1');

      expect(result.statusId).toBe(mockSpamStatus.id);
    });
  });
});
