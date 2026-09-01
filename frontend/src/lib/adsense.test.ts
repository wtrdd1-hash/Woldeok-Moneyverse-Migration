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
  it('fails closed unless the deployment enables a complete public unit', async () => {
    process.env.ADS_ENABLED = 'true';
    process.env.ADSENSE_PUBLISHER_ID = 'not-a-publisher';
    process.env.ADSENSE_HOME_SLOT = '2118692561';
    expect((await settings()).enabled).toBe(false);
  });

  it('accepts the configured public homepage unit only when advertising is enabled', async () => {
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
