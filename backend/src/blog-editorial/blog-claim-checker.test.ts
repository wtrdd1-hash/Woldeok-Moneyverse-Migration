import { describe, expect, it } from 'vitest';
import {
  assessFinancialClaims,
  type EditorialSourceReceipt,
  type FinancialClaim,
} from './blog-claim-checker';

const now = new Date('2026-10-20T01:00:00.000Z');
const source: EditorialSourceReceipt = {
  id: 'source-1',
  jurisdiction: 'KR',
  verificationStatus: 'VERIFIED',
  observedAt: '2026-10-20T00:10:00.000Z',
  retrievedAt: '2026-10-20T00:11:00.000Z',
  validUntil: '2026-10-21T00:11:00.000Z',
  contentSha256: 'a'.repeat(64),
  canonicalUrl: 'https://www.bok.or.kr',
};
const claim: FinancialClaim = {
  id: 'fx',
  kind: 'LIVE_QUOTE',
  jurisdiction: 'KR',
  number: '1385.5',
  unit: 'KRW/USD',
  observedAt: '2026-10-20T00:10:00.000Z',
  citedSourceIds: ['source-1'],
};

describe('AI blog financial claim gates v976', () => {
  it('accepts dated numbers with an independently VERIFIED, current citation', () => {
    expect(assessFinancialClaims([claim], [source], now)).toEqual({
      passed: true,
      issues: [],
    });
  });

  it('rejects outdated exchange rates even when marked as latest by the model', () => {
    const oldDate = '2026-10-16T00:10:00.000Z';
    const result = assessFinancialClaims(
      [{ ...claim, observedAt: oldDate }],
      [{ ...source, observedAt: oldDate, retrievedAt: '2026-10-16T00:11:00.000Z', validUntil: '2026-10-21T00:11:00.000Z' }],
      now,
    );
    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('OBSERVATION_STALE');
  });

  it('refuses source that is expired, unverified or not in the same jurisdiction', () => {
    for (const changed of [
      { ...source, validUntil: '2026-10-19T00:00:00Z' },
      { ...source, verificationStatus: 'UNVERIFIED' as const },
      { ...source, jurisdiction: 'US' as const },
    ]) {
      expect(assessFinancialClaims([claim], [changed], now).passed).toBe(false);
    }
  });

  it('requires supporting evidence rather than using model memory or future times', () => {
    expect(assessFinancialClaims([claim], [], now).issues[0]?.code).toBe('SOURCE_MISSING');
    expect(assessFinancialClaims([{ ...claim, observedAt: '2026-11-20T00:00:00Z' }], [source], now).passed).toBe(false);
    expect(assessFinancialClaims([{ ...claim, number: 'NaN' }], [source], now).passed).toBe(false);
  });

  it('does not bless a simulated performance figure without a reproducible fixture', () => {
    const backtest: FinancialClaim = {
      ...claim,
      kind: 'SIMULATION',
      number: '18.2',
      unit: '%',
      observedAt: undefined,
      simulationFixtureId: undefined,
    };
    expect(assessFinancialClaims([backtest], [source], now).issues.map((x) => x.code))
      .toContain('SIMULATION_FIXTURE_MISSING');
  });

  it('rejects a receipt that expires before its purported retrieval timestamp', () => {
    const impossible = {
      ...source,
      retrievedAt: '2026-10-20T01:03:00.000Z',
      validUntil: '2026-10-20T01:02:00.000Z',
    };
    const regulation = { ...claim, kind: 'REGULATION' as const, effectiveYear: 2026 };
    expect(assessFinancialClaims([regulation], [impossible], now).issues.map((x) => x.code))
      .toContain('SOURCE_PROVENANCE_INVALID');
  });

  it('rejects ambiguous local-time source timestamps and nonpublic source hosts', () => {
    const regulation = { ...claim, kind: 'REGULATION' as const, effectiveYear: 2026 };
    for (const receipt of [
      { ...source, observedAt: '2026-10-20T00:10:00' },
      { ...source, canonicalUrl: 'https://127.0.0.1/official-facts' },
      { ...source, canonicalUrl: 'https://metadata.google.internal/verify' },
    ]) {
      expect(assessFinancialClaims([regulation], [receipt], now).issues.map((x) => x.code))
        .toContain('SOURCE_PROVENANCE_INVALID');
    }
  });

  it('never validates promised profit or undated tax rules even with a citation', () => {
    const tax: FinancialClaim = {
      ...claim, kind: 'REGULATION', observedAt: undefined, effectiveYear: undefined,
    };
    expect(assessFinancialClaims([tax], [source], now).issues.map((x) => x.code))
      .toContain('EFFECTIVE_YEAR_MISSING');
    expect(assessFinancialClaims([{ ...claim, guaranteesProfit: true }], [source], now).issues.map((x) => x.code))
      .toContain('GUARANTEED_RETURN');
  });
});
