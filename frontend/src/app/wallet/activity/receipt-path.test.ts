import { describe, expect, it } from 'vitest';
import { receiptPath } from './receipt-path';

describe('wallet receipt navigation', () => {
  it('accepts canonical UUIDs and returns a private receipt route', () => {
    expect(receiptPath('22222222-2222-4222-8222-222222222222'))
      .toBe('/wallet/activity/22222222-2222-4222-8222-222222222222');
  });
  it('rejects paths, script fragments and malformed references', () => {
    for (const bad of ['../admin', '/admin', '<script>', '123', '22222222-2222-4222-8222-222222222222/../admin']) {
      expect(receiptPath(bad)).toBeNull();
    }
  });
});
