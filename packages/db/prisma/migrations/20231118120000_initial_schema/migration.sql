-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "path" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "iconUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category_translations" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "categoryId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "features" TEXT,
    "applications" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_assets" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "title" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tag_translations" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_tag_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tag_products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_tag_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_related" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "relatedProductId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'related',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_related_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_faqs" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "linkUrl" TEXT,
    "linkText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_sections" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "linkText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_logos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientRole" TEXT,
    "clientCompany" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "featuredImageUrl" TEXT,
    "authorName" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_article_translations" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categorySlug" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "featuredImageUrl" TEXT,
    "authorName" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_translations" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_post_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_documents" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryKey" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "thumbnailUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "download_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_page_translations" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "static_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogue_items" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryKey" TEXT,
    "pdfUrl" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "pageCount" INTEGER,
    "fileSize" INTEGER,
    "year" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_statuses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiry_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "refNumber" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "companyName" TEXT,
    "productId" TEXT,
    "subject" TEXT NOT NULL,
    "initialMessage" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_messages" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "userId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiry_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_signups" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "locale" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_signups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "roles_slug_idx" ON "roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_path_key" ON "product_categories"("path");

-- CreateIndex
CREATE INDEX "product_categories_parentId_idx" ON "product_categories"("parentId");

-- CreateIndex
CREATE INDEX "product_categories_position_idx" ON "product_categories"("position");

-- CreateIndex
CREATE INDEX "product_categories_isPublished_idx" ON "product_categories"("isPublished");

-- CreateIndex
CREATE INDEX "product_category_translations_locale_idx" ON "product_category_translations"("locale");

-- CreateIndex
CREATE INDEX "product_category_translations_categoryId_idx" ON "product_category_translations"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_translations_categoryId_locale_key" ON "product_category_translations"("categoryId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_isFeatured_idx" ON "products"("isFeatured");

-- CreateIndex
CREATE INDEX "products_position_idx" ON "products"("position");

-- CreateIndex
CREATE INDEX "products_publishedAt_idx" ON "products"("publishedAt");

-- CreateIndex
CREATE INDEX "product_translations_locale_idx" ON "product_translations"("locale");

-- CreateIndex
CREATE INDEX "product_translations_slug_idx" ON "product_translations"("slug");

-- CreateIndex
CREATE INDEX "product_translations_productId_idx" ON "product_translations"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_productId_locale_key" ON "product_translations"("productId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_locale_slug_key" ON "product_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");

-- CreateIndex
CREATE INDEX "product_images_position_idx" ON "product_images"("position");

-- CreateIndex
CREATE INDEX "product_images_isPrimary_idx" ON "product_images"("isPrimary");

-- CreateIndex
CREATE INDEX "product_assets_productId_idx" ON "product_assets"("productId");

-- CreateIndex
CREATE INDEX "product_assets_locale_idx" ON "product_assets"("locale");

-- CreateIndex
CREATE INDEX "product_assets_type_idx" ON "product_assets"("type");

-- CreateIndex
CREATE UNIQUE INDEX "product_tags_slug_key" ON "product_tags"("slug");

-- CreateIndex
CREATE INDEX "product_tags_slug_idx" ON "product_tags"("slug");

-- CreateIndex
CREATE INDEX "product_tags_isPublished_idx" ON "product_tags"("isPublished");

-- CreateIndex
CREATE INDEX "product_tag_translations_locale_idx" ON "product_tag_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "product_tag_translations_tagId_locale_key" ON "product_tag_translations"("tagId", "locale");

-- CreateIndex
CREATE INDEX "product_tag_products_productId_idx" ON "product_tag_products"("productId");

-- CreateIndex
CREATE INDEX "product_tag_products_tagId_idx" ON "product_tag_products"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "product_tag_products_productId_tagId_key" ON "product_tag_products"("productId", "tagId");

-- CreateIndex
CREATE INDEX "product_specifications_productId_idx" ON "product_specifications"("productId");

-- CreateIndex
CREATE INDEX "product_specifications_locale_idx" ON "product_specifications"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "product_specifications_productId_key_locale_key" ON "product_specifications"("productId", "key", "locale");

-- CreateIndex
CREATE INDEX "product_related_productId_idx" ON "product_related"("productId");

-- CreateIndex
CREATE INDEX "product_related_relatedProductId_idx" ON "product_related"("relatedProductId");

-- CreateIndex
CREATE INDEX "product_related_type_idx" ON "product_related"("type");

-- CreateIndex
CREATE UNIQUE INDEX "product_related_productId_relatedProductId_key" ON "product_related"("productId", "relatedProductId");

-- CreateIndex
CREATE INDEX "product_faqs_productId_idx" ON "product_faqs"("productId");

-- CreateIndex
CREATE INDEX "product_faqs_locale_idx" ON "product_faqs"("locale");

-- CreateIndex
CREATE INDEX "banners_locale_idx" ON "banners"("locale");

-- CreateIndex
CREATE INDEX "banners_position_idx" ON "banners"("position");

-- CreateIndex
CREATE INDEX "banners_isPublished_idx" ON "banners"("isPublished");

-- CreateIndex
CREATE INDEX "banners_startsAt_idx" ON "banners"("startsAt");

-- CreateIndex
CREATE INDEX "banners_endsAt_idx" ON "banners"("endsAt");

-- CreateIndex
CREATE INDEX "homepage_sections_locale_idx" ON "homepage_sections"("locale");

-- CreateIndex
CREATE INDEX "homepage_sections_sectionKey_idx" ON "homepage_sections"("sectionKey");

-- CreateIndex
CREATE INDEX "homepage_sections_position_idx" ON "homepage_sections"("position");

-- CreateIndex
CREATE INDEX "homepage_sections_isPublished_idx" ON "homepage_sections"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_sections_locale_sectionKey_key" ON "homepage_sections"("locale", "sectionKey");

-- CreateIndex
CREATE INDEX "client_logos_position_idx" ON "client_logos"("position");

-- CreateIndex
CREATE INDEX "client_logos_isPublished_idx" ON "client_logos"("isPublished");

-- CreateIndex
CREATE INDEX "testimonials_locale_idx" ON "testimonials"("locale");

-- CreateIndex
CREATE INDEX "testimonials_position_idx" ON "testimonials"("position");

-- CreateIndex
CREATE INDEX "testimonials_isPublished_idx" ON "testimonials"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE INDEX "news_articles_slug_idx" ON "news_articles"("slug");

-- CreateIndex
CREATE INDEX "news_articles_isPublished_idx" ON "news_articles"("isPublished");

-- CreateIndex
CREATE INDEX "news_articles_publishedAt_idx" ON "news_articles"("publishedAt");

-- CreateIndex
CREATE INDEX "news_article_translations_locale_idx" ON "news_article_translations"("locale");

-- CreateIndex
CREATE INDEX "news_article_translations_slug_idx" ON "news_article_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_article_translations_articleId_locale_key" ON "news_article_translations"("articleId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "news_article_translations_locale_slug_key" ON "news_article_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_categorySlug_idx" ON "blog_posts"("categorySlug");

-- CreateIndex
CREATE INDEX "blog_posts_isPublished_idx" ON "blog_posts"("isPublished");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");

-- CreateIndex
CREATE INDEX "blog_post_translations_locale_idx" ON "blog_post_translations"("locale");

-- CreateIndex
CREATE INDEX "blog_post_translations_slug_idx" ON "blog_post_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_translations_postId_locale_key" ON "blog_post_translations"("postId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_translations_locale_slug_key" ON "blog_post_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "download_documents_locale_idx" ON "download_documents"("locale");

-- CreateIndex
CREATE INDEX "download_documents_categoryKey_idx" ON "download_documents"("categoryKey");

-- CreateIndex
CREATE INDEX "download_documents_isPublished_idx" ON "download_documents"("isPublished");

-- CreateIndex
CREATE INDEX "download_documents_position_idx" ON "download_documents"("position");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_pageKey_key" ON "static_pages"("pageKey");

-- CreateIndex
CREATE INDEX "static_pages_slug_idx" ON "static_pages"("slug");

-- CreateIndex
CREATE INDEX "static_pages_pageKey_idx" ON "static_pages"("pageKey");

-- CreateIndex
CREATE INDEX "static_pages_isPublished_idx" ON "static_pages"("isPublished");

-- CreateIndex
CREATE INDEX "static_page_translations_locale_idx" ON "static_page_translations"("locale");

-- CreateIndex
CREATE INDEX "static_page_translations_slug_idx" ON "static_page_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "static_page_translations_pageId_locale_key" ON "static_page_translations"("pageId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "static_page_translations_locale_slug_key" ON "static_page_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "catalogue_items_locale_idx" ON "catalogue_items"("locale");

-- CreateIndex
CREATE INDEX "catalogue_items_categoryKey_idx" ON "catalogue_items"("categoryKey");

-- CreateIndex
CREATE INDEX "catalogue_items_isPublished_idx" ON "catalogue_items"("isPublished");

-- CreateIndex
CREATE INDEX "catalogue_items_position_idx" ON "catalogue_items"("position");

-- CreateIndex
CREATE INDEX "catalogue_items_year_idx" ON "catalogue_items"("year");

-- CreateIndex
CREATE UNIQUE INDEX "inquiry_statuses_slug_key" ON "inquiry_statuses"("slug");

-- CreateIndex
CREATE INDEX "inquiry_statuses_slug_idx" ON "inquiry_statuses"("slug");

-- CreateIndex
CREATE INDEX "inquiry_statuses_isActive_idx" ON "inquiry_statuses"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "inquiries_refNumber_key" ON "inquiries"("refNumber");

-- CreateIndex
CREATE INDEX "inquiries_statusId_idx" ON "inquiries"("statusId");

-- CreateIndex
CREATE INDEX "inquiries_customerEmail_idx" ON "inquiries"("customerEmail");

-- CreateIndex
CREATE INDEX "inquiries_priority_idx" ON "inquiries"("priority");

-- CreateIndex
CREATE INDEX "inquiries_assignedToId_idx" ON "inquiries"("assignedToId");

-- CreateIndex
CREATE INDEX "inquiries_productId_idx" ON "inquiries"("productId");

-- CreateIndex
CREATE INDEX "inquiries_createdAt_idx" ON "inquiries"("createdAt");

-- CreateIndex
CREATE INDEX "inquiry_messages_inquiryId_idx" ON "inquiry_messages"("inquiryId");

-- CreateIndex
CREATE INDEX "inquiry_messages_userId_idx" ON "inquiry_messages"("userId");

-- CreateIndex
CREATE INDEX "inquiry_messages_createdAt_idx" ON "inquiry_messages"("createdAt");

-- CreateIndex
CREATE INDEX "contact_submissions_email_idx" ON "contact_submissions"("email");

-- CreateIndex
CREATE INDEX "contact_submissions_isRead_idx" ON "contact_submissions"("isRead");

-- CreateIndex
CREATE INDEX "contact_submissions_createdAt_idx" ON "contact_submissions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_signups_email_key" ON "newsletter_signups"("email");

-- CreateIndex
CREATE INDEX "newsletter_signups_email_idx" ON "newsletter_signups"("email");

-- CreateIndex
CREATE INDEX "newsletter_signups_isActive_idx" ON "newsletter_signups"("isActive");

-- CreateIndex
CREATE INDEX "newsletter_signups_isVerified_idx" ON "newsletter_signups"("isVerified");

-- CreateIndex
CREATE INDEX "newsletter_signups_locale_idx" ON "newsletter_signups"("locale");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category_translations" ADD CONSTRAINT "product_category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_assets" ADD CONSTRAINT "product_assets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tag_translations" ADD CONSTRAINT "product_tag_translations_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "product_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tag_products" ADD CONSTRAINT "product_tag_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tag_products" ADD CONSTRAINT "product_tag_products_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "product_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_related" ADD CONSTRAINT "product_related_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_related" ADD CONSTRAINT "product_related_relatedProductId_fkey" FOREIGN KEY ("relatedProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_faqs" ADD CONSTRAINT "product_faqs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_article_translations" ADD CONSTRAINT "news_article_translations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_translations" ADD CONSTRAINT "blog_post_translations_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "static_page_translations" ADD CONSTRAINT "static_page_translations_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "static_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "inquiry_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_messages" ADD CONSTRAINT "inquiry_messages_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_messages" ADD CONSTRAINT "inquiry_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Full-text search indexes
CREATE INDEX "product_category_translations_search_idx"
  ON "product_category_translations"
  USING GIN (to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("description", '')));

CREATE INDEX "product_translations_search_idx"
  ON "product_translations"
  USING GIN (
    to_tsvector(
      'simple',
      coalesce("name", '') || ' ' ||
      coalesce("shortDescription", '') || ' ' ||
      coalesce("description", '') || ' ' ||
      coalesce("features", '') || ' ' ||
      coalesce("applications", '')
    )
  );

CREATE INDEX "product_tag_translations_search_idx"
  ON "product_tag_translations"
  USING GIN (to_tsvector('simple', coalesce("name", '')));

CREATE INDEX "product_faqs_search_idx"
  ON "product_faqs"
  USING GIN (to_tsvector('simple', coalesce("question", '') || ' ' || coalesce("answer", '')));

CREATE INDEX "testimonials_search_idx"
  ON "testimonials"
  USING GIN (to_tsvector('simple', coalesce("clientName", '') || ' ' || coalesce("content", '')));

CREATE INDEX "news_article_translations_search_idx"
  ON "news_article_translations"
  USING GIN (
    to_tsvector(
      'simple',
      coalesce("title", '') || ' ' ||
      coalesce("excerpt", '') || ' ' ||
      coalesce("content", '')
    )
  );

CREATE INDEX "blog_post_translations_search_idx"
  ON "blog_post_translations"
  USING GIN (
    to_tsvector(
      'simple',
      coalesce("title", '') || ' ' ||
      coalesce("excerpt", '') || ' ' ||
      coalesce("content", '') || ' ' ||
      coalesce(array_to_string("tags", ' '), '')
    )
  );

CREATE INDEX "static_page_translations_search_idx"
  ON "static_page_translations"
  USING GIN (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("content", '')));

