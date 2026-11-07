import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('sitemap-index reliable SEO modification signals', () => {
  it('never invents modification timestamps for other sitemaps at request time', async () => {
    const response = await GET();
    const xml = await response.text();
    expect(xml).toContain('<sitemapindex');
    expect(xml).toContain('/sitemap-blog.xml');
    // Actual blog content might have a verified material update, but unrelated
    // static/stock/board sitemaps must not claim every request changed them.
    expect(xml.match(/<lastmod>/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });

  it('does not submit sitemap URLs when SEO indexing is disabled', async () => {
    vi.stubEnv('SEO_INDEXING_ENABLED', 'false');
    try {
      const response = await GET();
      expect(await response.text()).not.toContain('<loc>');
      expect(response.headers.get('cache-control')).toBe('no-store');
    } finally { vi.unstubAllEnvs(); }
  });
});
