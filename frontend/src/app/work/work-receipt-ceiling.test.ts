import { describe, expect, it } from 'vitest';
import { normalizedReceiptCeiling, workReceiptsApiPath, verifiedReceiptCeiling } from './work-receipt-ceiling';

const row = (reward_amount: unknown) => ({
  receipt_id: '11111111-2222-4333-8444-555555555555',
  assignment_id: '22222222-2222-4333-8444-555555555555',
  code: 'test', name: 'Task', reward_amount, experience_amount: '1',
  transaction_id: null, created_at: '2026-10-31T00:00:00Z',
});
describe('member work receipt ceiling', () => {
  it('preserves the original endpoint when not selected', () => {
    expect(workReceiptsApiPath(null)).toBe('/api/v1/work/receipts');
    expect(normalizedReceiptCeiling(undefined)).toBeNull();
  });
  it('retains exact large integer values without Number conversion', () => {
    expect(normalizedReceiptCeiling('9007199254740993')).toBe('9007199254740993');
    expect(workReceiptsApiPath('9007199254740993')).toBe('/api/v1/work/receipts?maxReceiptReward=9007199254740993');
  });
  it.each(['-1','01','1e3','1.0',' 1','9999999999999999999',''])('rejects %s', (value) => {
    expect(normalizedReceiptCeiling(value)).toBeNull();
  });
  it('fails closed on malformed, over-ceiling and oversized upstream results', () => {
    expect(verifiedReceiptCeiling({ receipts: [row('100')] }, '99')).toBe(false);
    expect(verifiedReceiptCeiling({ receipts: [row('9007199254740993')] }, '9007199254740993')).toBe(true);
    expect(verifiedReceiptCeiling({ receipts: [row(5)] }, '10')).toBe(false);
    expect(verifiedReceiptCeiling({ receipts: Array(21).fill(row('1')) }, '10')).toBe(false);
  });
});
