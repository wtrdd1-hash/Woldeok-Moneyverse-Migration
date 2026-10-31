import { describe, expect, it } from 'vitest';
import { isVerifiedHoldingCondition } from './shop-holdings-condition';

describe('owner inventory condition evidence', () => {
  const source = { weekly_cost: '9007199254740993', arrears_due: '0', arrears_cap: '9007199254740995', unpaid_weeks: 0, suspended: false, durable: true, expires_at: null, effect_expires_at: new Date('2026-11-02T00:00:00Z') };
  it('accepts exact bigint text and independently nullable holding/effect expiries', () => {
    expect(isVerifiedHoldingCondition(source)).toBe(true);
    expect(isVerifiedHoldingCondition({ ...source, effect_expires_at: null })).toBe(true);
  });
  it('rejects noncanonical or rounded WLD, invalid dates, weeks and boolean claims', () => {
    for (const item of [
      { weekly_cost: Number('9007199254740993') }, { arrears_due: '01' }, { arrears_cap: '-1' }, { arrears_cap: '9'.repeat(100000) }, { arrears_due: '9223372036854775808' },
      { unpaid_weeks: -1 }, { unpaid_weeks: 1.5 }, { suspended: 'false' },
      { durable: 'true' }, { effect_expires_at: new Date('invalid') },
      { expires_at: 'not a date' },
    ]) expect(isVerifiedHoldingCondition({ ...source, ...item })).toBe(false);
  });
  it('treats absent optional condition fields as unknown rather than paid', () => {
    expect(isVerifiedHoldingCondition({ code: 'legacy' })).toBe(true);
  });
});
