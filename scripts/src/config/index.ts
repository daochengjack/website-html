import { ScraperConfig, ImporterConfig, AssetDownloadConfig } from '../types/index.js';

export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  baseUrl: 'https://csceramic.com',
  startUrls: [
    'https://csceramic.com',
    'https://csceramic.com/products',
    'https://csceramic.com/blog',
  ],
  maxDepth: 5,
  throttleMs: 500, // Respect robots.txt by throttling requests
  respectRobotsTxt: true,
  userAgent: 'Mozilla/5.0 (compatible; CSCeramicDataScraper/1.0)',
  timeout: 30000,
  retries: 3,
  locale: 'en',
};

export const DEFAULT_IMPORTER_CONFIG: ImporterConfig = {
  dataDir: './data',
  locale: 'en',
  dryRun: false,
  logProgress: true,
  throttleMs: 100,
};

export const DEFAULT_ASSET_DOWNLOAD_CONFIG: AssetDownloadConfig = {
  enabled: true,
  outputDir: './public/imported-assets',
  maxSize: 100 * 1024 * 1024, // 100 MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export function loadConfig<T>(env: Record<string, string | undefined>, defaults: T): T {
  const config = { ...defaults };

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined || value === '') continue;

    const configKey = key
      .replace(/^SCRAPER_|^IMPORTER_|^ASSET_/, '')
      .toLowerCase() as keyof T;

    if (configKey in config) {
      const currentValue = config[configKey];

      if (typeof currentValue === 'boolean') {
        config[configKey] = (value.toLowerCase() === 'true') as T[keyof T];
      } else if (typeof currentValue === 'number') {
        config[configKey] = (parseInt(value, 10) || currentValue) as T[keyof T];
      } else {
        config[configKey] = value as T[keyof T];
      }
    }
  }

  return config;
}

export class ConfigManager {
  static getScraperConfig(): ScraperConfig {
    return loadConfig(process.env, DEFAULT_SCRAPER_CONFIG);
  }

  static getImporterConfig(): ImporterConfig {
    return loadConfig(process.env, DEFAULT_IMPORTER_CONFIG);
  }

  static getAssetConfig(): AssetDownloadConfig {
    return loadConfig(process.env, DEFAULT_ASSET_DOWNLOAD_CONFIG);
  }

  static merge<T extends Record<string, unknown>>(defaults: T, overrides: Partial<T>): T {
    return { ...defaults, ...overrides };
  }
}
