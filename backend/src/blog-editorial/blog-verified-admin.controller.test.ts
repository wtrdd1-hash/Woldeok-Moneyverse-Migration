import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlogVerifiedAdminController } from './blog-verified-admin.controller';

describe('verified blog admin publisher status (read-only)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not claim enabled when the model has no verified source-to-receipt run', async () => {
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'false');
    vi.stubEnv('BLOG_VERIFIED_WORKER_ENABLED', 'false');
    vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED', 'false');
    vi.stubEnv('BLOG_EDITORIAL_MODEL_VERIFIED', '');
    const controller = new BlogVerifiedAdminController({list:vi.fn().mockResolvedValue([])} as never);
    const status = await controller.publisherStatus();
    expect(status).toMatchObject({
      success:true, automaticEnabled:false,manualEnabled:false,modelVerified:false,
      verifiedPublishedCount:0,reason:'MODEL_VERIFICATION_PENDING',
    });
    expect(status.nextSlot?.country).toMatch(/^(KR|US|JP|CN)$/);
    expect(status.nextSlot?.periodKey).toMatch(/T(?:0[02468]|1[02468]|2[02]):00\+09:00$/);
  });

  it('only marks configured if both certified model and actual scheduler flags are on', async () => {
    vi.stubEnv('BLOG_VERIFIED_WORKER_ENABLED', 'false');
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'true');
    vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED', 'true');
    vi.stubEnv('BLOG_EDITORIAL_MODEL_VERIFIED', 'true');
    const controller = new BlogVerifiedAdminController({list:vi.fn().mockResolvedValue([{}])} as never);
    const status = await controller.publisherStatus();
    expect(status).toMatchObject({
      automaticEnabled:true,manualEnabled:false,modelVerified:true,
      verifiedPublishedCount:1,reason:'AUTOMATIC_SCHEDULER_CONFIGURED',
    });
  });
  it('reports the dedicated systemd timer without enabling the monetary scheduler', async () => {
    vi.stubEnv('MONEYVERSE_SCHEDULER_ENABLED', 'false');
    vi.stubEnv('BLOG_VERIFIED_WORKER_ENABLED', 'true');
    vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED', 'true');
    vi.stubEnv('BLOG_EDITORIAL_MODEL_VERIFIED', 'true');
    const controller = new BlogVerifiedAdminController({list:vi.fn().mockResolvedValue([{}])} as never);
    await expect(controller.publisherStatus()).resolves.toMatchObject({
      automaticEnabled:true,manualEnabled:false,executionMode:'DEDICATED_TIMER',
      verifiedPublishedCount:1,
    });
  });
});
