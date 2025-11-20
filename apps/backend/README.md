# Backend API

NestJS backend service for the CSCeramic product catalog and inquiry management system.

## Features

- **Inquiries API**: Handle customer inquiries with persistence and email notifications
- **Rate Limiting**: Protect against abuse with configurable throttling
- **Email Notifications**: Automated email alerts via Nodemailer
- **Validation**: Request validation with class-validator
- **Type Safety**: Full TypeScript support
- **Testing**: Unit and E2E tests with Jest

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (configured in `@repo/db`)
- Mailhog (optional, for local email testing)

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed
```

### Environment Variables

Create `.env.local` in the monorepo root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/csceramic"

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# SMTP Configuration (Mailhog for local dev)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@csceramic.com

# Inquiry Configuration
INQUIRY_NOTIFICATION_EMAILS=admin@csceramic.com
ADMIN_BASE_URL=http://localhost:3000

# Captcha (optional)
CAPTCHA_ENABLED=false
CAPTCHA_SECRET_KEY=
```

### Development

```bash
# Start development server
pnpm --filter @repo/backend dev

# Run tests
pnpm --filter @repo/backend test

# Run E2E tests
pnpm --filter @repo/backend test:e2e

# Run with coverage
pnpm --filter @repo/backend test:cov

# Lint
pnpm --filter @repo/backend lint
```

### Build & Production

```bash
# Build
pnpm --filter @repo/backend build

# Start production server
pnpm --filter @repo/backend start
```

## Project Structure

```
src/
├── modules/
│   └── inquiries/           # Inquiry handling module
│       ├── dto/             # Data transfer objects
│       ├── inquiries.controller.ts
│       ├── inquiries.service.ts
│       ├── inquiries.module.ts
│       └── inquiries.service.spec.ts
├── services/
│   ├── email/               # Email service
│   │   ├── templates/       # Email templates
│   │   └── email.service.ts
│   └── job/                 # Job queue abstraction
│       └── job.service.ts
├── common/
│   ├── guards/              # Route guards
│   ├── decorators/          # Custom decorators
│   └── filters/             # Exception filters
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts

test/
└── inquiries.e2e-spec.ts    # E2E tests

docs/
└── inquiries-api.md         # API documentation
```

## API Documentation

See [docs/inquiries-api.md](./docs/inquiries-api.md) for complete API documentation.

### Quick Reference

**Public Endpoints:**

- `POST /inquiries/contact` - General contact form
- `POST /inquiries/product` - Product-specific inquiry

**Admin Endpoints:**

- `GET /inquiries/admin` - List/filter inquiries
- `GET /inquiries/admin/:id` - Get single inquiry
- `PATCH /inquiries/admin/:id/status` - Update status
- `POST /inquiries/admin/:id/messages` - Add message/comment
- `PATCH /inquiries/admin/:id/spam` - Mark as spam

## Testing

### Unit Tests

```bash
pnpm test
```

Tests are located alongside source files with `.spec.ts` extension.

### E2E Tests

```bash
pnpm test:e2e
```

E2E tests are in the `test/` directory.

### Test Coverage

```bash
pnpm test:cov
```

## Email Testing

For local development, use Mailhog to capture and view emails:

```bash
# Run Mailhog with Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# View emails at http://localhost:8025
```

## Rate Limiting

Rate limiting is configured globally and per-endpoint:

- Global: 10 requests/minute
- Inquiry submissions: 5 requests/minute

Configure in `app.module.ts` via `ThrottlerModule`.

## Security

- **CORS**: Enabled for configured frontend URL
- **Validation**: Automatic request validation with whitelist
- **Rate Limiting**: Throttling to prevent abuse
- **Captcha Ready**: Hook for captcha verification (needs integration)

## Deployment

### Environment Setup

1. Set production environment variables
2. Enable captcha verification
3. Configure proper SMTP settings
4. Set secure CORS origins
5. Enable HTTPS/TLS

### Database Migrations

```bash
# Run migrations
pnpm db:migrate:deploy
```

### Health Check

The API includes a basic health check at the root endpoint:

```bash
curl http://localhost:3001
```

## Contributing

1. Create feature branch
2. Make changes with tests
3. Ensure all tests pass
4. Create pull request

## License

Private
