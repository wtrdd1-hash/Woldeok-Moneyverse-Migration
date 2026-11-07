import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

const required = {
  'x-robots-tag': 'noindex, nofollow',
  'cache-control': 'private, no-store',
  'referrer-policy': 'no-referrer',
};

describe('owner wallet edge privacy contract', () => {
  it('enforces private response headers for the owner wallet and its activity/details routes', async () => {
    const rules = await config.headers?.();
    expect(rules).toBeDefined();
    const walletRules = (rules ?? []).filter((rule) => rule.source === '/wallet/:path*');
    expect(walletRules).toHaveLength(1);
    const headers = Object.fromEntries(walletRules[0]!.headers.map(({ key, value }) => [key.toLowerCase(), value]));
    expect(headers).toMatchObject(required);
  });

  it('covers locale-prefixed wallet routes with the same private response policy', async () => {
    const rules = await config.headers?.();
    const walletRules = (rules ?? []).filter((rule) => rule.source === '/:locale(ko|en|ja|zh)/wallet/:path*');
    expect(walletRules).toHaveLength(1);
    const headers = Object.fromEntries(walletRules[0]!.headers.map(({ key, value }) => [key.toLowerCase(), value]));
    expect(headers).toMatchObject(required);
  });
});
