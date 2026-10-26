export interface ScenarioProjection {
  readonly baseline_m2_amount: string;
  readonly baseline_issued_24h: string;
  readonly baseline_burned_24h: string;
  readonly days: number;
  readonly issuance_change_bps: number;
  readonly sink_change_bps: number;
  readonly projected_issued_per_day: string;
  readonly projected_burned_per_day: string;
  readonly projected_net_per_day: string;
  readonly projected_m2_amount: string;
  readonly projected_m2_delta_amount: string;
  readonly projected_m2_change_bps: string | null;
  readonly supply_floor_reached: boolean;
  readonly advisory: readonly string[];
}

type RiskSeverity = 'INFO' | 'WARN';

export interface ScenarioRiskSummary {
  readonly source: 'DETERMINISTIC_RULES';
  readonly status: 'REVIEW_REQUIRED' | 'HIGH_RISK';
  readonly checks: readonly {
    readonly key: 'supply' | 'issuance' | 'burn';
    readonly name: string;
    readonly severity: RiskSeverity;
    readonly explanation: string;
  }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIntegerText(value: unknown, allowNegative: boolean): value is string {
  return typeof value === 'string' &&
    value.length <= 128 &&
    (allowNegative ? /^-?\d+$/.test(value) : /^\d+$/.test(value));
}

function isBoundedInteger(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

/** Never render an unverified API payload as a successful financial projection. */
export function validateScenarioProjection(value: unknown): ScenarioProjection | null {
  if (!isRecord(value)) return null;

  for (const key of [
    'baseline_m2_amount',
    'baseline_issued_24h',
    'baseline_burned_24h',
    'projected_issued_per_day',
    'projected_burned_per_day',
    'projected_m2_amount',
  ]) {
    if (!isIntegerText(value[key], false)) return null;
  }
  for (const key of ['projected_net_per_day', 'projected_m2_delta_amount']) {
    if (!isIntegerText(value[key], true)) return null;
  }
  if (
    !isBoundedInteger(value.days, 1, 365) ||
    !isBoundedInteger(value.issuance_change_bps, -10_000, 50_000) ||
    !isBoundedInteger(value.sink_change_bps, -10_000, 50_000) ||
    (value.projected_m2_change_bps !== null && !isIntegerText(value.projected_m2_change_bps, true)) ||
    typeof value.supply_floor_reached !== 'boolean' ||
    !Array.isArray(value.advisory) ||
    value.advisory.length > 30 ||
    !value.advisory.every((entry: unknown) => typeof entry === 'string' && entry.length <= 1000)
  ) {
    return null;
  }

  return value as unknown as ScenarioProjection;
}

/** This is a deterministic warning checklist, not an AI inference or policy vote. */
export function evaluateScenarioRisks(projection: ScenarioProjection): ScenarioRiskSummary {
  const supplyRisk = projection.supply_floor_reached;
  const issuanceRisk = projection.issuance_change_bps > 2000;
  const burnRisk = projection.sink_change_bps > 3000;

  return {
    source: 'DETERMINISTIC_RULES',
    status: supplyRisk || issuanceRisk || burnRisk ? 'HIGH_RISK' : 'REVIEW_REQUIRED',
    checks: [
      {
        key: 'supply',
        name: '공급량 하한',
        severity: supplyRisk ? 'WARN' : 'INFO',
        explanation: supplyRisk
          ? '가정에 따른 통화량이 0 아래로 계산되어 표시값이 0으로 제한되었습니다.'
          : '선택한 가정에서 공급량 하한 도달 신호가 없습니다. 무결성 검증을 뜻하지 않습니다.',
      },
      {
        key: 'issuance',
        name: '발행 증가율 가정',
        severity: issuanceRisk ? 'WARN' : 'INFO',
        explanation: issuanceRisk
          ? '일일 발행 증가율 가정이 +20%를 초과합니다. 운영자가 별도로 검토해야 합니다.'
          : '일일 발행 증가율 가정이 +20% 이하입니다. 정책 승인을 뜻하지 않습니다.',
      },
      {
        key: 'burn',
        name: '소각 증가율 가정',
        severity: burnRisk ? 'WARN' : 'INFO',
        explanation: burnRisk
          ? '일일 소각 증가율 가정이 +30%를 초과합니다. 운영자가 별도로 검토해야 합니다.'
          : '일일 소각 증가율 가정이 +30% 이하입니다. 정책 승인을 뜻하지 않습니다.',
      },
    ],
  };
}
