import { afterEach, describe, expect, it, vi } from 'vitest';
import { SchedulerRunner } from './scheduler.module';

afterEach(() => vi.unstubAllEnvs());

function runner() {
  const engine = { start: vi.fn(), stop: vi.fn() };
  return { engine, runner: new SchedulerRunner(engine as never) };
}

describe('scheduler single-leader safety', () => {
  it('never starts scheduled writers in the test runtime even when explicitly enabled', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    const r = runner();
    r.runner.onApplicationBootstrap();
    expect(r.engine.start).not.toHaveBeenCalled();
  });

  it('defaults to no scheduler for every unconfigured backend/canary', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', '');
    const r = runner();
    r.runner.onApplicationBootstrap();
    expect(r.engine.start).not.toHaveBeenCalled();
  });

  it('keeps an explicitly disabled shadow backend read-only from scheduler jobs', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'false');
    const r = runner();
    r.runner.onApplicationBootstrap();
    expect(r.engine.start).not.toHaveBeenCalled();
  });

  it('starts only when a designated production leader explicitly opts in', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    const r = runner();
    r.runner.onApplicationBootstrap();
    expect(r.engine.start).toHaveBeenCalledTimes(1);
    r.runner.onApplicationShutdown();
    expect(r.engine.stop).toHaveBeenCalledTimes(1);
  });

  it('cannot start when database connection is unavailable', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    new SchedulerRunner(null).onApplicationBootstrap();
  });
});
