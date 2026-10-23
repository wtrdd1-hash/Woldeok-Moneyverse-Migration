import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('public SEO status BFF', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('returns aggregate fields without detailed crawler data', async () => {
    const metrics = {
      totalHits24h: 2, totalHits7d: 3, avgDurationMs: 4,
      botDistribution: {}, statusDistribution: {},
      stockCoverage: { indexed: 0, total: 10 },
      guideCoverage: { indexed: 0, total: 5 },
      sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
      recentLogs: [{ ipAddress: 'example-ip' }],
      indexNowKey: 'example-key',
      targetUrls: [{ path: '/example' }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(metrics), { status: 200 })));
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.totalHits24h).toBe(2);
    expect(body).not.toHaveProperty('recentLogs');
    expect(body).not.toHaveProperty('indexNowKey');
    expect(body).not.toHaveProperty('targetUrls');
  });

  it('reports unavailable without fabricating a success response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).totalHits24h).toBeUndefined();
  });
  it.each([
    ['missing coverage', { stockCoverage: undefined }],
    ['negative hits', { totalHits24h: -1 }],
    ['invalid coverage', { guideCoverage: { indexed: 6, total: 5 } }],
    ['untrusted bot label', { botDistribution: { 'private@example.com': 1 } }],
    ['unsafe sitemap', { sitemapUrl: 'javascript:alert(1)' }],
  ])('rejects %s instead of returning an incomplete success', async (_label, override) => {
    const metrics = {
      totalHits24h: 2, totalHits7d: 3, avgDurationMs: 4,
      botDistribution: { Googlebot: 2 }, statusDistribution: { '200': 2 },
      stockCoverage: { indexed: 0, total: 10 },
      guideCoverage: { indexed: 0, total: 5 },
      sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
      ...override,
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(metrics), { status: 200 })));
    const response = await GET();
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'seo_status_invalid' });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

});
