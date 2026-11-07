import { describe, expect, it } from 'vitest';
import { parseVerifiedShopHoldings } from './shop-holdings-evidence';
const row = {
  catalog_id: '11111111-1111-4111-8111-111111111111',
  code: 'frame-blue', name: 'Blue Frame', description: '',
  category: 'frame', quantity: 1, acquired_at: '2026-10-31T00:00:00.000Z',
  expires_at: null, effect_kind: 'none', rarity: 'common',
  animation_css: null, preview_data: {}, is_equipped: false,
  equipped_slot: null, serial_number: null,
};
describe('owner inventory verified read', () => {
  it('accepts a genuine empty result, not a missing response', () => {
    expect(parseVerifiedShopHoldings({ holdings: [] })).toEqual([]);
    expect(parseVerifiedShopHoldings({ holdings: [row] })).toEqual([row]);
  });
  it.each([null, {}, { holdings: null }, { holdings: {} }, { holdings: [null] },
    { holdings: [{ ...row, catalog_id: 'not-a-uuid' }] },
    { holdings: [{ ...row, quantity: -1 }] },
    { holdings: [{ ...row, name: '' }] },
  ])('rejects unverified 200 payloads', (payload) => {
    expect(parseVerifiedShopHoldings(payload)).toBeNull();
  });
});
