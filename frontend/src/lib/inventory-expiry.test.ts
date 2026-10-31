import { describe, expect, it } from 'vitest';
import { parseInventoryExpiryWindow, isVerifiedExpiryHoldings } from './inventory-expiry';

const now = Date.parse('2026-10-31T13:00:00.000Z');
const item = { catalog_id: '00000000-0000-4000-8000-000000000001', quantity: 2, expires_at: '2026-11-03T13:00:00.000Z' };

describe('owner inventory expiry evidence', () => {
  it('only accepts canonical 7d/30d selections', () => {
    expect(parseInventoryExpiryWindow('7d')).toBe('7d');
    expect(parseInventoryExpiryWindow('30d')).toBe('30d');
    for (const value of ['7D', '0d', '31d', '7d&filter=all', ['7d', '30d']]) {
      expect(parseInventoryExpiryWindow(value)).toBeNull();
    }
  });
  it('accepts verified owner rows in the requested rolling window', () => {
    expect(isVerifiedExpiryHoldings({ filter: 'expiring_7d', holdings: [item] }, 'expiring_7d', now)).toBe(true);
    expect(isVerifiedExpiryHoldings({ filter: 'expiring_30d', holdings: [] }, 'expiring_30d', now)).toBe(true);
  });
  it('rejects forged, missing, duplicate and out-of-window evidence', () => {
    const proof = (holdings: unknown) => ({ filter: 'expiring_7d', holdings });
    expect(isVerifiedExpiryHoldings(proof([{ ...item, expires_at: null }]), 'expiring_7d', now)).toBe(false);
    expect(isVerifiedExpiryHoldings(proof([{ ...item, expires_at: '2026-11-20T13:00:00Z' }]), 'expiring_7d', now)).toBe(false);
    expect(isVerifiedExpiryHoldings(proof([item, item]), 'expiring_7d', now)).toBe(false);
    expect(isVerifiedExpiryHoldings({ filter: 'all', holdings: [item] }, 'expiring_7d', now)).toBe(false);
    expect(isVerifiedExpiryHoldings(proof([{ ...item, quantity: 0 }]), 'expiring_7d', now)).toBe(false);
  });
});
