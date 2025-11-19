# Data Import Pipeline Documentation

## Overview

This documentation covers the data ingestion pipeline for bootstrapping the CSCeramic database with content from the website. The pipeline consists of:

1. **Scraping utilities** - Tools for crawling and extracting HTML content
2. **Data transformers** - Functions to normalize scraped HTML into structured JSON
3. **JSON importer** - Prisma-based database import tool
4. **CLI tools** - Command-line interface for running imports

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database configured
- `DATABASE_URL` environment variable set

### Basic Usage

```bash
cd /home/engine/project

# Install dependencies
pnpm install

# Import data from JSON files
pnpm --filter @repo/scripts import ./data en 100
```

### Arguments

```bash
pnpm --filter @repo/scripts import [dataDir] [locale] [throttleMs]
```

- **dataDir** (optional, default: `./data`) - Directory containing JSON data files
- **locale** (optional, default: `en`) - Locale code for imported content
- **throttleMs** (optional, default: `100`) - Milliseconds to wait between database operations

## Data Format

### Directory Structure

```
data/
├── categories.json
├── products.json
├── blog-posts.json
└── static-pages.json
```

### Categories (categories.json)

Defines product categories with support for hierarchical organization.

```json
[
  {
    "slug": "ceramic-capacitors",
    "path": "/ceramic-capacitors",
    "parentSlug": null,
    "name": "Ceramic Capacitors",
    "description": "High-quality ceramic capacitors",
    "metaTitle": "Ceramic Capacitors | CSCeramic",
    "metaDescription": "Browse our range",
    "iconUrl": "https://example.com/icon.png",
    "imageUrl": "https://example.com/image.jpg",
    "position": 0,
    "isPublished": true,
    "showInMenu": true,
    "locale": "en"
  }
]
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | Yes | URL-safe identifier (unique) |
| path | string | Yes | Full hierarchical path (e.g., `/parent/child`) |
| parentSlug | string | No | Parent category slug for hierarchies |
| name | string | Yes | Display name |
| description | string | No | Full description text |
| metaTitle | string | No | SEO title tag |
| metaDescription | string | No | SEO meta description |
| iconUrl | string | No | Icon/thumbnail URL |
| imageUrl | string | No | Hero/cover image URL |
| position | number | No | Sort order (default: 0) |
| isPublished | boolean | No | Publication status (default: true) |
| showInMenu | boolean | No | Menu visibility (default: true) |
| locale | string | No | Locale code (default: "en") |

### Products (products.json)

Defines individual products with detailed specifications and media.

```json
[
  {
    "sku": "MLCC-0805-100NF",
    "slug": "mlcc-0805-100nf",
    "categorySlug": "mlcc",
    "name": "MLCC 0805 100nF",
    "shortDescription": "High-quality MLCC capacitor",
    "description": "Full description...",
    "features": "• Feature 1\n• Feature 2",
    "applications": "Application areas...",
    "metaTitle": "Product | CSCeramic",
    "metaDescription": "Product description",
    "specifications": [
      {
        "key": "Capacitance",
        "value": "100",
        "unit": "nF"
      }
    ],
    "tags": ["automotive", "rohs-compliant"],
    "images": [
      {
        "url": "https://example.com/product.jpg",
        "altText": "Product image",
        "isPrimary": true
      }
    ],
    "assets": [
      {
        "type": "datasheet",
        "url": "https://example.com/datasheet.pdf",
        "fileName": "datasheet.pdf",
        "title": "Product Datasheet"
      }
    ],
    "isPublished": true,
    "isFeatured": false,
    "position": 0,
    "locale": "en"
  }
]
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sku | string | Yes | Stock keeping unit (unique) |
| slug | string | Yes | URL-safe identifier |
| categorySlug | string | No | Parent category slug |
| name | string | Yes | Product name |
| shortDescription | string | No | Brief description (meta usage) |
| description | string | No | Full product description |
| features | string | No | Bullet-point features (newline-separated) |
| applications | string | No | Application areas |
| metaTitle | string | No | SEO title |
| metaDescription | string | No | SEO description |
| specifications | array | No | Technical specifications array |
| tags | array | No | String array of tags (auto-creates ProductTag records) |
| images | array | No | Product images array |
| assets | array | No | Downloadable assets (datasheets, etc.) |
| isPublished | boolean | No | Publication status (default: true) |
| isFeatured | boolean | No | Featured product flag (default: false) |
| position | number | No | Sort order (default: 0) |
| locale | string | No | Locale code (default: "en") |

#### Specifications Sub-object

```json
{
  "key": "Capacitance",
  "value": "100",
  "unit": "nF"
}
```

| Field | Type | Required |
|-------|------|----------|
| key | string | Yes |
| value | string | Yes |
| unit | string | No |

#### Images Sub-object

```json
{
  "url": "https://example.com/image.jpg",
  "altText": "Image description",
  "isPrimary": true
}
```

| Field | Type | Required |
|-------|------|----------|
| url | string | Yes |
| altText | string | No |
| isPrimary | boolean | No |

#### Assets Sub-object

```json
{
  "type": "datasheet",
  "url": "https://example.com/file.pdf",
  "fileName": "datasheet.pdf",
  "title": "Product Datasheet"
}
```

| Field | Type | Required |
|-------|------|----------|
| type | string | Yes |
| url | string | Yes |
| fileName | string | Yes |
| title | string | No |

### Blog Posts (blog-posts.json)

Defines blog articles with content and metadata.

```json
[
  {
    "slug": "article-title",
    "title": "Article Title",
    "excerpt": "Brief excerpt",
    "content": "<h1>Article Title</h1><p>HTML content...</p>",
    "featuredImageUrl": "https://example.com/featured.jpg",
    "authorName": "Author Name",
    "tags": ["tag1", "tag2"],
    "metaTitle": "Article | CSCeramic",
    "metaDescription": "Article description",
    "isPublished": true,
    "publishedAt": "2024-01-15T10:00:00Z",
    "locale": "en"
  }
]
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | Yes | URL-safe identifier (unique) |
| title | string | Yes | Article title |
| excerpt | string | No | Short summary for previews |
| content | string | Yes | HTML content |
| featuredImageUrl | string | No | Cover/featured image URL |
| authorName | string | No | Author name |
| tags | array | No | String array of tags |
| metaTitle | string | No | SEO title |
| metaDescription | string | No | SEO description |
| isPublished | boolean | No | Publication status (default: false) |
| publishedAt | string | No | ISO 8601 timestamp |
| locale | string | No | Locale code (default: "en") |

### Static Pages (static-pages.json)

Defines static content pages like About, Contact, etc.

```json
[
  {
    "slug": "about",
    "pageKey": "about-us",
    "title": "About Us",
    "content": "<h1>About Us</h1><p>HTML content...</p>",
    "metaTitle": "About Us | CSCeramic",
    "metaDescription": "Learn about CSCeramic",
    "isPublished": true,
    "locale": "en"
  }
]
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | Yes | URL-safe identifier (unique) |
| pageKey | string | Yes | Internal key for page identification |
| title | string | Yes | Page title |
| content | string | Yes | HTML content |
| metaTitle | string | No | SEO title |
| metaDescription | string | No | SEO description |
| isPublished | boolean | No | Publication status (default: true) |
| locale | string | No | Locale code (default: "en") |

## Idempotency & Updates

The import system is designed to be idempotent:

- **Categories** - Updated by `slug`
- **Products** - Updated by `sku`
- **Blog posts** - Updated by `slug`
- **Static pages** - Updated by `slug`

Running the importer multiple times with the same data will:

1. Create records that don't exist
2. Update existing records with new values
3. Update translations for the specified locale

This allows safe re-running of imports to fix data or update content.

## Handling Multi-language Content

The system supports multi-language content through the `locale` field:

### Importing Different Locales

```bash
# Import English content
pnpm --filter @repo/scripts import ./data en

# Import Chinese content
pnpm --filter @repo/scripts import ./data/zh zh
```

### Data Structure for Locales

Create separate JSON files for each locale:

```
data/
├── categories.json (en)
├── products.json (en)
└── categories.zh.json (zh)
└── products.zh.json (zh)
```

Or use the `locale` field in JSON to automatically assign:

```json
{
  "slug": "product-name",
  "locale": "zh",
  ...
}
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Import settings
LOCALE="en"
THROTTLE_MS="100"
```

### Load via CLI Arguments

```bash
pnpm --filter @repo/scripts import ./data en 100
                                    ^^^^^^ ^^^ ^^^
                                    |      |   +- throttleMs (optional)
                                    |      +---- locale (optional)
                                    +----------- dataDir (optional)
```

## Data Validation

The importer validates data before insertion:

- **Required fields** - Missing required fields skip the record with error logging
- **URLs** - Image and asset URLs should be valid
- **Slugs** - Auto-generated from names if not provided
- **Uniqueness** - Duplicates by identifier are updated

### Error Handling

Failed imports log errors without stopping the process:

```
❌ Failed to import product SKU-001: Validation failed
```

All errors are collected and reported in the import summary.

## Import Summary Report

After import completes, you'll see a summary:

```
📊 Import Summary
ℹ️ Total Processed: 25
ℹ️ Created: 15
ℹ️ Updated: 10
ℹ️ Skipped: 0
ℹ️ Errors: 0
ℹ️ Duration: 2.34s
```

If errors occurred, they're listed:

```
⚠️ Errors encountered:
  - product/SKU-001: Validation failed
  - category/invalid-slug: Parent not found
```

## Scraping from Live Site

### Setting up a Scraper

Example scraper structure (to be implemented):

```typescript
import { HttpClient } from './utils/http';
import { HtmlParser } from './utils/html-parser';
import { generateSlug } from './utils/transformers';

const http = new HttpClient({
  baseUrl: 'https://csceramic.com',
  userAgent: 'Mozilla/5.0 (compatible; CSCeramicScraper/1.0)',
});

http.setThrottle(500); // Respect robots.txt

const html = await http.get('/products');
const parser = new HtmlParser(html);
const productName = parser.getTitle();
```

### Exported Utilities

- `HttpClient` - Handle HTTP requests with rate limiting and retries
- `HtmlParser` - Parse and extract data from HTML using Cheerio
- `generateSlug()` - Convert text to URL-safe slugs
- `cleanText()` - Sanitize extracted text
- `stripHtmlTags()` - Remove HTML markup
- `parseSpecifications()` - Convert table data to structured specs

## Known Limitations

1. **Remote Assets** - URLs are stored as-is; local downloads require separate implementation
2. **Complex Relationships** - Related products must be created separately after product import
3. **Dynamic Content** - Static JSON import doesn't handle real-time data or scheduled content
4. **Large Datasets** - For 10k+ records, consider batch processing or streaming
5. **Image Validation** - URLs are not validated for accessibility or size
6. **Slug Collisions** - Multiple locales must have different slugs for same content

## Troubleshooting

### "DATABASE_URL is not set"

Ensure your `.env` file exists and contains:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### Import hangs or is slow

- Increase `throttleMs` to allow database processing time
- Check PostgreSQL connection pool limits
- Verify network connectivity to external asset URLs

### "Validation failed" errors

Check that:

- Required fields (sku, slug, name) are present
- Parent references (parentSlug, categorySlug) exist
- Locale values are consistent across related records

### Data not appearing after import

- Verify `isPublished: true` is set
- Check that the database migration has run: `pnpm db:migrate:deploy`
- Ensure locale matches query filters in frontend

## Advanced Usage

### Dry Run Mode

To preview changes without modifying the database:

```typescript
const importer = new JsonImporter(prisma, {
  dataDir: './data',
  dryRun: true,
  logProgress: true,
});
```

### Custom Import Logic

Extend the importer for custom transformations:

```typescript
class CustomImporter extends JsonImporter {
  protected async addProductImages(productId, images) {
    // Custom image handling
  }
}
```

### Progress Tracking

Monitor import progress:

```typescript
const stats = await importer.importAll();
console.log(`Imported ${stats.created} new records`);
console.log(`Updated ${stats.updated} existing records`);
console.log(`Encountered ${stats.errors} errors`);
```

## Related Commands

```bash
# Reset database (WARNING: deletes all data)
pnpm db:reset

# View database schema
pnpm db:studio

# Create a new migration
pnpm db:migrate

# Apply pending migrations
pnpm db:migrate:deploy

# Run database checks
pnpm db:check
```

## Example Workflow

### 1. Prepare Data

Create `scripts/data/products.json` with product data

### 2. Validate Schema

Review JSON against expected format (see Data Format section)

### 3. Test Import

```bash
cd scripts
pnpm install
pnpm import ../data en
```

### 4. Verify Results

```bash
pnpm db:studio
```

Navigate to Products table to verify imported data

### 5. Deploy

Push changes to production database:

```bash
pnpm db:migrate:deploy
```

## Performance Tips

1. **Batch Size** - Process 100-500 records per batch for optimal performance
2. **Indexing** - Database indices speed up upsert lookups
3. **Throttling** - Use `throttleMs: 100` for consistent throughput
4. **Cleanup** - Delete test data before production import

## Support & Contributing

For issues, questions, or improvements:

1. Check existing documentation
2. Review example data files
3. Check error logs in import summary
4. Create an issue with reproduction steps

---

**Last Updated**: 2024
**Version**: 1.0
