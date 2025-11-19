import axios, { AxiosInstance } from 'axios';
import { URL } from 'url';

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  userAgent?: string;
  retries?: number;
}

export class HttpClient {
  private client: AxiosInstance;
  private retries: number;
  private throttleMs: number = 0;
  private lastRequestTime: number = 0;

  constructor(config?: HttpClientConfig) {
    const {
      baseUrl = '',
      timeout = 30000,
      userAgent = 'Mozilla/5.0 (compatible; DataScraper/1.0)',
      retries = 3,
    } = config || {};

    this.retries = retries;

    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
  }

  setThrottle(ms: number): void {
    this.throttleMs = ms;
  }

  private async applyThrottle(): Promise<void> {
    if (this.throttleMs <= 0) return;

    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < this.throttleMs) {
      await new Promise((resolve) => setTimeout(resolve, this.throttleMs - elapsed));
    }

    this.lastRequestTime = Date.now();
  }

  async get(url: string, retryCount = 0): Promise<string> {
    try {
      await this.applyThrottle();

      const response = await this.client.get(url, {
        validateStatus: (status) => status < 500,
      });

      if (response.status === 429) {
        // Too many requests, retry with backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        if (retryCount < this.retries) {
          console.log(`Rate limited. Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.get(url, retryCount + 1);
        }
        throw new Error(`Rate limited after ${this.retries} retries`);
      }

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${url}`);
      }

      return response.data;
    } catch (error) {
      if (retryCount < this.retries && (error instanceof Error && error.message.includes('ECONNRESET' || 'ETIMEDOUT'))) {
        const delay = 1000 * Math.pow(2, retryCount);
        console.log(`Request failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.get(url, retryCount + 1);
      }
      throw error;
    }
  }

  static isValidUrl(url: string, baseUrl?: string): boolean {
    try {
      const parsedUrl = new URL(url, baseUrl);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  static normalizeUrl(url: string, baseUrl?: string): string {
    try {
      const parsed = new URL(url, baseUrl);
      // Remove trailing slash for consistency, except for root
      let normalized = parsed.href;
      if (normalized.endsWith('/') && normalized !== parsed.origin + '/') {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } catch {
      return url;
    }
  }
}
