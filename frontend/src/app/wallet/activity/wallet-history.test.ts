import { describe, expect, it } from 'vitest';
import { historyHref, historyApiPath } from './wallet-history';

describe('private wallet history pagination links', () => {
  it('starts at the authenticated wallet history endpoint', () => {
    expect(historyApiPath()).toBe('/api/v1/wallet/history');
  });
  it('encodes both cursor fields without changing the owner', () => {
    const cursor = '22222222-2222-4222-8222-222222222222';
    expect(historyHref(cursor)).toBe('/wallet/activity?before=22222222-2222-4222-8222-222222222222');
    expect(historyApiPath(cursor)).toBe('/api/v1/wallet/history?before=22222222-2222-4222-8222-222222222222');
  });
});
