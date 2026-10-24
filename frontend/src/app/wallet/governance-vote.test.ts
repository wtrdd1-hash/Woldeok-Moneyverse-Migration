import { describe, expect, it } from 'vitest';
import { GOVERNANCE_CHOICES, currentKstQuarter } from './governance-vote';

describe('citizen budget vote options', () => {
  it('offers exactly the choices accepted by the persisted PostgreSQL function', () => {
    expect(GOVERNANCE_CHOICES.map((option) => option.value)).toEqual([
      'WELFARE', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND', 'CURRENCY_STABILIZATION',
    ]);
  });
  it('does not present unimplemented buyback or emergency priorities', () => {
    expect(GOVERNANCE_CHOICES.map((option) => option.value)).not.toContain('BUYBACK_BURN');
    expect(GOVERNANCE_CHOICES.map((option) => option.value)).not.toContain('EMERGENCY');
  });
  it('uses Korean civil quarter at UTC rollover', () => {
    expect(currentKstQuarter(new Date('2026-12-31T15:00:00Z'))).toBe('2027-Q1');
  });
});
