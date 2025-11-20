# Inquiries API Documentation

## Overview

The Inquiries API provides endpoints for handling customer inquiries, both general contact forms and product-specific inquiries. It includes admin endpoints for managing inquiries, adding comments, and updating statuses.

## Authentication

- Public endpoints: `/inquiries/contact` and `/inquiries/product`
- Admin endpoints (require authentication): `/inquiries/admin/*`

## Rate Limiting

Public inquiry submission endpoints are rate-limited to prevent abuse:

- 5 requests per minute per IP address
- Global throttle: 10 requests per minute

## Captcha Protection

Both public inquiry endpoints support captcha verification:

- Set `CAPTCHA_ENABLED=true` in environment variables to enable
- Include `captchaToken` in request body when captcha is enabled

## Endpoints

### Public Endpoints

#### POST /inquiries/contact

Create a general contact inquiry.

**Request Body:**

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "companyName": "ACME Corp",
  "subject": "General Inquiry",
  "message": "I would like to know more about your products...",
  "sourcePage": "https://example.com/contact",
  "captchaToken": "optional-captcha-token"
}
```

**Required Fields:**

- `customerName` (2-100 characters)
- `customerEmail` (valid email)
- `subject` (3-200 characters)
- `message` (10-5000 characters)

**Optional Fields:**

- `customerPhone` (max 20 characters)
- `companyName` (max 100 characters)
- `sourcePage` (max 500 characters)
- `captchaToken` (when captcha is enabled)

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "refNumber": "INQ-ABC123-XY4Z"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": [
    "customerEmail must be an email",
    "message must be longer than or equal to 10 characters"
  ],
  "error": "Bad Request"
}
```

#### POST /inquiries/product

Create a product-specific inquiry.

**Request Body:**

```json
{
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1234567890",
  "companyName": "Tech Solutions Inc",
  "productId": "clx9876543210",
  "subject": "Product Specifications",
  "message": "I need detailed specifications for this product...",
  "sourcePage": "https://example.com/products/mlcc-0805",
  "captchaToken": "optional-captcha-token"
}
```

**Required Fields:**

- `customerName` (2-100 characters)
- `customerEmail` (valid email)
- `productId` (valid product ID)
- `message` (10-5000 characters)

**Optional Fields:**

- `customerPhone` (max 20 characters)
- `companyName` (max 100 characters)
- `subject` (max 200 characters, auto-generated if not provided)
- `sourcePage` (max 500 characters)
- `captchaToken` (when captcha is enabled)

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clx1234567891",
    "refNumber": "INQ-DEF456-AB7C"
  }
}
```

### Admin Endpoints

#### GET /inquiries/admin

List and filter inquiries with pagination.

**Query Parameters:**

- `status` (optional): Filter by status (new, acknowledged, resolved, spam)
- `productId` (optional): Filter by product ID
- `assignedToId` (optional): Filter by assigned user ID
- `customerEmail` (optional): Filter by customer email (partial match)
- `search` (optional): Search across multiple fields (refNumber, customerName, customerEmail, subject, message)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Items per page
- `sortBy` (optional, default: createdAt): Field to sort by
- `sortOrder` (optional, default: desc): Sort order (asc, desc)

**Example Request:**

```
GET /inquiries/admin?status=new&page=1&limit=20&search=capacitor
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": "clx1234567890",
      "refNumber": "INQ-ABC123-XY4Z",
      "statusId": "status-1",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+1234567890",
      "companyName": "ACME Corp",
      "productId": null,
      "subject": "General Inquiry",
      "initialMessage": "I would like to know more...",
      "priority": 0,
      "assignedToId": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "status": {
        "id": "status-1",
        "slug": "new",
        "name": "New",
        "color": "#3B82F6"
      },
      "product": null,
      "assignee": null,
      "messages": []
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### GET /inquiries/admin/:id

Get a single inquiry with all details.

**Success Response (200 OK):**

```json
{
  "id": "clx1234567890",
  "refNumber": "INQ-ABC123-XY4Z",
  "statusId": "status-1",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "companyName": "ACME Corp",
  "productId": "clx9876543210",
  "subject": "Product Inquiry",
  "initialMessage": "I need information about...",
  "priority": 0,
  "assignedToId": "user-123",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z",
  "status": {
    "id": "status-1",
    "slug": "new",
    "name": "New",
    "color": "#3B82F6"
  },
  "product": {
    "id": "clx9876543210",
    "sku": "CC0805-100NF-50V",
    "translations": [
      {
        "locale": "en",
        "name": "MLCC 0805 100nF 50V"
      }
    ]
  },
  "assignee": {
    "id": "user-123",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "messages": [
    {
      "id": "msg-1",
      "inquiryId": "clx1234567890",
      "userId": null,
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "message": "Initial inquiry message",
      "isInternal": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "user": null
    },
    {
      "id": "msg-2",
      "inquiryId": "clx1234567890",
      "userId": "user-123",
      "senderName": "Admin",
      "senderEmail": null,
      "message": "Thank you for your inquiry...",
      "isInternal": false,
      "createdAt": "2024-01-15T14:20:00.000Z",
      "user": {
        "id": "user-123",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

**Error Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Inquiry not found",
  "error": "Not Found"
}
```

#### PATCH /inquiries/admin/:id/status

Update inquiry status.

**Request Body:**

```json
{
  "status": "acknowledged",
  "note": "Received and reviewing your inquiry"
}
```

**Valid Statuses:**

- `new`
- `acknowledged`
- `resolved`
- `spam`

**Success Response (200 OK):**

```json
{
  "id": "clx1234567890",
  "refNumber": "INQ-ABC123-XY4Z",
  "statusId": "status-2",
  "status": {
    "id": "status-2",
    "slug": "acknowledged",
    "name": "Acknowledged",
    "color": "#06B6D4"
  },
  "updatedAt": "2024-01-15T15:00:00.000Z"
}
```

#### POST /inquiries/admin/:id/messages

Add a message (reply or internal note) to an inquiry.

**Request Body:**

```json
{
  "message": "Thank you for contacting us. We'll get back to you within 24 hours.",
  "isInternal": false
}
```

**Fields:**

- `message` (required, 1-5000 characters)
- `isInternal` (optional, default: false): If true, message is only visible to admins

**Success Response (201 Created):**

```json
{
  "id": "msg-3",
  "inquiryId": "clx1234567890",
  "userId": "user-123",
  "senderName": "Admin",
  "senderEmail": null,
  "message": "Thank you for contacting us...",
  "isInternal": false,
  "createdAt": "2024-01-15T15:30:00.000Z",
  "updatedAt": "2024-01-15T15:30:00.000Z",
  "user": {
    "id": "user-123",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

#### PATCH /inquiries/admin/:id/spam

Mark an inquiry as spam (shortcut for status update).

**Success Response (200 OK):**

```json
{
  "id": "clx1234567890",
  "refNumber": "INQ-ABC123-XY4Z",
  "statusId": "status-spam",
  "status": {
    "id": "status-spam",
    "slug": "spam",
    "name": "Spam",
    "color": "#EF4444"
  },
  "updatedAt": "2024-01-15T16:00:00.000Z"
}
```

## Email Notifications

When an inquiry is submitted, an email notification is automatically sent to configured recipients.

**Configuration:**

- `INQUIRY_NOTIFICATION_EMAILS`: Comma-separated list of email addresses (default: admin@example.com)
- `ADMIN_BASE_URL`: Base URL for admin panel (used in email links)

**Email Contains:**

- Inquiry reference number
- Customer details (name, email, phone, company)
- Subject and message
- Product information (if applicable)
- Source page (if provided)
- Link to view inquiry in admin panel

## Environment Variables

```bash
# SMTP Configuration (for email notifications)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@example.com

# Inquiry Configuration
INQUIRY_NOTIFICATION_EMAILS=admin@example.com,sales@example.com
ADMIN_BASE_URL=http://localhost:3000

# Captcha Configuration
CAPTCHA_ENABLED=false
CAPTCHA_SECRET_KEY=your-secret-key

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

## Status Workflow

The typical inquiry workflow:

1. **new** - Initial submission
2. **acknowledged** - Inquiry received and acknowledged
3. **resolved** - Inquiry resolved
4. **spam** - Marked as spam (can be set at any time)

Additional statuses available in seed data:

- **in-progress** - Being actively worked on
- **awaiting-response** - Waiting for customer response
- **closed** - Inquiry closed

## Error Codes

- **400 Bad Request**: Validation error or invalid data
- **404 Not Found**: Inquiry not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Development & Testing

### Local Testing with Mailhog

For local development, use Mailhog to capture emails:

```bash
# Run Mailhog (requires Docker)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure environment
SMTP_HOST=localhost
SMTP_PORT=1025

# View emails at http://localhost:8025
```

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## Security Considerations

1. **Rate Limiting**: Prevents spam and abuse
2. **Captcha Support**: Hook ready for integration (reCAPTCHA, hCaptcha, etc.)
3. **Input Validation**: All inputs are validated and sanitized
4. **Email Sanitization**: HTML in emails is properly escaped
5. **CORS**: Configure allowed origins in production

## Production Hardening

Before deploying to production:

1. Enable captcha verification (`CAPTCHA_ENABLED=true`)
2. Configure proper SMTP settings with authentication
3. Set appropriate rate limits
4. Configure CORS for your frontend domain
5. Enable HTTPS/TLS for email if required
6. Set strong `CAPTCHA_SECRET_KEY`
7. Consider implementing a job queue (Bull, BullMQ) for email processing
8. Set up monitoring and alerting for failed notifications
9. Implement proper authentication for admin endpoints
10. Add logging and audit trails

## Future Enhancements

- [ ] Implement actual captcha verification (reCAPTCHA v3, hCaptcha)
- [ ] Add job queue for async email processing (Bull/BullMQ)
- [ ] Implement file attachments for inquiries
- [ ] Add email templates for customer auto-responses
- [ ] Implement inquiry assignment notifications
- [ ] Add SLA tracking and escalation
- [ ] Implement inquiry tags/categories
- [ ] Add bulk operations (bulk status update, bulk assignment)
- [ ] Implement inquiry metrics and analytics
- [ ] Add webhook support for third-party integrations
