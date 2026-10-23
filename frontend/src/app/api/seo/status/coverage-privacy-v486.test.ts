import { expect, it, vi } from 'vitest';
import { GET } from './route';

it('does not forward nested private coverage fields from upstream', async () => {
  const metrics = {
    totalHits24h: 1, totalHits7d: 1, avgDurationMs: 1,
    botDistribution: {}, statusDistribution: {},
    stockCoverage: { indexed: 1, total: 2, internalPath: '/private' },
    guideCoverage: { indexed: 1, total: 2, auditSecret: 'private-audit' },
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
  };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(metrics), { status: 200 })));
  try {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.stockCoverage).toEqual({ indexed: 1, total: 2 });
    expect(body.guideCoverage).toEqual({ indexed: 1, total: 2 });
  } finally { vi.unstubAllGlobals(); }
});
