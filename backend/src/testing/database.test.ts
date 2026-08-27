import { describe, expect, it } from 'vitest';
import { isMissingGrant, rejectionOf } from './database';

describe('isMissingGrant', () => {
  // PostgreSQL's own privilege check.
  it('recognises a lost table grant', () => {
    expect(
      isMissingGrant({ code: '42501', message: 'permission denied for table virtual_stocks' }),
    ).toBe(true);
  });

  it('recognises a lost function grant', () => {
    expect(
      isMissingGrant({ code: '42501', message: 'permission denied for function stock_trade' }),
    ).toBe(true);
  });

  // Fifteen migrations raise 42501 themselves to refuse a caller's role. That
  // is the security model working, not a broken deployment, and conflating
  // the two is what made the first version of this check unusable.
  it.each([
    'operator role required',
    'active administrator role required',
    'active approver role required for reconciliation health',
    'requester cannot approve their own request',
  ])('does not mistake the function refusal %s for a lost grant', (message) => {
    expect(isMissingGrant({ code: '42501', message })).toBe(false);
  });

  it('ignores every other SQLSTATE', () => {
    expect(isMissingGrant({ code: '23505', message: 'permission denied for table x' })).toBe(false);
  });

  it('ignores a non-error value', () => {
    expect(isMissingGrant(null)).toBe(false);
    expect(isMissingGrant('permission denied')).toBe(false);
  });
});

describe('rejectionOf', () => {
  it('returns the rejection reason', async () => {
    const boom = new Error('boom');
    await expect(rejectionOf(() => Promise.reject(boom))).resolves.toBe(boom);
  });

  it('returns null when the attempt resolves', async () => {
    await expect(rejectionOf(() => Promise.resolve('fine'))).resolves.toBeNull();
  });
});
