import { describe, expect, it } from 'vitest';
import { parseMintStatusEvidence } from './mint-status-evidence';

describe('v1652 Mint read-only real DB status', () => {
  const valid = {
    is_issuance_frozen: false,
    verified_invariant: false,
    active_policy_orders_count: 0,
    total_mint_certificates_count: 0,
    total_retirement_certificates_count: 0,
  };
  it('accepts an empty but correctly queried policy/certificate database without claiming minted money', () => {
    expect(parseMintStatusEvidence(valid)).toEqual(valid);
  });
  it.each([
    null, {}, { ...valid, is_issuance_frozen: 'false' },
    { ...valid, total_mint_certificates_count: -1 },
    { ...valid, total_retirement_certificates_count: 0.2 },
    { ...valid, active_policy_orders_count: 9007199254740992 },
    { ...valid, verified_invariant: 'verified' },
  ])('rejects missing, forged or malformed DB status: %j', (value) => {
    expect(parseMintStatusEvidence(value)).toBeNull();
  });
});
