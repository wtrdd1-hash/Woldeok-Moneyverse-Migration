import { describe, expect, it } from 'vitest';
import { workReceiptAmountLabel } from './work';

describe('recent work receipt truthfulness', () => {
  it('only labels a ledger-verified amount as WLD paid', () => {
    expect(workReceiptAmountLabel('VERIFIED', '9007199254740993', false)).toBe('+9,007,199,254,740,993 WLD');
    expect(workReceiptAmountLabel('EXP_ONLY', '0', false)).toContain('EXP 전용');
    expect(workReceiptAmountLabel('UNVERIFIED', '100', false)).toContain('미확인');
    expect(workReceiptAmountLabel('UNVERIFIED', '100', false)).not.toContain('100 WLD 지급');
  });
});
