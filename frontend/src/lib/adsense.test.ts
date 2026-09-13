import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

async function settings() {
  return (await import('./adsense')).homeAdSense;
}

describe('home AdSense settings', () => {
  it('defaults to the reviewed public unit when no ad switch is provided', async () => {
    delete process.env.ADS_ENABLED;
    delete process.env.NEXT_PUBLIC_ADS_ENABLED;
    delete process.env.ADSENSE_PUBLISHER_ID;
    delete process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
    delete process.env.ADSENSE_HOME_SLOT;
    delete process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT;
    expect(await settings()).toMatchObject({
      enabled: true,
      publisherId: 'ca-pub-5220225531544323',
      slot: '2118692561',
    });
  });

  it('can be explicitly disabled for test or emergency policy holds', async () => {
    process.env.ADS_ENABLED = 'false';
    expect((await settings()).enabled).toBe(false);
  });

  it('fails closed when the configured public unit is invalid', async () => {
    process.env.ADS_ENABLED = 'true';
    process.env.ADSENSE_PUBLISHER_ID = 'not-a-publisher';
    process.env.ADSENSE_HOME_SLOT = '2118692561';
    expect((await settings()).enabled).toBe(false);
  });

  it('accepts the configured public homepage unit when advertising is enabled', async () => {
    process.env.ADS_ENABLED = 'true';
    process.env.ADSENSE_PUBLISHER_ID = 'ca-pub-5220225531544323';
    process.env.ADSENSE_HOME_SLOT = '2118692561';
    expect(await settings()).toMatchObject({
      enabled: true,
      publisherId: 'ca-pub-5220225531544323',
      slot: '2118692561',
    });
  });
});
