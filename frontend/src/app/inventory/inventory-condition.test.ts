import { describe, expect, it } from 'vitest';
import { describeInventoryCondition, isVerifiedInventoryCondition } from './inventory-condition';

describe('member inventory lifecycle evidence', () => {
  it('shows distinct holding/effect expiry, durable property and exact WLD strings', () => {
    const evidence = describeInventoryCondition({ expires_at: '2026-11-02T00:00:00Z', effect_expires_at: '2026-11-03T00:00:00Z', durable: true, weekly_cost: '9007199254740993', arrears_due: '0', arrears_cap: '9007199254740995', unpaid_weeks: 0, suspended: false });
    expect(evidence).toContainEqual(expect.objectContaining({ label: '주간 유지비', value: expect.stringContaining('9,007,199,254,740,993') }));
    expect(evidence.find((row) => row.label === '보유 만료')?.value).not.toBe(evidence.find((row) => row.label === '효과 만료')?.value);
    expect(evidence.find((row) => row.label === '지속형 속성')?.value).toContain('영구 소유 보증 아님');
    expect(evidence.find((row) => row.label === '미납 상태')?.value).not.toContain('완납');
  });
  it('never calls missing, null or malformed values paid, zero or permanent', () => {
    const evidence = describeInventoryCondition({ expires_at: null, effect_expires_at: null, weekly_cost: undefined, arrears_due: 'invalid', unpaid_weeks: undefined, suspended: undefined });
    expect(evidence.find((row) => row.label === '보유 만료')?.value).toContain('확인 불가');
    expect(evidence.find((row) => row.label === '효과 만료')?.value).toContain('확인 불가');
    expect(evidence.find((row) => row.label === '체납액')?.value).toContain('확인 불가');
    expect(evidence.map((row) => row.value).join(' ')).not.toContain('완납');
  });
  it('rejects unverified Android response condition values', () => {
    expect(isVerifiedInventoryCondition({ weekly_cost: '9007199254740993', unpaid_weeks: 0, suspended: false })).toBe(true);
    expect(isVerifiedInventoryCondition({ weekly_cost: Number('9007199254740993') })).toBe(false);
    expect(isVerifiedInventoryCondition({ arrears_due: '01' })).toBe(false);
    expect(isVerifiedInventoryCondition({ arrears_due: '9'.repeat(100000) })).toBe(false);
    expect(isVerifiedInventoryCondition({ arrears_cap: '9223372036854775808' })).toBe(false);
    expect(isVerifiedInventoryCondition({ effect_expires_at: 'not-date' })).toBe(false);
  });
});
