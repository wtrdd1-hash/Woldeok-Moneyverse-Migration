/**
 * Deterministic quality gate for numeric financial claims in AI-assisted drafts.
 * This module DOES NOT fetch citations or certify external providers.
 * Only server-verified, persisted source receipts may be passed by the caller.
 * Result is advisory for a draft; it cannot approve or publish an article.
 */

export type EditorialJurisdiction = 'KR' | 'US' | 'JP' | 'CN';
export type FinancialClaimKind = 'LIVE_QUOTE' | 'REGULATION' | 'STATISTIC' | 'SIMULATION' | 'FORMULA';

export interface EditorialSourceReceipt {
  readonly id: string;
  readonly jurisdiction: EditorialJurisdiction;
  readonly verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'REVOKED';
  readonly observedAt: string;
  readonly retrievedAt: string;
  readonly validUntil: string;
  readonly contentSha256: string;
  readonly canonicalUrl: string;
}

export interface FinancialClaim {
  readonly id: string;
  readonly kind: FinancialClaimKind;
  readonly jurisdiction: EditorialJurisdiction;
  readonly number: string;
  readonly unit: string;
  readonly citedSourceIds: readonly string[];
  readonly observedAt?: string | undefined;
  readonly effectiveYear?: number | undefined;
  readonly simulationFixtureId?: string | undefined;
  readonly guaranteesProfit?: boolean | undefined;
}

export type ClaimIssueCode =
  | 'SOURCE_MISSING'
  | 'SOURCE_UNVERIFIED'
  | 'SOURCE_EXPIRED'
  | 'SOURCE_PROVENANCE_INVALID'
  | 'COUNTRY_MISMATCH'
  | 'OBSERVATION_MISSING'
  | 'OBSERVATION_FUTURE'
  | 'OBSERVATION_STALE'
  | 'SOURCE_ASOF_MISMATCH'
  | 'INVALID_FINANCIAL_NUMBER'
  | 'EFFECTIVE_YEAR_MISSING'
  | 'SIMULATION_FIXTURE_MISSING'
  | 'GUARANTEED_RETURN';

export interface ClaimIssue {
  readonly claimId: string;
  readonly code: ClaimIssueCode;
}

export interface ClaimAssessment {
  readonly passed: boolean;
  readonly issues: readonly ClaimIssue[];
}

const dayMs = 24 * 60 * 60 * 1000;
const maxClockSkewMs = 5 * 60 * 1000;
function instant(value: string | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isSourceProvenanceValid(receipt: EditorialSourceReceipt, nowMs: number): boolean {
  let url: URL;
  try {
    url = new URL(receipt.canonicalUrl);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return false;
  if (!/^[a-f0-9]{64}$/.test(receipt.contentSha256)) return false;
  const retrievedAt = instant(receipt.retrievedAt);
  const asOfAt = instant(receipt.observedAt);
  return retrievedAt !== null && asOfAt !== null
    && retrievedAt <= nowMs + maxClockSkewMs
    && asOfAt <= retrievedAt + maxClockSkewMs;
}

/** Only bounded, date-stamped claims can pass; never a publisher authority. */
export function assessFinancialClaims(
  claims: readonly FinancialClaim[],
  receipts: readonly EditorialSourceReceipt[],
  now: Date = new Date(),
): ClaimAssessment {
  const issues: ClaimIssue[] = [];
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) throw new RangeError('Invalid clock');
  const sources = new Map(receipts.map((r) => [r.id, r]));

  for (const claim of claims) {
    const report = (code: ClaimIssueCode) => issues.push({ claimId: claim.id, code });
    if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(claim.number) || claim.number.length > 100
      || !claim.unit.trim()) report('INVALID_FINANCIAL_NUMBER');
    if (claim.guaranteesProfit) report('GUARANTEED_RETURN');

    if (!claim.citedSourceIds.length) report('SOURCE_MISSING');
    for (const id of claim.citedSourceIds) {
      const source = sources.get(id);
      if (!source) { report('SOURCE_MISSING'); continue; }
      if (source.verificationStatus !== 'VERIFIED') report('SOURCE_UNVERIFIED');
      if (source.jurisdiction !== claim.jurisdiction) report('COUNTRY_MISMATCH');
      if (!isSourceProvenanceValid(source, nowMs)) report('SOURCE_PROVENANCE_INVALID');
      const expiresAt = instant(source.validUntil);
      if (expiresAt === null || expiresAt <= nowMs) report('SOURCE_EXPIRED');

      if (claim.kind === 'LIVE_QUOTE') {
        const observedAt = instant(claim.observedAt);
        const sourceAt = instant(source.observedAt);
        if (observedAt === null) {
          report('OBSERVATION_MISSING');
        } else {
          if (observedAt > nowMs + maxClockSkewMs) report('OBSERVATION_FUTURE');
          if (nowMs - observedAt > dayMs) report('OBSERVATION_STALE');
          if (sourceAt === null || Math.abs(observedAt - sourceAt) > maxClockSkewMs) {
            report('SOURCE_ASOF_MISMATCH');
          }
        }
      }
    }
    if (claim.kind === 'REGULATION'
      && (!Number.isInteger(claim.effectiveYear) || (claim.effectiveYear ?? 0) < 1900
        || (claim.effectiveYear ?? 0) > now.getUTCFullYear())) {
      report('EFFECTIVE_YEAR_MISSING');
    }
    if (claim.kind === 'SIMULATION'
      && !/^[A-Za-z0-9][A-Za-z0-9_.-]{7,127}$/.test(claim.simulationFixtureId ?? '')) {
      report('SIMULATION_FIXTURE_MISSING');
    }
  }

  return { passed: issues.length === 0, issues };
}
