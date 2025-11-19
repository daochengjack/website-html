# CSCeramic Data Import Scripts

Automated data ingestion pipeline for bootstrapping the CSCeramic database with content.

## Quick Start

```bash
# Install dependencies
pnpm install

# Import data from JSON files
pnpm import ./data en 100
```

## What's Included

### Utilities (`src/utils/`)

- **http.ts** - HTTP client with rate limiting, retries, and throttling
- **html-parser.ts** - Cheerio-based HTML parsing and extraction
- **transformers.ts** - Text transformation, slug generation, data normalization
- **logger.ts** - Structured logging with different levels
- **fs.ts** - File system operations (read/write JSON, directory management)
- **prisma-client.ts** - Prisma database connection management

### Importers (`src/importers/`)

- **json-importer.ts** - Main importer class for ingesting JSON data into database

### Types (`src/types/`)

- **index.ts** - TypeScript interfaces for all data models

### Configuration (`src/config/`)

- **index.ts** - Configuration management and defaults

## Usage

### Import Data from JSON

```bash
pnpm import [dataDir] [locale] [throttleMs]
```

**Example:**
```bash
pnpm import ./data en 100
```

**Parameters:**
- `dataDir` (optional, default: `./data`) - Directory containing JSON files
- `locale` (optional, default: `en`) - Locale code for content
- `throttleMs` (optional, default: `100`) - Milliseconds between database operations

### Data Format

Place JSON files in the `data/` directory:

- `categories.json` - Product categories
- `products.json` - Product listings with specs
- `blog-posts.json` - Blog articles
- `static-pages.json` - Static content pages

See `../docs/data-import.md` for detailed format specifications.

## Project Structure

```
scripts/
├── src/
│   ├── utils/
│   │   ├── http.ts          # HTTP client
│   │   ├── html-parser.ts   # HTML extraction
│   │   ├── transformers.ts  # Data transformation
│   │   ├── logger.ts        # Logging
│   │   ├── fs.ts            # File operations
│   │   └── prisma-client.ts # Database client
│   ├── importers/
│   │   └── json-importer.ts # JSON import implementation
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── config/
│   │   └── index.ts         # Configuration
│   └── importer.ts          # CLI entry point
├── data/
│   ├── categories.json
│   ├── products.json
│   ├── blog-posts.json
│   └── static-pages.json
├── package.json
├── tsconfig.json
└── README.md
```

## Features

### Data Import
- ✅ Idempotent import (safe to re-run)
- ✅ Multi-language support (per-locale imports)
- ✅ Progress logging and error reporting
- ✅ Batch processing with throttling
- ✅ Automatic slug generation
- ✅ Tag auto-creation

### Data Handling
- ✅ Product hierarchies (nested categories)
- ✅ Product specifications and technical data
- ✅ Images and asset references
- ✅ Blog posts with metadata
- ✅ Static pages
- ✅ SEO metadata (meta title/description)

### Utilities
- ✅ HTML parsing and cleaning
- ✅ URL normalization
- ✅ Text transformation and sanitization
- ✅ Slug generation
- ✅ Structured logging

## Configuration

### Environment Variables

```bash
# Database connection (required)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Logging
NODE_ENV=development
```

### Via Command Line

```bash
pnpm import ./data zh 200
         ^^^^^^ ^^ ^^^
         |      |  +- throttleMs (optional)
         |      +---- locale (optional)
         +----------- dataDir (optional)
```

## Examples

### Basic Import

```bash
pnpm import
# Uses defaults: ./data, en, 100ms throttle
```

### Chinese Locale Import

```bash
pnpm import ./data/zh zh
```

### Slow Throttle (High Load Database)

```bash
pnpm import ./data en 500
```

### Fast Import (Local Database)

```bash
pnpm import ./data en 10
```

## Data Files

### categories.json

```json
[
  {
    "slug": "mlcc",
    "path": "/ceramic-capacitors/mlcc",
    "parentSlug": "ceramic-capacitors",
    "name": "MLCC Capacitors",
    "description": "Multilayer ceramic capacitors",
    "position": 0,
    "isPublished": true,
    "showInMenu": true,
    "locale": "en"
  }
]
```

### products.json

```json
[
  {
    "sku": "MLCC-0805-100NF",
    "slug": "mlcc-0805-100nf",
    "categorySlug": "mlcc",
    "name": "MLCC 0805 100nF",
    "specifications": [
      { "key": "Capacitance", "value": "100", "unit": "nF" }
    ],
    "tags": ["automotive", "rohs"],
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "altText": "Product image",
        "isPrimary": true
      }
    ],
    "locale": "en"
  }
]
```

### blog-posts.json

```json
[
  {
    "slug": "article-title",
    "title": "Article Title",
    "content": "<h1>Title</h1><p>Content...</p>",
    "authorName": "Author",
    "tags": ["tag1", "tag2"],
    "isPublished": true,
    "publishedAt": "2024-01-15T10:00:00Z",
    "locale": "en"
  }
]
```

### static-pages.json

```json
[
  {
    "slug": "about",
    "pageKey": "about-us",
    "title": "About Us",
    "content": "<h1>About Us</h1><p>Content...</p>",
    "isPublished": true,
    "locale": "en"
  }
]
```

## Import Summary

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

## Troubleshooting

### DATABASE_URL not set

```bash
export DATABASE_URL="postgresql://localhost:5432/csceramic"
pnpm import
```

### Import is slow

- Increase `throttleMs` for slower databases
- Reduce for faster/local databases
- Check database connection pool

### Data not appearing

- Verify `isPublished: true`
- Check locale matches your queries
- Ensure migration has run: `pnpm db:migrate:deploy`

### Error on import

- Check JSON format validity
- Verify required fields present
- Review error log in import summary

## Advanced

### Custom Locale Handling

Create separate data files per locale:

```bash
data/
├── categories.json      # English
├── categories.zh.json   # Chinese
├── products.json
└── products.zh.json
```

Then import each:

```bash
pnpm import ./data en
pnpm import ./data zh
```

### Programmatic Usage

```typescript
import { PrismaClient } from '@prisma/client';
import { JsonImporter } from './src/importers/json-importer';

const prisma = new PrismaClient();
const importer = new JsonImporter(prisma, {
  dataDir: './data',
  locale: 'en',
  logProgress: true,
});

const stats = await importer.importAll();
console.log(`Imported ${stats.created} records`);
```

## Related Commands

```bash
# Install everything
pnpm install

# View database
pnpm db:studio

# Reset database
pnpm db:reset

# Apply migrations
pnpm db:migrate:deploy
```

## Documentation

See `../docs/data-import.md` for:
- Complete data format specification
- Field reference and validation
- Multi-language setup
- Advanced configuration
- Performance tuning
- Troubleshooting guide

## Contributing

To extend the import system:

1. Add new types in `src/types/index.ts`
2. Add utilities in `src/utils/`
3. Create importers in `src/importers/`
4. Update documentation

## License

Part of the CSCeramic project
