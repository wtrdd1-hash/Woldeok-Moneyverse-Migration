import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SeoCronPingService } from './seo-cron-ping.service';

describe('v739 scheduled SEO submission isolation', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSeoFlag = process.env.SEO_INDEXING_ENABLED;
  beforeEach(() => {
    vi.useFakeTimers();
    delete process.env.SEO_INDEXING_ENABLED;
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalSeoFlag === undefined) delete process.env.SEO_INDEXING_ENABLED;
    else process.env.SEO_INDEXING_ENABLED = originalSeoFlag;
  });

  function service() {
    const submitUrls = vi.fn().mockResolvedValue({ success: true, timestamp: new Date().toISOString(), submittedUrls: [] });
    return { service: new SeoCronPingService({ submitUrls } as any), submitUrls };
  }

  it('does not schedule public indexing in Test even when the feature flag is true', async () => {
    process.env.NODE_ENV = 'test';
    process.env.SEO_INDEXING_ENABLED = 'true';
    const { service: job, submitUrls } = service();
    job.onModuleInit();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(submitUrls).not.toHaveBeenCalled();
  });

  it('defaults to no scheduled indexing without explicit production enablement', async () => {
    process.env.NODE_ENV = 'production';
    const { service: job, submitUrls } = service();
    job.onModuleInit();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(31_000);
    expect(submitUrls).not.toHaveBeenCalled();
  });

  it('schedules exactly when production indexing was explicitly enabled', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SEO_INDEXING_ENABLED = 'true';
    const { service: job, submitUrls } = service();
    job.onModuleInit();
    expect(vi.getTimerCount()).toBe(2);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(submitUrls).toHaveBeenCalledTimes(1);
    job.onModuleDestroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels the initial delayed submission when the shadow is stopped early', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SEO_INDEXING_ENABLED = 'true';
    const { service: job, submitUrls } = service();
    job.onModuleInit();
    job.onModuleDestroy();
    await vi.advanceTimersByTimeAsync(40_000);
    expect(submitUrls).not.toHaveBeenCalled();
  });
});
