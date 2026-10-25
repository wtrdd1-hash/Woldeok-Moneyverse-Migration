import { describe, expect, it } from 'vitest';
import { validatedRecentReceipt } from './recent-receipt';

const TX = '33333333-3333-4333-8333-333333333333';
const BIG = '900719925474099312345678901234567890';
const valid = () => ({
  scope: 'recent_50',
  receipt: { transactionId: TX, type: 'BANK_DEPOSIT', label: '은행 입금', netAmount: '0', cashDelta: `-${BIG}`, bankDelta: BIG, direction: 'neutral', occurredAt: '2026-10-25T00:00:00.000Z' },
});

describe('recent wallet receipt display guard', () => {
  it('preserves exact signed 36-digit movements for a zero-net bank deposit', () => {
    expect(validatedRecentReceipt(valid(), TX)).toMatchObject({ cashDelta: `-${BIG}`, bankDelta: BIG, netAmount: '0' });
  });
  it('never displays a receipt from the wrong ID or an unverified pocket projection', () => {
    expect(validatedRecentReceipt(valid(), '44444444-4444-4444-8444-444444444444')).toBeNull();
    expect(validatedRecentReceipt({ ...valid(), receipt: { ...valid().receipt, bankDelta: '1' } }, TX)).toBeNull();
    expect(validatedRecentReceipt({ ...valid(), receipt: { ...valid().receipt, cashDelta: undefined } }, TX)).toBeNull();
  });
  it('rejects rounded, fabricated, or malformed money and scope', () => {
    expect(validatedRecentReceipt({ ...valid(), scope: 'all_history' }, TX)).toBeNull();
    expect(validatedRecentReceipt({ ...valid(), receipt: { ...valid().receipt, netAmount: 0 } }, TX)).toBeNull();
    expect(validatedRecentReceipt({ ...valid(), receipt: { ...valid().receipt, cashDelta: '-01' } }, TX)).toBeNull();
    expect(validatedRecentReceipt({ ...valid(), receipt: { ...valid().receipt, direction: 'in' } }, TX)).toBeNull();
  });
});
