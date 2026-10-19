import { afterEach, describe, expect, it } from 'vitest';
import robots from './robots';
import sitemap from './sitemap';

const originalBase = process.env.APP_BASE_URL;
const originalIndexing = process.env.SEO_INDEXING_ENABLED;

afterEach(() => {
  if (originalBase === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = originalBase;
  if (originalIndexing === undefined) delete process.env.SEO_INDEXING_ENABLED;
  else process.env.SEO_INDEXING_ENABLED = originalIndexing;
});

describe('public search surface', () => {
  it('lists only durable public pages in the production sitemap', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    process.env.APP_BASE_URL = 'https://easy-scraping.com';

    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain('https://easy-scraping.com');
    expect(urls).toContain('https://easy-scraping.com/tools');
    expect(urls).toContain('https://easy-scraping.com/tools/compound-calculator');
    expect(urls).toContain('https://easy-scraping.com/tools/compound-calculator/10m-3y-5p');
    expect(urls).toContain('https://easy-scraping.com/tools/compound-calculator/10m-5y-10p');
    expect(urls).toContain('https://easy-scraping.com/tools/stock-calculator');
    expect(urls).toContain('https://easy-scraping.com/tools/stock-calculator/chips-minus-20');
    expect(urls).toContain('https://easy-scraping.com/tools/farming-calculator');
    expect(urls).toContain('https://easy-scraping.com/tools/farming-calculator/intern-vs-executive');
    expect(urls).toContain('https://easy-scraping.com/newspaper');
    expect(urls).toContain('https://easy-scraping.com/marketplace/auction');
    expect(urls).toContain('https://easy-scraping.com/stocks/CHIPS');
    expect(urls.length).toBeGreaterThanOrEqual(35);

    // Only actually translated equivalents may appear as hreflang alternates.
    const byPath = (path: string) =>
      entries.find((entry) => entry.url === `https://easy-scraping.com${path}`);

    const translatedCompound = byPath('/tools/compound-calculator');
    expect(translatedCompound?.alternates?.languages?.en)
      .toBe('https://easy-scraping.com/en/tools/compound-interest-calculator');
    expect(translatedCompound?.alternates?.languages?.ja)
      .toBe('https://easy-scraping.com/ja/tools/compound-interest-calculator');
    expect(translatedCompound?.alternates?.languages?.zh)
      .toBe('https://easy-scraping.com/zh/tools/compound-interest-calculator');

    expect(byPath('/guide/glossary/per')?.alternates?.languages?.ja)
      .toBe('https://easy-scraping.com/ja/guide/glossary/per');
    expect(byPath('/en/guide/glossary/per')?.alternates?.languages)
      .toEqual(byPath('/guide/glossary/per')?.alternates?.languages);
    expect(byPath('/ja/tools/compound-interest-calculator')?.alternates?.languages)
      .toEqual(translatedCompound?.alternates?.languages);

    for (const koreanOnlyPath of [
      '/tools/compound-calculator/10m-3y-5p',
      '/tools/stock-calculator/chips-minus-20',
      '/tools/loan-interest-calculator',
      '/stocks/CHIPS',
    ]) {
      expect(byPath(koreanOnlyPath)?.alternates).toBeUndefined();
    }

    for (const entry of entries) {
      for (const alternate of Object.values(entry.alternates?.languages || {})) {
        expect(alternate.includes('/en/en/') || alternate.includes('/ja/ja/') || alternate.includes('/zh/zh/')).toBe(false);
      }
    }

    // Public finance routes are indexed; member-only and private pages stay out of sitemap
    expect(urls).not.toContain('https://easy-scraping.com/quests');
    expect(urls).not.toContain('https://easy-scraping.com/businesses');
    expect(urls).not.toContain('https://easy-scraping.com/shop/catalog');
    expect(urls).not.toContain('https://easy-scraping.com/wallet');
    expect(urls).not.toContain('https://easy-scraping.com/bank');
    expect(urls).not.toContain('https://easy-scraping.com/admin');
  });

  it('keeps service monitoring out of crawler paths', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const rules = robots().rules;

    if (Array.isArray(rules)) throw new Error('expected one crawler rule');
    expect(rules.disallow).toContain('/status');
  });

  it('exposes canonical sitemap to search crawlers in robots.txt', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    process.env.APP_BASE_URL = 'https://easy-scraping.com';
    const sitemapUrl = robots().sitemap;

    expect(sitemapUrl).toContain('https://easy-scraping.com/sitemap.xml');
    expect(sitemapUrl).toContain('https://easy-scraping.com/sitemap-index.xml');
  });
});
