# Database Schema Implementation Summary

## Overview

This document summarizes the database schema design implementation for the CSCeramic website cloning project.

## What Was Implemented

### 1. Prisma ORM Integration

- Created `packages/db` as a shared database package in the monorepo
- Configured Prisma Client with PostgreSQL provider
- Set up proper TypeScript compilation and module exports
- Added Prisma Client to workspace path aliases (`@repo/db`)

### 2. Comprehensive Data Model

The Prisma schema (`packages/db/prisma/schema.prisma`) includes:

#### User Management & Authentication

- **Role**: System roles (admin, editor, viewer) with RBAC support
- **User**: User accounts with password hashing and status flags
- **UserRole**: Many-to-many junction for user-role assignments
- **UserSession**: Active session management with expiration
- **PasswordResetToken**: Secure password reset token handling

#### Product Catalog

- **ProductCategory**: Self-referencing tree structure with materialized paths
- **ProductCategoryTranslation**: Localized category names and descriptions
- **Product**: Core product entity with SKU, status, and featured flags
- **ProductTranslation**: Localized product content (name, description, SEO)
- **ProductImage**: Multiple product images with ordering and primary flag
- **ProductAsset**: Downloadable assets (datasheets, CAD files, certificates)
- **ProductTag**: Reusable tags with translations
- **ProductTagOnProduct**: Many-to-many product-tag mapping
- **ProductSpecification**: Key-value technical specifications
- **ProductRelated**: Product relationships (related, accessories, alternatives)
- **ProductFaq**: Product-specific frequently asked questions

#### Content Management

- **Banner**: Homepage/landing page promotional banners
- **HomepageSection**: Configurable homepage content blocks
- **ClientLogo**: Customer/partner logos
- **Testimonial**: Customer testimonials with ratings
- **NewsArticle + NewsArticleTranslation**: News/press releases
- **BlogPost + BlogPostTranslation**: Blog articles with tags
- **StaticPage + StaticPageTranslation**: CMS-managed pages (About, Privacy, etc.)
- **DownloadDocument**: Downloadable resources by category
- **CatalogueItem**: Product catalogues and brochures

#### Customer Engagement

- **InquiryStatus**: Customizable inquiry workflow statuses
- **Inquiry**: Customer inquiries/support tickets with assignment
- **InquiryMessage**: Conversation threads for inquiries
- **ContactSubmission**: Simple contact form entries
- **NewsletterSignup**: Email newsletter subscriptions

### 3. Localization Strategy

Implemented **separate translation tables pattern**:

- Base tables store IDs, relationships, and non-localized data
- Translation tables store locale-specific content (names, descriptions, SEO)
- Composite unique keys `(entityId, locale)` prevent duplicate translations
- Each translation can be independently published/unpublished
- Supports multiple locales (currently: `en`, `zh`) with easy extensibility

### 4. SEO & Metadata Support

All localized content includes:

- `slug` - URL-friendly identifier (unique per locale)
- `metaTitle` - Custom page title
- `metaDescription` - Meta description for search engines
- `ogImage` - Open Graph image URL for social sharing
- `isPublished` - Visibility control flag
- `publishedAt` - Optional scheduling timestamp

### 5. Full-Text Search

The initial migration includes PostgreSQL GIN indexes on `to_tsvector('simple', ...)` for:

- Product translations (name, description, features, applications)
- Category translations (name, description)
- Product tags, FAQs, testimonials
- News/blog article translations
- Static page translations

### 6. Data Integrity Constraints

#### Unique Constraints

- Slugs (globally or per locale)
- SKUs (globally unique)
- Email addresses (unique per user/newsletter)
- Composite keys for translations

#### Cascading Deletes

- **CASCADE**: Translations, images, specifications, sessions
- **SET NULL**: Optional references (category in product, product in inquiry)
- **RESTRICT**: Critical references (inquiry status) prevent deletion

#### Indexes

- All foreign keys indexed for efficient JOINs
- Lookup fields (slug, email, SKU) indexed
- Filter fields (isPublished, status, locale) indexed
- Sort fields (position, dates) indexed

### 7. Migration & Seeding

#### Initial Migration

Created `20231118120000_initial_schema/migration.sql`:

- Creates all tables with proper column types
- Defines all indexes (B-tree and GIN)
- Sets up foreign key constraints
- Configures cascade behavior

#### Seed Script

The seed script (`packages/db/prisma/seed.ts`) populates:

- System roles (admin, editor, viewer)
- Admin user (email: `admin@csceramic.com`, password configurable via env)
- Inquiry statuses (new, in-progress, awaiting-response, resolved, closed)
- Example product categories with English and Chinese translations
- Sample MLCC product with specifications, images, and tags
- Client logos
- Static "About Us" page in both locales

### 8. Constraint Validation Tests

Created test suite (`packages/db/src/checks/constraints.test.ts`) verifying:

- Slug uniqueness enforcement
- Translation uniqueness (one per locale)
- Cascading delete behavior
- Product slug uniqueness per locale
- Product relation uniqueness

### 9. Documentation

Created comprehensive documentation:

#### `docs/data-model.md` (Main Documentation)

- Design principles and rationale
- Entity relationship diagrams (ASCII art)
- Detailed entity descriptions
- Index strategies and performance considerations
- Localization implementation guide
- Query pattern examples
- Migration and seeding instructions
- Security considerations
- Future enhancement ideas

#### `packages/db/README.md` (Package Documentation)

- Setup instructions
- Available scripts
- Usage examples
- Troubleshooting guide
- Testing information

#### `README.md` (Root - Updated)

- Added database setup section
- Listed database commands
- Added `@repo/db` to project structure

### 10. Package Scripts

Added convenient scripts at multiple levels:

#### Root `package.json`

```json
"db:generate": "pnpm --filter @repo/db db:generate"
"db:migrate": "pnpm --filter @repo/db db:migrate:dev"
"db:migrate:deploy": "pnpm --filter @repo/db db:migrate:deploy"
"db:seed": "pnpm --filter @repo/db db:seed"
"db:studio": "pnpm --filter @repo/db db:studio"
"db:reset": "pnpm --filter @repo/db db:migrate:reset"
"db:check": "pnpm --filter @repo/db db:check"
```

#### Package `packages/db/package.json`

```json
"db:generate": "prisma generate"
"db:migrate:dev": "prisma migrate dev"
"db:migrate:deploy": "prisma migrate deploy"
"db:migrate:reset": "prisma migrate reset"
"db:seed": "tsx prisma/seed.ts"
"db:studio": "prisma studio"
"db:check": "tsx src/checks/constraints.test.ts"
```

## Configuration Files

### `.env.example`

Template for database connection:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/csceramic?schema=public"
```

### `.gitignore`

Added to `packages/db/.gitignore`:

- `.env` files
- Build output (`dist/`)
- Migrations lock file

## Design Decisions

### 1. CUID vs UUID

Used CUID for better sortability, URL-friendliness, and index performance.

### 2. Materialized Path in Categories

Added `path` field to enable efficient breadcrumb generation and subtree queries without recursion.

### 3. Separate Translation Tables

Chose relational pattern over JSON columns for type safety, query performance, and schema evolution.

### 4. GIN Indexes for Search

Implemented full-text search via PostgreSQL native features for production-grade search without external dependencies.

### 5. Role-Based Access Control

Separate `Role` table with many-to-many relationship enables flexible permission management.

### 6. Inquiry Status as Entity

Made status a separate entity (not enum) for runtime customization without schema changes.

## Testing Strategy

### Constraint Tests

The `db:check` command runs automated tests to verify:

- Unique constraints are enforced
- Cascade deletes work properly
- Composite keys prevent duplicates
- Foreign key relationships are correct

### Manual Testing

After migration:

1. Run `pnpm db:seed` to populate sample data
2. Run `pnpm db:studio` to inspect data visually
3. Run `pnpm db:check` to validate constraints

## Next Steps

To use the database in your applications:

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Configure Database**

   ```bash
   cp packages/db/.env.example packages/db/.env
   # Edit .env with your PostgreSQL connection string
   ```

3. **Run Migration**

   ```bash
   pnpm db:migrate
   ```

4. **Seed Data**

   ```bash
   pnpm db:seed
   ```

5. **Import in Your Code**

   ```typescript
   import { prisma, Product, ProductTranslation } from '@repo/db';

   const products = await prisma.product.findMany({
     include: {
       translations: {
         where: { locale: 'en', isPublished: true },
       },
     },
   });
   ```

## Maintenance

### Adding New Locales

No schema changes needed! Just insert new translation records:

```typescript
await prisma.productTranslation.create({
  data: {
    productId: product.id,
    locale: 'fr',
    slug: 'mon-produit',
    name: 'Mon Produit',
    // ... other fields
  },
});
```

### Schema Changes

1. Update `schema.prisma`
2. Run `pnpm db:migrate` (creates migration)
3. Review generated SQL in `prisma/migrations/`
4. Test on staging before production
5. Deploy with `pnpm db:migrate:deploy`

### Backing Up

```bash
pg_dump -h localhost -U postgres csceramic > backup.sql
```

### Restoring

```bash
psql -h localhost -U postgres csceramic < backup.sql
```

## Performance Considerations

- All foreign keys are indexed
- Composite indexes on frequently joined fields
- GIN indexes for full-text search
- `EXPLAIN ANALYZE` your queries in production
- Consider connection pooling (PgBouncer) for high traffic
- Monitor slow query log

## Security Best Practices

1. **Passwords**: Never store plain text - use bcrypt/argon2
2. **Sessions**: Use secure, random tokens with expiration
3. **SQL Injection**: Prisma parameterizes all queries automatically
4. **Soft Deletes**: Use `deletedAt` timestamps for audit trails
5. **Rate Limiting**: Implement at application level
6. **Input Validation**: Validate all user input before database operations

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Data Model Documentation](./data-model.md)
