import { describe, expect, it } from 'vitest';
import { parseAnalyticsApiHealth, parseAnalyticsSeo } from './analytics-evidence';

const now = '2026-10-28T03:45:00+09:00';

describe('admin analytics authoritative evidence', () => {
  it('does not invent success, latency or uptime when the backend has not measured routes', () => {
    const result = parseAnalyticsApiHealth({
      serverTime: now, totalDomains: 1, totalEndpoints: 2,
      domains: [{ id: 'auth', name: '인증', measurementSource: 'NOT_MEASURED', measuredAt: null,
        latencyMs: null, successRate: null, status: 'UNKNOWN', endpointCount: 2 }],
    }, Date.parse(now));
    expect(result).toEqual([{ id: 'auth', name: '인증', endpointCount: 2, latencyMs: null, successRate: null, status: 'UNKNOWN' }]);
  });

  it('rejects stale, malformed and contradictory API health evidence', () => {
    const base = { serverTime: now, totalDomains: 1, totalEndpoints: 1,
      domains: [{ id: 'auth', name: '인증', measurementSource: 'ROUTE_METRICS', measuredAt: now,
        latencyMs: 12, successRate: 100, status: 'OPERATIONAL', endpointCount: 1 }] };
    expect(parseAnalyticsApiHealth(base, Date.parse(now) + 6 * 60_000)).toBeNull();
    expect(parseAnalyticsApiHealth({ ...base, domains: [base.domains[0], base.domains[0]] }, Date.parse(now))).toBeNull();
    expect(parseAnalyticsApiHealth({ ...base, domains: [{ ...base.domains[0], successRate: 140 }] }, Date.parse(now))).toBeNull();
    expect(parseAnalyticsApiHealth({ ...base, domains: [{ ...base.domains[0], measurementSource: 'NOT_MEASURED' }] }, Date.parse(now))).toBeNull();
  });

  it('retains only validated measured route evidence', () => {
    const result = parseAnalyticsApiHealth({ serverTime: now, totalDomains: 1, totalEndpoints: 1,
      domains: [{ id: 'auth', name: '인증', measurementSource: 'ROUTE_METRICS', measuredAt: now,
        latencyMs: 12, successRate: 99.5, status: 'DEGRADED', endpointCount: 1 }] }, Date.parse(now));
    expect(result?.[0]).toMatchObject({ latencyMs: 12, successRate: 99.5, status: 'DEGRADED' });
  });

  it('rejects missing/invalid SEO evidence rather than creating fake zero counts', () => {
    expect(parseAnalyticsSeo(null)).toBeNull();
    expect(parseAnalyticsSeo({ totalHits24h: -1 })).toBeNull();
    expect(parseAnalyticsSeo({ totalHits24h: 1, totalHits7d: 1, avgDurationMs: 5,
      botDistribution: {}, statusDistribution: {}, stockCoverage: { indexed: 3, total: 2 },
      guideCoverage: { indexed: 0, total: 2 } })).toBeNull();
  });

  it('accepts a validated admin SEO observation without leaking the IndexNow key to client charts', () => {
    const result = parseAnalyticsSeo({
      totalHits24h: 0, totalHits7d: 0, avgDurationMs: 0,
      botDistribution: {}, statusDistribution: {},
      stockCoverage: { indexed: 0, total: 0 }, guideCoverage: { indexed: 0, total: 0 },
      targetUrls: [], recentLogs: [], indexNowKey: 'private-key',
      sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
    }, now);
    expect(result).toMatchObject({ totalHits24h: 0, indexNowKey: '', provenance: { source: 'seo-status-api' } });
  });
});
