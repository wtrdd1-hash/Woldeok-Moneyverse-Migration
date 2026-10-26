import { describe, expect, it } from 'vitest';
import { evaluateScenarioRisks, validateScenarioProjection } from './scenario-evidence';

const baseline = {
  baseline_m2_amount: '900719925474099312345',
  baseline_issued_24h: '1000',
  baseline_burned_24h: '500',
  days: 30,
  issuance_change_bps: 0,
  sink_change_bps: 0,
  projected_issued_per_day: '1000',
  projected_burned_per_day: '500',
  projected_net_per_day: '500',
  projected_m2_amount: '900719925474099327345',
  projected_m2_delta_amount: '15000',
  projected_m2_change_bps: '0',
  supply_floor_reached: false,
  advisory: ['Read-only deterministic projection'],
};

describe('verified economy scenario evidence', () => {
  it('accepts complete integer-string server projections without losing bigint precision', () => {
    expect(validateScenarioProjection(baseline)?.baseline_m2_amount).toBe('900719925474099312345');
  });

  it('rejects missing and malformed monetary fields instead of showing fabricated results', () => {
    expect(validateScenarioProjection({ ...baseline, projected_m2_amount: undefined })).toBeNull();
    expect(validateScenarioProjection({ ...baseline, baseline_issued_24h: '-1' })).toBeNull();
    expect(validateScenarioProjection({ ...baseline, projected_net_per_day: '1e9' })).toBeNull();
  });

  it('rejects invalid horizon, multipliers, and missing evidence advisory', () => {
    expect(validateScenarioProjection({ ...baseline, days: 0 })).toBeNull();
    expect(validateScenarioProjection({ ...baseline, sink_change_bps: 50001 })).toBeNull();
    expect(validateScenarioProjection({ ...baseline, advisory: 'all clear' })).toBeNull();
  });

  it('labels normal conditions for manual review, never as AI approval', () => {
    const projection = validateScenarioProjection(baseline)!;
    const result = evaluateScenarioRisks(projection);
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.source).toBe('DETERMINISTIC_RULES');
    expect(result.checks).toHaveLength(3);
    expect(result.checks.every((check) => check.severity === 'INFO')).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/llama|gemma|approved|consensus/i);
  });

  it('flags supply-floor breach as high risk without issuing a policy decision', () => {
    const projection = validateScenarioProjection({ ...baseline, supply_floor_reached: true })!;
    const result = evaluateScenarioRisks(projection);
    expect(result.status).toBe('HIGH_RISK');
    expect(result.checks[0]?.severity).toBe('WARN');
  });

  it('flags extreme issuance or burn assumptions without claiming model inference', () => {
    const issuance = validateScenarioProjection({ ...baseline, issuance_change_bps: 2001 })!;
    const burn = validateScenarioProjection({ ...baseline, sink_change_bps: 3001 })!;
    expect(evaluateScenarioRisks(issuance).status).toBe('HIGH_RISK');
    expect(evaluateScenarioRisks(burn).status).toBe('HIGH_RISK');
  });
});
