import { afterEach, describe, expect, it, vi } from 'vitest';
import { SchedulerRunner } from './scheduler.module';
import type { Scheduler } from './scheduler';
describe('scheduler execution safety for isolated Test backends', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('does not execute financial/background jobs in NODE_ENV=test', () => {
    vi.stubEnv('NODE_ENV', 'test');
    const start = vi.fn(), stop = vi.fn();
    const runner = new SchedulerRunner({ start, stop } as unknown as Scheduler);
    runner.onApplicationBootstrap();
    expect(start).not.toHaveBeenCalled();
    runner.onApplicationShutdown();
    expect(stop).not.toHaveBeenCalled();
  });
  it('starts in production unless explicitly disabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'false');
    const start = vi.fn(), stop = vi.fn();
    const runner = new SchedulerRunner({ start, stop } as unknown as Scheduler);
    runner.onApplicationBootstrap();
    expect(start).not.toHaveBeenCalled();
    runner.onApplicationShutdown();
    expect(stop).not.toHaveBeenCalled();
  });
});
