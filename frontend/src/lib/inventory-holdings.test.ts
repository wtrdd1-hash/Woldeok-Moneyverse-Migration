import { describe, expect, it } from 'vitest';
import { parseInventoryHoldings } from './inventory-holdings';

import { sampleHolding } from '@/testing/inventory-holding-fixture';

describe('owner inventory source proof', () => {
  it('distinguishes a verified empty response from missing or malformed evidence', () => {
    expect(parseInventoryHoldings({ holdings: [] })).toEqual({ holdings: [] });
    for (const value of [
      null,
      {},
      { holdings: null },
      { holdings: '[]' },
      { holdings: [{ code: 'fake' }] },
    ]) {
      expect(parseInventoryHoldings(value)).toBeNull();
    }
  });
  it('accepts exact integer strings and explicitly unknown legacy condition fields', () => {
    expect(parseInventoryHoldings({ holdings: [sampleHolding] })?.holdings[0]?.weekly_cost).toBe(
      '9007199254740993',
    );
    const legacy = { ...sampleHolding } as Record<string, unknown>;
    for (const key of [
      'durable',
      'weekly_cost',
      'effect_expires_at',
      'unpaid_weeks',
      'arrears_due',
      'arrears_cap',
      'suspended',
    ])
      delete legacy[key];
    expect(parseInventoryHoldings({ holdings: [legacy] })?.holdings[0]?.weekly_cost).toBeNull();
  });
  it('rejects duplicates, noncanonical WLD, malformed times and untrusted lifecycle fields', () => {
    expect(parseInventoryHoldings({ holdings: [sampleHolding, sampleHolding] })).toBeNull();
    for (const bad of [
      { weekly_cost: '0900' },
      { arrears_due: 1 },
      { unpaid_weeks: -1 },
      { suspended: 'false' },
      { acquired_at: 'tomorrow' },
      { acquired_at: '2026-10-30T00:00:00' },
      { quantity: 0 },
      { preview_data: [] },
      { effect_expires_at: 'invalid' },
    ])
      expect(parseInventoryHoldings({ holdings: [{ ...sampleHolding, ...bad }] })).toBeNull();
  });
});
