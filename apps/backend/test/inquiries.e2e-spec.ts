import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('InquiriesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/inquiries/contact (POST)', () => {
    it('should create a contact inquiry', () => {
      return request(app.getHttpServer())
        .post('/inquiries/contact')
        .send({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '1234567890',
          companyName: 'ACME Corp',
          subject: 'General Inquiry',
          message: 'This is a test message for contact inquiry',
          sourcePage: 'https://example.com/contact',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('refNumber');
          expect(res.body.data.refNumber).toMatch(/^INQ-/);
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/inquiries/contact')
        .send({
          customerName: 'John Doe',
          customerEmail: 'invalid-email',
          subject: 'Test',
          message: 'This is a test message',
        })
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/inquiries/contact')
        .send({
          customerName: 'John Doe',
        })
        .expect(400);
    });

    it('should fail with message too short', () => {
      return request(app.getHttpServer())
        .post('/inquiries/contact')
        .send({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          subject: 'Test',
          message: 'Short',
        })
        .expect(400);
    });
  });

  describe('/inquiries/product (POST)', () => {
    it('should fail with non-existent product', () => {
      return request(app.getHttpServer())
        .post('/inquiries/product')
        .send({
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com',
          productId: 'non-existent-product-id',
          message: 'Interested in this product',
        })
        .expect(400);
    });

    it('should fail with missing productId', () => {
      return request(app.getHttpServer())
        .post('/inquiries/product')
        .send({
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com',
          message: 'Interested in this product',
        })
        .expect(400);
    });
  });

  describe('/inquiries/admin (GET)', () => {
    it('should return paginated inquiries', () => {
      return request(app.getHttpServer())
        .get('/inquiries/admin')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/inquiries/admin?status=new')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/inquiries/admin?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });

    it('should support search', () => {
      return request(app.getHttpServer()).get('/inquiries/admin?search=test').expect(200);
    });
  });

  describe('/inquiries/admin/:id (GET)', () => {
    let inquiryId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer()).post('/inquiries/contact').send({
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        subject: 'Test Inquiry',
        message: 'This is a test inquiry for retrieval',
      });
      inquiryId = response.body.data.id;
    });

    it('should return a single inquiry', () => {
      return request(app.getHttpServer())
        .get(`/inquiries/admin/${inquiryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('refNumber');
          expect(res.body).toHaveProperty('customerName');
          expect(res.body).toHaveProperty('messages');
        });
    });

    it('should return 404 for non-existent inquiry', () => {
      return request(app.getHttpServer()).get('/inquiries/admin/non-existent-id').expect(404);
    });
  });

  describe('/inquiries/admin/:id/status (PATCH)', () => {
    let inquiryId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer()).post('/inquiries/contact').send({
        customerName: 'Status Test User',
        customerEmail: 'status@example.com',
        subject: 'Status Test',
        message: 'This inquiry will have its status updated',
      });
      inquiryId = response.body.data.id;
    });

    it('should update inquiry status', () => {
      return request(app.getHttpServer())
        .patch(`/inquiries/admin/${inquiryId}/status`)
        .send({
          status: 'acknowledged',
          note: 'Status updated for testing',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status.slug).toBe('acknowledged');
        });
    });

    it('should fail with invalid status', () => {
      return request(app.getHttpServer())
        .patch(`/inquiries/admin/${inquiryId}/status`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);
    });
  });

  describe('/inquiries/admin/:id/messages (POST)', () => {
    let inquiryId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer()).post('/inquiries/contact').send({
        customerName: 'Message Test User',
        customerEmail: 'message@example.com',
        subject: 'Message Test',
        message: 'This inquiry will have messages added',
      });
      inquiryId = response.body.data.id;
    });

    it('should add a message to inquiry', () => {
      return request(app.getHttpServer())
        .post(`/inquiries/admin/${inquiryId}/messages`)
        .send({
          message: 'This is a test reply message',
          isInternal: false,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('This is a test reply message');
        });
    });

    it('should add an internal message', () => {
      return request(app.getHttpServer())
        .post(`/inquiries/admin/${inquiryId}/messages`)
        .send({
          message: 'This is an internal note',
          isInternal: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.isInternal).toBe(true);
        });
    });

    it('should fail with empty message', () => {
      return request(app.getHttpServer())
        .post(`/inquiries/admin/${inquiryId}/messages`)
        .send({
          message: '',
        })
        .expect(400);
    });
  });

  describe('/inquiries/admin/:id/spam (PATCH)', () => {
    let inquiryId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer()).post('/inquiries/contact').send({
        customerName: 'Spam Test User',
        customerEmail: 'spam@example.com',
        subject: 'Spam Test',
        message: 'This inquiry will be marked as spam',
      });
      inquiryId = response.body.data.id;
    });

    it('should mark inquiry as spam', () => {
      return request(app.getHttpServer())
        .patch(`/inquiries/admin/${inquiryId}/spam`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status.slug).toBe('spam');
        });
    });
  });
});
