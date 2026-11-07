import { describe, expect, it } from 'vitest';
import {
  normalizeWorkReceiptFloor,
  parseFilteredWorkReceipts,
  parseUnfilteredWorkReceipts,
  workReceiptsApiPath,
} from './work-receipt-reward-floor';
const row = (reward_amount: string) => ({
  receipt_id: '00000000-0000-4000-8000-000000000001',
  assignment_id: '00000000-0000-4000-8000-000000000002',
  code: 'DEVELOP',
  name: 'Work',
  reward_amount,
  experience_amount: '1',
  transaction_id: null,
  created_at: '2026-10-30T00:00:00Z',
});
describe('work receipt filter evidence', () => {
  it('builds canonical opt-in paths and rejects duplicate or malformed inputs', () => {
    expect(normalizeWorkReceiptFloor('9007199254740993')).toBe('9007199254740993');
    expect(normalizeWorkReceiptFloor(['1', '2'])).toBeNull();
    expect(normalizeWorkReceiptFloor('01')).toBeNull();
    expect(workReceiptsApiPath(undefined)).toBe('/api/v1/work/receipts');
    expect(workReceiptsApiPath('9007199254740993')).toBe(
      '/api/v1/work/receipts?minReward=9007199254740993',
    );
  });
  it('rejects ignored filters, fabricated rows, and too many rows', () => {
    expect(parseFilteredWorkReceipts({ receipts: [row('1')] }, '2')).toBeNull();
    expect(
      parseFilteredWorkReceipts({ scope: 'recent20', minReward: '2', receipts: [row('1')] }, '2'),
    ).toBeNull();
    expect(
      parseFilteredWorkReceipts(
        { scope: 'recent20', minReward: '2', receipts: Array(21).fill(row('2')) },
        '2',
      ),
    ).toBeNull();
    expect(
      parseFilteredWorkReceipts({ scope: 'recent20', minReward: '2', receipts: [row('2')] }, '2')
        ?.receipts,
    ).toHaveLength(1);
  });
});


describe('unfiltered owner work receipt evidence', () => {
  it('accepts a verified empty owner receipt list without inventing a payment', () => {
    expect(parseUnfilteredWorkReceipts({ receipts: [] })).toEqual({ receipts: [] });
  });
  it('preserves exact large integer WLD rewards', () => {
    expect(parseUnfilteredWorkReceipts({ receipts: [row('9007199254740993')] })?.receipts[0]?.reward_amount)
      .toBe('9007199254740993');
  });
  it.each([null, {}, { receipts: {} }, { receipts: 'none' }, { receipts: Array(21).fill(row('1')) },
    { receipts: [{ ...row('1'), reward_amount: '-1' }] },
    { receipts: [{ ...row('1'), receipt_id: 'bad' }] },
    { receipts: [{ ...row('1'), created_at: 'bad' }] },
    { receipts: [row('1'), row('1')] },
  ])('rejects malformed, duplicate or unbounded owner receipt responses', (payload) => {
    expect(parseUnfilteredWorkReceipts(payload)).toBeNull();
  });
});
