import { URL } from 'url';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeUrl(url: string, baseUrl?: string): string {
  try {
    const parsed = new URL(url, baseUrl);
    return parsed.href;
  } catch {
    return url;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname || '';
  } catch {
    return '';
  }
}

export function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function stripHtmlTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/_+/g, '_')
    .substring(0, 255);
}

export function extractNumberValue(text: string): number | null {
  const match = text.match(/(-?\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

export function parseStructuredTableData(
  rows: string[][],
  hasHeader: boolean = true
): Array<Record<string, string>> {
  if (rows.length === 0) return [];

  const data: Array<Record<string, string>> = [];
  const headers = hasHeader ? rows[0] : rows[0].map((_, i) => `col_${i}`);
  const dataRows = hasHeader ? rows.slice(1) : rows;

  dataRows.forEach((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    data.push(obj);
  });

  return data;
}

export function buildHierarchicalPath(slugs: string[]): string {
  return '/' + slugs.map(generateSlug).join('/');
}

export interface ExtractedSpecification {
  key: string;
  value: string;
  unit?: string;
}

export function parseSpecifications(tableRows: string[][]): ExtractedSpecification[] {
  const specs: ExtractedSpecification[] = [];

  tableRows.forEach((row) => {
    if (row.length >= 2) {
      const key = cleanText(row[0]);
      const value = cleanText(row[1]);
      const unit = row.length > 2 ? cleanText(row[2]) : undefined;

      if (key && value) {
        specs.push({ key, value, unit: unit || undefined });
      }
    }
  });

  return specs;
}

export function extractTagsFromText(text: string, delimiter: string = ','): string[] {
  return text
    .split(delimiter)
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length <= 50)
    .slice(0, 50); // Limit to 50 tags
}

export function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];

    if (sourceValue !== undefined && sourceValue !== null) {
      if (
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        typeof result[key] === 'object' &&
        !Array.isArray(result[key])
      ) {
        result[key] = mergeDeep(result[key] as Record<string, unknown>, sourceValue as Record<string, unknown>) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateSku(base: string, index: number = 0): string {
  const sku = generateSlug(base)
    .toUpperCase()
    .substring(0, 20);
  return index > 0 ? `${sku}-${index}` : sku;
}
