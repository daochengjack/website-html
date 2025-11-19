import * as cheerio from 'cheerio';

export type CheerioRoot = ReturnType<typeof cheerio.load>;

export class HtmlParser {
  private $: CheerioRoot;

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  getTitle(): string {
    return this.$('title').text().trim();
  }

  getMetaDescription(): string {
    return this.$('meta[name="description"]').attr('content') || '';
  }

  getMetaKeywords(): string {
    return this.$('meta[name="keywords"]').attr('content') || '';
  }

  getH1(): string {
    return this.$('h1').first().text().trim();
  }

  getText(selector: string): string {
    return this.$(selector).text().trim();
  }

  getHtml(selector: string): string {
    return this.$(selector).html() || '';
  }

  getAllText(selector: string): string[] {
    const texts: string[] = [];
    this.$(selector).each((_, el) => {
      const text = this.$(el).text().trim();
      if (text) texts.push(text);
    });
    return texts;
  }

  extractLinks(selector?: string): Array<{ href: string; text: string }> {
    const links: Array<{ href: string; text: string }> = [];
    const elements = selector ? this.$(selector).find('a') : this.$('a');

    elements.each((_, el) => {
      const href = this.$(el).attr('href');
      const text = this.$(el).text().trim();

      if (href && text) {
        links.push({ href, text });
      }
    });

    return links;
  }

  extractImages(selector?: string): Array<{ src: string; alt: string }> {
    const images: Array<{ src: string; alt: string }> = [];
    const elements = selector ? this.$(selector).find('img') : this.$('img');

    elements.each((_, el) => {
      const src = this.$(el).attr('src');
      const alt = this.$(el).attr('alt') || '';

      if (src) {
        images.push({ src, alt });
      }
    });

    return images;
  }

  extractTableData(selector: string): string[][] {
    const rows: string[][] = [];
    this.$(selector).find('tbody tr').each((_, row) => {
      const cells: string[] = [];
      this.$(row).find('td').each((_, cell) => {
        cells.push(this.$(cell).text().trim());
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
    return rows;
  }

  stripHtml(html: string): string {
    const $ = cheerio.load(html);
    return $('body').text().trim();
  }

  cleanHtml(html: string): string {
    const $ = cheerio.load(html);

    // Remove scripts and styles
    $('script, style, noscript').remove();

    // Remove comments
    const content = $.html() || '';
    const cleanedContent = content.replace(/<!--[\s\S]*?-->/g, '');

    const $clean = cheerio.load(cleanedContent);

    // Remove inline styles and event handlers
    $clean('[style]').removeAttr('style');
    $clean('[onclick], [onload], [onerror]').removeAttr('onclick onload onerror');

    return $clean('body').html() || '';
  }

  sanitizeText(text: string): string {
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

  extractStructuredData(type: string): Record<string, unknown> {
    let data = {};

    // Try JSON-LD
    const jsonLd = this.$(`script[type="application/ld+json"]`).first().text();
    if (jsonLd) {
      try {
        data = JSON.parse(jsonLd);
      } catch {
        // Ignore parse errors
      }
    }

    return data;
  }
}

export function parseHtml(html: string): HtmlParser {
  return new HtmlParser(html);
}
