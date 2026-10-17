import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SeoCrawlerAuditService } from './seo-crawler-audit.service';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function makeService() {
  const service = new SeoCrawlerAuditService({} as never);
  const audit = vi.spyOn(service, 'runCrawlAudit').mockResolvedValue({
    timestamp: '2026-10-17T00:00:00.000Z',
    totalUrlsChecked: 0,
    healthyUrls: 0,
    errorUrls: 0,
    issues: [],
    discordNotified: false,
  });
  return { service, audit };
}

describe('SEO crawl audit background execution ownership', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('APP_BASE_URL', 'https://test.easy-scraping.com');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'false');
    vi.stubEnv('SEO_CRAWL_AUDIT_SCHEDULER_ENABLED', 'false');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('does not schedule background network or Discord work in Test/shadow', async () => {
    const { service, audit } = makeService();
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(SIX_HOURS_MS + 60_000);
    expect(audit).not.toHaveBeenCalled();
    service.onModuleDestroy();
  });

  it('rejects opt-in in Test despite a scheduler-leader flag', async () => {
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    vi.stubEnv('SEO_CRAWL_AUDIT_SCHEDULER_ENABLED', 'true');
    const { service, audit } = makeService();
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(SIX_HOURS_MS + 60_000);
    expect(audit).not.toHaveBeenCalled();
    service.onModuleDestroy();
  });

  it('schedules once only for an explicitly authorized production leader', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    vi.stubEnv('SEO_CRAWL_AUDIT_SCHEDULER_ENABLED', 'true');
    const { service, audit } = makeService();
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(45_000);
    expect(audit).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(SIX_HOURS_MS);
    expect(audit).toHaveBeenCalledTimes(2);
    service.onModuleDestroy();
  });

  it('cancels both initial and interval jobs during shutdown', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    vi.stubEnv('SEO_CRAWL_AUDIT_SCHEDULER_ENABLED', 'true');
    const { service, audit } = makeService();
    service.onModuleInit();
    service.onModuleDestroy();
    await vi.advanceTimersByTimeAsync(SIX_HOURS_MS + 60_000);
    expect(audit).not.toHaveBeenCalled();
  });
});
