import { describe, expect, it } from 'vitest';
import { parseSavingPockets } from './saving-pocket-source';

const sample = {
  pocket_id: '11111111-1111-4111-8111-111111111111', name: '비상금',
  balance: '9007199254740993', target_amount: '9007199254740994',
  target_date: '2026-12-31', theme_color: 'emerald', icon_code: 'piggy-bank',
  is_archived: false, created_at: '2026-11-01T12:00:00.000Z', updated_at: '2026-11-01T12:00:00.000Z',
};

describe('owner saving pockets source proof', () => {
  it('preserves exact WLD strings and projects only approved pocket fields', () => {
    expect(parseSavingPockets([{ ...sample, untrustedInternalField: 'hidden' }])).toEqual([sample]);
    expect(parseSavingPockets([])).toEqual([]);
  });
  it.each([
    null, undefined, {}, { pockets: [] }, [{ ...sample, balance: 'bad' }],
    [{ ...sample, balance: '01' }], [{ ...sample, balance: '9223372036854775808' }], [{ ...sample, balance: -1 }],
    [{ ...sample, target_amount: '1.2' }], [{ ...sample, target_amount: '0' }], [{ ...sample, pocket_id: 'wrong' }],
    [{ ...sample, created_at: 'not-a-date' }], [{ ...sample, name: 'x'.repeat(65) }], [{ ...sample, name: '' }],
    [{ ...sample, is_archived: 'false' }], [{ ...sample, target_date: 'tomorrow' }],
    [sample, sample],
  ])('fails closed on malformed successful responses: %j', (payload) => {
    expect(parseSavingPockets(payload)).toBeNull();
  });
  it('accepts nullable target and serialized PostgreSQL date without inventing balance', () => {
    expect(parseSavingPockets([{ ...sample, target_amount: null, target_date: '2026-12-31T00:00:00.000Z' }]))
      .toMatchObject([{ balance: sample.balance, target_amount: null }]);
  });
});
