import { describe, expect, it } from 'vitest';
import { isVerifiedInventoryAttention } from './inventory-attention';
const uuid = '11111111-1111-4111-8111-111111111111';
const due = { catalog_id: uuid, suspended: false, unpaid_weeks: 0, arrears_due: '9007199254740993' };
describe('owner inventory attention proof', () => {
  it('accepts proven empty results and bigint arrears', () => {
    expect(isVerifiedInventoryAttention({ filter: 'attention', holdings: [] })).toBe(true);
    expect(isVerifiedInventoryAttention({ filter: 'attention', holdings: [due] })).toBe(true);
  });
  it.each([
    { holdings: [] },
    { filter: 'all', holdings: [] },
    { filter: 'attention', holdings: [{ ...due, arrears_due: '0' }] },
    { filter: 'attention', holdings: [{ ...due, arrears_due: '1.0' }] },
    { filter: 'attention', holdings: [due, { ...due, catalog_id: uuid.toUpperCase() }] },
    { filter: 'attention', holdings: [{ ...due, catalog_id: 'invalid' }] },
    { filter: 'attention', holdings: [{ ...due, unpaid_weeks: -1 }] },
  ])('rejects unsupported, forged or ambiguous evidence %#', (payload) => {
    expect(isVerifiedInventoryAttention(payload)).toBe(false);
  });
});
