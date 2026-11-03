export interface MintStatusEvidence {
  readonly is_issuance_frozen: boolean;
  readonly verified_invariant: boolean;
  readonly active_policy_orders_count: number;
  readonly total_mint_certificates_count: number;
  readonly total_retirement_certificates_count: number;
}

const isSafeCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

/** A valid empty database is different from an unavailable or forged source. */
export function parseMintStatusEvidence(raw: unknown): MintStatusEvidence | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  if (typeof data.is_issuance_frozen !== 'boolean' ||
      typeof data.verified_invariant !== 'boolean' ||
      !isSafeCount(data.active_policy_orders_count) ||
      !isSafeCount(data.total_mint_certificates_count) ||
      !isSafeCount(data.total_retirement_certificates_count)) return null;
  return {
    is_issuance_frozen: data.is_issuance_frozen,
    verified_invariant: data.verified_invariant,
    active_policy_orders_count: data.active_policy_orders_count,
    total_mint_certificates_count: data.total_mint_certificates_count,
    total_retirement_certificates_count: data.total_retirement_certificates_count,
  };
}
