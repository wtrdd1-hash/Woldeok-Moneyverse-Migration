import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

const privatePolicy = [
  { key: 'x-robots-tag', value: 'noindex, nofollow' },
  { key: 'cache-control', value: 'private, no-store' },
  { key: 'referrer-policy', value: 'no-referrer' },
];

describe('owner stock trade history HTTP policy', () => {
  it('overrides global public indexing on root and locale-prefixed history routes', async () => {
    const headers = await config.headers!();
    const policies = headers.filter((entry) => entry.source.includes('/stocks/history'));
    expect(policies).toEqual([
      { source: '/stocks/history', headers: privatePolicy },
      { source: '/:locale(en|ja|zh|ko)/stocks/history', headers: privatePolicy },
    ]);
  });
});
