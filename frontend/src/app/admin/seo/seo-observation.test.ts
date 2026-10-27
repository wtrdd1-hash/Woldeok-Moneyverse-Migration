import { describe, expect, it } from 'vitest';
import { parseSeoObservation } from './seo-observation';

const observedAt = '2026-10-27T06:45:00.000Z';

function validPayload() {
  return {
    totalHits24h: 2,
    totalHits7d: 3,
    avgDurationMs: 40,
    botDistribution: { Googlebot: 2 },
    statusDistribution: { '200': 2 },
    stockCoverage: { indexed: 1, total: 1 },
    guideCoverage: { indexed: 0, total: 0 },
    targetUrls: [
      {
        path: '/stocks/CHIPS',
        category: 'stock',
        name: 'CHIPS',
        lastVisitedAt: observedAt,
        lastBot: 'Googlebot',
        lastStatusCode: 200,
        healthStatus: 'healthy',
      },
    ],
    recentLogs: [
      {
        id: 'log-1',
        botName: 'Googlebot',
        path: '/stocks/CHIPS',
        statusCode: 200,
        durationMs: 40,
        ipAddress: '192.0.2.1',
        userAgent: 'Googlebot',
        createdAt: observedAt,
      },
    ],
    indexNowKey: 'real-key',
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
  };
}

describe('admin SEO observation evidence', () => {
  it('accepts the guarded backend metrics shape and stamps observation provenance', () => {
    expect(parseSeoObservation(validPayload(), observedAt)).toMatchObject({
      totalHits24h: 2,
      provenance: {
        source: 'seo-status-api',
        observedAt,
        freshness: 'fresh',
        status: 'operational',
      },
    });
  });

  it('rejects partial public metrics instead of fabricating admin-only fields', () => {
    const { targetUrls: _targets, recentLogs: _logs, indexNowKey: _key, ...publicOnly } = validPayload();
    expect(parseSeoObservation(publicOnly, observedAt)).toBeNull();
  });

  it('rejects non-finite, fractional, negative and unsafe counters', () => {
    for (const invalid of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, '2']) {
      expect(parseSeoObservation({ ...validPayload(), totalHits24h: invalid }, observedAt)).toBeNull();
    }
  });

  it('rejects inconsistent 24h totals and invalid coverage', () => {
    expect(parseSeoObservation({ ...validPayload(), botDistribution: { Googlebot: 1 } }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...validPayload(), statusDistribution: { '200': 1 } }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...validPayload(), stockCoverage: { indexed: 2, total: 1 } }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...validPayload(), totalHits7d: 1 }, observedAt)).toBeNull();
  });

  it('rejects malformed crawler URLs, timestamps, duplicate targets and log IDs', () => {
    const good = validPayload();
    expect(parseSeoObservation({ ...good, targetUrls: [{ ...good.targetUrls[0], path: 'https://external.invalid/' }] }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...good, targetUrls: [{ ...good.targetUrls[0], lastVisitedAt: 'not-a-date' }] }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...good, targetUrls: [good.targetUrls[0], good.targetUrls[0]] }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...good, recentLogs: [good.recentLogs[0], good.recentLogs[0]] }, observedAt)).toBeNull();
  });

  it('rejects malformed record types, fake endpoint keys and missing data', () => {
    const good = validPayload();
    expect(parseSeoObservation({ ...good, recentLogs: [{ ...good.recentLogs[0], statusCode: '200' }] }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...good, indexNowKey: '' }, observedAt)).toBeNull();
    expect(parseSeoObservation({ ...good, sitemapUrl: 'javascript:alert(1)' }, observedAt)).toBeNull();
    expect(parseSeoObservation(null, observedAt)).toBeNull();
    expect(parseSeoObservation([], observedAt)).toBeNull();
  });
});
