# @repo/db

Shared database package for the CSCeramic monorepo using Prisma ORM with PostgreSQL.

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Create `.env` file:**

   ```bash
   cp .env.example .env
   ```

3. **Configure DATABASE_URL** in `.env`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/csceramic?schema=public"
   ```

4. **Generate Prisma Client:**

   ```bash
   pnpm db:generate
   ```

5. **Run migrations:**

   ```bash
   pnpm db:migrate:dev
   ```

6. **Seed the database (optional):**

   ```bash
   pnpm db:seed
   ```

   Note: The seed script creates an admin user with email `admin@csceramic.com`. The password is `admin123` by default, or you can set `SEED_ADMIN_PASSWORD` environment variable.

## Available Scripts

### From Package Root

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:migrate:dev` - Create and apply migrations (development)
- `pnpm db:migrate:deploy` - Apply migrations (production)
- `pnpm db:seed` - Seed database with reference data
- `pnpm db:studio` - Open Prisma Studio (database GUI)
- `pnpm db:check` - Run constraint sanity checks (throws on failure)
- `pnpm db:migrate:reset` - Reset database (WARNING: deletes all data)

### From Monorepo Root

All scripts can also be run from the root using:

```bash
pnpm db:migrate    # from root
pnpm db:seed       # from root
pnpm db:check      # from root
```

## Usage

### Import Prisma Client

```typescript
import { prisma } from '@repo/db';

// Query example
const users = await prisma.user.findMany();
```

### Import Types

```typescript
import { User, Product, ProductStatus } from '@repo/db';
```

## Schema Overview

See [/docs/data-model.md](/docs/data-model.md) for comprehensive documentation.

### Core Entity Groups

1. **User Management**: Users, Roles, Sessions, Password Resets
2. **Product Catalog**: Products, Categories, Tags, Specifications, Images, Assets
3. **Content**: Banners, News, Blog, Static Pages, Downloads, Catalogues
4. **Engagement**: Inquiries, Contact Forms, Newsletter Signups

### Localization

Most content entities use separate translation tables:

- Base table stores IDs, relationships, and non-localized data
- Translation table stores locale-specific content (names, descriptions, SEO)
- Each translation is uniquely identified by `(entityId, locale)`

## Development

### Creating a Migration

After modifying `schema.prisma`:

```bash
pnpm db:migrate:dev --name your_migration_name
```

### Resetting During Development

To start fresh (WARNING: deletes all data):

```bash
pnpm db:migrate:reset
```

This will:

1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed script

### Prisma Studio

Browse and edit data with a GUI:

```bash
pnpm db:studio
```

Opens at http://localhost:5555

## Production Deployment

1. **Set DATABASE_URL** environment variable
2. **Apply migrations**:
   ```bash
   pnpm db:migrate:deploy
   ```
3. **Optionally seed** reference data:
   ```bash
   pnpm db:seed
   ```

## Testing

The package includes a test script placeholder. To run tests:

```bash
pnpm test
```

## Troubleshooting

### Connection Issues

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists
- Verify network connectivity/firewall

### Migration Conflicts

If migrations are out of sync:

```bash
# Development: reset and reapply
pnpm db:migrate:reset

# Production: resolve manually with Prisma migrate resolve
```

### Prisma Client Not Found

If you get "Cannot find module '@prisma/client'":

```bash
pnpm db:generate
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Data Model Documentation](/docs/data-model.md)
