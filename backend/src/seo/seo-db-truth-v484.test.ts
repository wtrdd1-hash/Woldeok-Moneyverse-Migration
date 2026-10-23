import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SeoService } from './seo.service';

const production = { production: true } as never;
const development = { production: false } as never;

describe('SEO telemetry PostgreSQL authority', () => {
  it('refuses production metrics without an authoritative database pool', async () => {
    const service = new SeoService(undefined, undefined, production);
    await expect(service.getSeoMetrics()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('refuses production metrics on PostgreSQL failure without leaking the error', async () => {
    const pool = { query: vi.fn().mockRejectedValue(new Error('secret connection details')) };
    const service = new SeoService(pool as never, undefined, production);
    const failure = await service.getSeoMetrics().catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ServiceUnavailableException);
    expect(JSON.stringify((failure as ServiceUnavailableException).getResponse())).not.toContain('secret');
  });

  it('does not acknowledge an unpersisted production crawler hit', async () => {
    const pool = { query: vi.fn().mockRejectedValue(new Error('write failed')) };
    const service = new SeoService(pool as never, undefined, production);
    await expect(service.recordHit({ botName: 'Googlebot', path: '/stocks' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('refuses production crawler writes without a database pool', async () => {
    const service = new SeoService(undefined, undefined, production);
    await expect(service.recordHit({ botName: 'Googlebot', path: '/stocks' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('acknowledges production writes only after PostgreSQL succeeds and reads the persisted row', async () => {
    const pool = { query: vi.fn().mockResolvedValueOnce({ rowCount: 1 }) };
    const service = new SeoService(pool as never, undefined, production);
    const entry = await service.recordHit({ botName: 'Googlebot', path: '/stocks/CHIPS' });
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO seo_crawler_logs'),
      expect.arrayContaining([entry.id, 'Googlebot', '/stocks/CHIPS']));
    pool.query.mockResolvedValueOnce({ rows: [entry] });
    const metrics = await service.getSeoMetrics();
    expect(metrics.totalHits24h).toBe(1);
    expect(metrics.recentLogs).toEqual([entry]);
  });

  it('preserves local memory-only telemetry without a database pool', async () => {
    const service = new SeoService(undefined, undefined, development);
    await service.recordHit({ botName: 'Googlebot', path: '/stocks' });
    expect((await service.getSeoMetrics()).totalHits24h).toBe(1);
  });
});
