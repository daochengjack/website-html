export interface ScrapedCategory {
  slug: string;
  path: string;
  parentSlug?: string;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  iconUrl?: string;
  imageUrl?: string;
  position?: number;
  isPublished?: boolean;
  showInMenu?: boolean;
  locale: string;
}

export interface ScrapedProduct {
  sku: string;
  categorySlug?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  features?: string;
  applications?: string;
  metaTitle?: string;
  metaDescription?: string;
  images?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
  assets?: Array<{
    type: string;
    url: string;
    fileName: string;
    title?: string;
  }>;
  specifications?: Array<{
    key: string;
    value: string;
    unit?: string;
  }>;
  tags?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  isPublished?: boolean;
  isFeatured?: boolean;
  position?: number;
  locale: string;
}

export interface ScrapedBlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  authorName?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
  publishedAt?: string;
  locale: string;
}

export interface ScrapedStaticPage {
  slug: string;
  pageKey: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
  locale: string;
}

export interface ScraperConfig {
  baseUrl: string;
  startUrls: string[];
  maxDepth?: number;
  throttleMs?: number;
  respectRobotsTxt?: boolean;
  userAgent?: string;
  timeout?: number;
  retries?: number;
  locale?: string;
}

export interface ImporterConfig {
  dataDir: string;
  locale?: string;
  dryRun?: boolean;
  logProgress?: boolean;
  throttleMs?: number;
}

export interface AssetDownloadConfig {
  enabled: boolean;
  outputDir: string;
  maxSize?: number;
  allowedMimeTypes?: string[];
}

export interface ImportStats {
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  startedAt: Date;
  completedAt: Date;
  errorLog: Array<{
    item: string;
    error: string;
  }>;
}
