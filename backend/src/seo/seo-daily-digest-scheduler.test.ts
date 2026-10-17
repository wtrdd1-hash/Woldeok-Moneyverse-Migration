import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SeoDailyDigestService } from './seo-daily-digest.service';

const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

describe('daily SEO digest scheduler isolation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('APP_BASE_URL', 'https://test.easy-scraping.com');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'false');
    vi.stubEnv('SEO_DAILY_DIGEST_SCHEDULER_ENABLED', 'false');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function create() {
    const service = new SeoDailyDigestService({} as never);
    const digest = vi.spyOn(service, 'sendDailyDigest').mockResolvedValue({} as never);
    return { service, digest };
  }

  it('never schedules shadow/Test background Discord digest', async () => {
    const { service, digest } = create();
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(TWO_DAYS_MS);
    expect(digest).not.toHaveBeenCalled();
    service.onModuleDestroy();
  });

  it('ignores explicit opt-in outside the authoritative production origin', async () => {
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    vi.stubEnv('SEO_DAILY_DIGEST_SCHEDULER_ENABLED', 'true');
    const { service, digest } = create();
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(TWO_DAYS_MS);
    expect(digest).not.toHaveBeenCalled();
    service.onModuleDestroy();
  });

  it('runs only for the authorized production leader and clears timers on shutdown', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    vi.stubEnv('SEO_DAILY_DIGEST_SCHEDULER_ENABLED', 'true');
    const { service, digest } = create();
    service.onModuleInit();
    service.onModuleDestroy();
    await vi.advanceTimersByTimeAsync(TWO_DAYS_MS);
    expect(digest).not.toHaveBeenCalled();
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(TWO_DAYS_MS);
    expect(digest).toHaveBeenCalled();
    service.onModuleDestroy();
  });
});
