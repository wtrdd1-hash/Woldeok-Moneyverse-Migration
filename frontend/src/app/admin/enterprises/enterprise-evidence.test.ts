import { describe, expect, it } from 'vitest';
import { parseEnterpriseEvidence } from './enterprise-evidence';
import { validOverview, validSoe, validPrivate, validLog } from './enterprise-evidence-fixtures';

describe('admin enterprise authenticated read evidence', () => {
  it('preserves exact WLD integer strings from all four API responses', () => {
    const result = parseEnterpriseEvidence(validOverview, [validSoe], [validPrivate], [validLog]);
    expect(result?.overview.total_soe_assets_wld).toBe('9007199254740993');
    expect(result?.soes[0]?.total_assets_wld).toBe('9007199254740993');
  });
  it.each([
    ['missing SOE API', validOverview, null, [validPrivate], [validLog]],
    ['missing private API', validOverview, [validSoe], null, [validLog]],
    ['missing dividend API', validOverview, [validSoe], [validPrivate], null],
    [
      'malformed overview',
      { ...validOverview, total_private_enterprises: -1 },
      [validSoe],
      [validPrivate],
      [validLog],
    ],
    [
      'unsafe money',
      validOverview,
      [{ ...validSoe, total_assets_wld: Number('9007199254740993') }],
      [validPrivate],
      [validLog],
    ],
    [
      'invalid rate',
      validOverview,
      [{ ...validSoe, dividend_rate_bps: 10001 }],
      [validPrivate],
      [validLog],
    ],
    ['invalid UUID', validOverview, [{ ...validSoe, id: 'bad' }], [validPrivate], [validLog]],
    [
      'invalid log timestamp',
      validOverview,
      [validSoe],
      [validPrivate],
      [{ ...validLog, created_at: 'tomorrow' }],
    ],
    ['duplicate SOE', validOverview, [validSoe, validSoe], [validPrivate], [validLog]],
    [
      'unknown grade',
      validOverview,
      [{ ...validSoe, eval_grade: 'Z' }],
      [validPrivate],
      [validLog],
    ],
    [
      'unknown stage',
      validOverview,
      [validSoe],
      [{ ...validPrivate, stage: 'UNKNOWN' }],
      [validLog],
    ],
    ['invalid list object', validOverview, { soes: [] }, [validPrivate], [validLog]],
  ])('rejects %s instead of reporting zero', (_name, overview, soes, privateRows, logs) => {
    expect(parseEnterpriseEvidence(overview, soes, privateRows, logs)).toBeNull();
  });
  it('accepts a genuinely empty authoritative result', () => {
    expect(
      parseEnterpriseEvidence({ ...validOverview, total_private_enterprises: 0 }, [], [], []),
    ).not.toBeNull();
  });
});
