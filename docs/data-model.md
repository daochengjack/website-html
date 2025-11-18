# Data Model Documentation

## Overview

This document describes the relational data model for the CSCeramic website. The schema is implemented using Prisma ORM with PostgreSQL as the primary datastore.

## Design Principles

### 1. Localization Strategy

The data model follows a **separate translation tables pattern** for localization:

- Core entity data (IDs, relationships, technical fields) is stored in base tables
- Localized content (names, descriptions, SEO metadata) is stored in dedicated translation tables
- Each translation record is uniquely identified by `(entityId, locale)` composite key
- This approach provides:
  - Clean separation of locale-specific content
  - Easy addition of new locales without schema changes
  - Efficient querying with JOIN operations
  - Flexibility to publish/unpublish individual translations

### 2. SEO & Metadata

All localized content tables include:

- `metaTitle` - Custom page title for SEO
- `metaDescription` - Meta description for search engines
- `ogImage` - Open Graph image URL for social media sharing
- `slug` - URL-friendly identifier (unique per locale)

### 3. Audit Trail

All entities include timestamp fields:

- `createdAt` - Automatic timestamp on creation
- `updatedAt` - Automatic timestamp on updates (where applicable)

### 4. Soft Publish Controls

Most content entities include:

- `isPublished` boolean flag for visibility control
- `publishedAt` timestamp for scheduling (where applicable)
- Status enums for workflow management

### 5. Search Support

To support content search we add GIN indexes (via raw SQL in the initial migration) on `to_tsvector('simple', ...)` expressions for high-value localized tables:

- Product translations (`name`, `shortDescription`, `description`, `features`, `applications`)
- Category translations (`name`, `description`)
- Product tag translations (`name`)
- Product FAQs (`question`, `answer`)
- Testimonials (`clientName`, `content`)
- News article translations (`title`, `excerpt`, `content`)
- Blog post translations (`title`, `excerpt`, `content`, `tags`)
- Static page translations (`title`, `content`)

In addition, regular b-tree indexes are defined on commonly filtered columns such as slugs, locales, publish flags, and timestamps to keep query performance consistent.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER MANAGEMENT                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Role ←──┐                                                   │
│          │                                                   │
│  UserRole├─→ User ←── UserSession                           │
│          │         ←── PasswordResetToken                    │
│          │         ←── InquiryMessage                        │
│          └─────────← Inquiry (assignedTo)                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 PRODUCT CATALOG                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ProductCategory (self-referencing tree)                     │
│      │                                                        │
│      ├─→ ProductCategoryTranslation                          │
│      │                                                        │
│      └─→ Product ┬─→ ProductTranslation                      │
│                  ├─→ ProductImage                            │
│                  ├─→ ProductAsset                            │
│                  ├─→ ProductSpecification                    │
│                  ├─→ ProductFaq                              │
│                  ├─→ ProductRelated (self-join)              │
│                  └─→ ProductTagOnProduct ←─ ProductTag       │
│                                              └─→ ProductTagTranslation
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  CONTENT MANAGEMENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Banner (localized)                                          │
│  HomepageSection (localized)                                 │
│  ClientLogo (global)                                         │
│  Testimonial (localized)                                     │
│  CatalogueItem (localized)                                   │
│  DownloadDocument (localized)                                │
│                                                               │
│  NewsArticle ─→ NewsArticleTranslation                       │
│  BlogPost ─→ BlogPostTranslation                             │
│  StaticPage ─→ StaticPageTranslation                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  CUSTOMER ENGAGEMENT                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  InquiryStatus ←── Inquiry ┬─→ InquiryMessage               │
│                            │                                 │
│                            └─→ Product (optional)            │
│                                                               │
│  ContactSubmission (simple form submissions)                 │
│  NewsletterSignup (email subscriptions)                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Core Entities

### User Management

#### Role

Defines system roles for authorization.

- `slug` - Unique role identifier (e.g., 'admin', 'editor', 'viewer')
- `isSystem` - System roles cannot be deleted

#### User

System users (admin/staff accounts).

- `email` - Unique login identifier
- `passwordHash` - Bcrypt/Argon2 password hash
- `isActive` - Account status flag
- Many-to-many relationship with `Role` through `UserRole`

#### UserSession

Active user sessions for authentication.

- `token` - Unique session token
- `expiresAt` - Session expiration timestamp
- Cascading delete when user is removed

#### PasswordResetToken

One-time password reset tokens.

- `token` - Unique reset token
- `usedAt` - Timestamp when token was consumed
- `expiresAt` - Token expiration

### Product Catalog

#### ProductCategory

Hierarchical product categorization using self-referencing foreign key.

- `slug` - Unique URL identifier
- `path` - Full path for efficient tree queries (e.g., '/ceramic-capacitors/mlcc')
- `parentId` - Self-referencing foreign key for tree structure
- `position` - Display order within parent
- `showInMenu` - Navigation visibility flag

**Indexes:**

- `parentId` - Efficient child lookups
- `position` - Ordered retrieval
- `isPublished` - Published category filtering

#### ProductCategoryTranslation

Localized category content.

- Composite unique key: `(categoryId, locale)`
- Full-text search on `name` and `description`

#### Product

Core product entity.

- `sku` - Unique product identifier
- `status` - Enum: DRAFT, PUBLISHED, ARCHIVED
- `isFeatured` - Homepage/promotion flag
- `position` - Display order
- `publishedAt` / `archivedAt` - Lifecycle timestamps

**Indexes:**

- `sku` - Primary product lookup
- `categoryId` - Category filtering
- `status` - Published product queries
- `isFeatured` - Featured product queries

#### ProductTranslation

Localized product content.

- Composite unique keys:
  - `(productId, locale)` - One translation per locale
  - `(locale, slug)` - Unique URLs per locale
- Full-text search on all text fields
- Separate `isPublished` per translation

#### ProductImage

Product photos and images.

- `position` - Display order
- `isPrimary` - Main product image flag
- Multiple images per product

#### ProductAsset

Downloadable product assets (datasheets, specs, CAD files).

- `type` - Asset category (e.g., 'datasheet', 'cad', 'certificate')
- `locale` - Optional locale for language-specific assets
- File metadata: `fileName`, `fileSize`, `mimeType`

#### ProductTag

Reusable product tags/labels.

- `slug` - Unique tag identifier
- Many-to-many with products through `ProductTagOnProduct`
- Localized via `ProductTagTranslation`

#### ProductSpecification

Technical specifications as key-value pairs.

- `key` - Specification name (e.g., 'Capacitance', 'Voltage')
- `value` - Specification value
- `unit` - Optional unit (e.g., 'nF', 'V', '°C')
- `locale` - Optional for localized spec names
- Unique constraint on `(productId, key, locale)` prevents duplicates

#### ProductRelated

Product relationships (related products, accessories, alternatives).

- Self-referential many-to-many
- `type` - Relationship type (e.g., 'related', 'accessory', 'alternative')
- `position` - Display order

#### ProductFaq

Product-specific FAQs.

- `locale` - Locale-specific questions/answers
- `position` - Display order
- Full-text search on questions and answers

### Content Management

#### Banner

Homepage and landing page banners.

- Locale-specific content (title, subtitle, images)
- `startsAt` / `endsAt` - Campaign scheduling
- `mobileImageUrl` - Responsive image support

#### HomepageSection

Configurable homepage content sections.

- Identified by `(locale, sectionKey)` composite
- Flexible content storage for hero sections, CTAs, etc.

#### ClientLogo

Client/partner logos (global, not localized).

- `position` - Display order
- `websiteUrl` - Optional client link

#### Testimonial

Customer testimonials and reviews.

- Locale-specific
- Optional `rating` field
- `clientCompany` and `clientRole` for credibility

#### NewsArticle & BlogPost

Content publication entities with translations.

- Base table: shared metadata (slug, author, images, dates)
- Translation table: localized content (title, content, SEO)
- `viewCount` - Analytics tracking
- Blog posts include tag array per translation

#### StaticPage

CMS-managed static pages (About, Privacy Policy, etc.).

- `pageKey` - Internal identifier
- Translations include full HTML content
- Full-text search enabled

#### DownloadDocument

Downloadable resources (brochures, certificates, etc.).

- `categoryKey` - Document categorization
- `downloadCount` - Usage tracking
- Locale-specific

#### CatalogueItem

Product catalogues and lookbooks.

- PDF URLs with cover images
- `year` - Catalogue year for organization
- `viewCount` - Analytics tracking

### Customer Engagement

#### InquiryStatus

Customizable inquiry workflow statuses.

- `slug` - Status identifier
- `color` - UI color coding
- `position` - Workflow order
- Prevent deletion via `onDelete: Restrict` in relations

#### Inquiry

Customer inquiries and support tickets.

- `refNumber` - User-friendly reference (e.g., 'INQ-2024-001')
- `statusId` - Current workflow status
- `productId` - Optional product reference
- `priority` - Urgency ranking
- `assignedToId` - Staff assignment
- Rich indexing for efficient dashboard queries

#### InquiryMessage

Conversation thread for inquiries.

- `userId` - Optional for staff replies
- `isInternal` - Internal notes vs customer-visible messages
- Chronological ordering via `createdAt` index

#### ContactSubmission

Simple contact form submissions.

- `isRead` - Follow-up tracking
- `source` - Form origin tracking
- Optional request metadata: `ipAddress`, `userAgent`

#### NewsletterSignup

Email newsletter subscriptions.

- `email` - Unique subscriber
- `isVerified` - Email verification status
- `unsubscribedAt` - Soft delete for compliance
- `source` - Signup source tracking

## Schema Rationale

### Why Separate Translation Tables?

The data model uses **separate translation tables** rather than JSON columns or embedded localized fields for several reasons:

1. **Type Safety**: Prisma provides full TypeScript types for translation records
2. **Query Performance**: Indexed locale fields enable efficient filtering
3. **Relational Integrity**: Foreign key constraints ensure data consistency
4. **Flexibility**: Easy to add new locales without schema changes
5. **Selective Publishing**: Each translation can be independently published/unpublished
6. **Migration Safety**: Schema changes are tracked and versioned

### Why CUID over UUID?

The schema uses `cuid()` (Collision-resistant Unique Identifiers) instead of UUIDs:

1. **Sortable**: CUIDs are lexicographically sortable by creation time
2. **URL-friendly**: No special characters, safe for URLs
3. **Shorter**: 25 characters vs 36 for UUIDs (with dashes)
4. **Performance**: Better index performance on most databases
5. **Collision-resistant**: Suitable for distributed systems

### Why Path Field on Categories?

The `path` field in `ProductCategory` stores the full hierarchical path (e.g., `/ceramic-capacitors/mlcc`) to enable:

1. **Breadcrumb generation** without recursive queries
2. **Efficient subtree queries** using `LIKE` prefix matching
3. **URL routing** with direct path-to-category mapping
4. **Tree traversal** without multiple JOINs

## Indexes & Performance

### Key Index Strategies

1. **Foreign Keys**: All foreign key columns are indexed for efficient JOINs
2. **Lookup Fields**: Unique identifiers (`slug`, `sku`, `email`) are indexed
3. **Filter Fields**: Common filter columns (`isPublished`, `status`, `locale`) are indexed
4. **Sort Fields**: `position`, `createdAt`, `publishedAt` are indexed for ordering
5. **GIN Full-text Search**: Raw SQL migrations create `GIN` indexes on `to_tsvector('simple', ...)` over localized textual columns for fast search
6. **Materialized Paths**: `ProductCategory.path` has a unique index for hierarchy queries

### Composite Indexes

- `(categoryId, locale)` - Localized category queries
- `(locale, slug)` - URL routing
- `(userId, roleId)` - User authorization
- `(productId, tagId)` - Product tagging
- `(productId, key, locale)` - Specification uniqueness

## Constraints & Data Integrity

### Unique Constraints

- **Slugs**: Globally unique or unique per locale
- **SKUs**: Globally unique product identifiers
- **Composite Keys**: Prevent duplicate translations
- **Email**: Unique per user/newsletter subscriber

### Cascading Deletes

When parent entities are deleted:

- **Cascade**: Translations, images, specifications, sessions (dependent data)
- **SetNull**: Optional references (category, product in inquiry)
- **Restrict**: Critical references (inquiry status) prevent deletion

### Self-Referential Integrity

- `ProductCategory.parentId` → `SetNull` to prevent orphaning on parent deletion
- `ProductRelated` enforces bidirectional relationship uniqueness

## Migration Management

### Initial Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm db:generate

# Create and apply initial migration
pnpm db:migrate
```

### Seed Database

```bash
# Run seed script
pnpm db:seed
```

Seeds the following reference data:

- System roles (admin, editor, viewer)
- Default admin user
- Inquiry statuses
- Example product categories with translations
- Sample product with specifications and images
- Product tags
- Client logos
- Static pages

### Development Workflow

```bash
# Create a new migration
pnpm db:migrate

# Reset database (warning: deletes all data)
pnpm db:reset

# Open Prisma Studio for data inspection
pnpm db:studio
```

## Localization Implementation

### Supported Locales

The current implementation includes:

- `en` - English
- `zh` - Chinese (Simplified)

Additional locales can be added without schema changes by inserting new translation records.

### Query Patterns

**Get product with translation:**

```typescript
const product = await prisma.product.findUnique({
  where: { sku: 'CC0805-100NF-50V' },
  include: {
    translations: {
      where: { locale: 'en', isPublished: true },
    },
    images: { orderBy: { position: 'asc' } },
  },
});
```

**Get all categories with English names:**

```typescript
const categories = await prisma.productCategory.findMany({
  where: { isPublished: true },
  include: {
    translations: {
      where: { locale: 'en', isPublished: true },
    },
  },
  orderBy: { position: 'asc' },
});
```

**Full-text search (using raw SQL for PostgreSQL):**

```typescript
const results = await prisma.$queryRaw`
  SELECT pt.*, p.*
  FROM product_translations pt
  JOIN products p ON pt."productId" = p.id
  WHERE pt.locale = 'en'
    AND pt."isPublished" = true
    AND (
      to_tsvector('simple', pt.name || ' ' || COALESCE(pt.description, ''))
      @@ to_tsquery('simple', 'capacitor')
    )
`;
```

## Security Considerations

1. **Password Hashing**: User passwords are stored as hashes (bcrypt/argon2 recommended)
2. **Session Management**: Session tokens are unique and have expiration
3. **Soft Deletes**: Newsletter unsubscribes use `unsubscribedAt` for audit trail
4. **Input Validation**: All user inputs should be validated before database insertion
5. **SQL Injection**: Prisma provides automatic parameterization

## Future Enhancements

Potential schema extensions:

- Product inventory management (stock, warehouses)
- Order/quote management system
- Advanced user permissions (field-level, entity-level)
- Content versioning and draft management
- Media library with CDN integration
- Analytics and event tracking tables
- Multi-currency support for international pricing
- Advanced search with filters and facets
- Product variants (size, color, specification options)

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Internationalization Best Practices](https://www.w3.org/International/questions/qa-i18n)
