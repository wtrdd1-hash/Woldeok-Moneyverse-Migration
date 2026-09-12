export interface EconomyScenarioInput {
  readonly m2Amount: string;
  readonly issued24h: string;
  readonly burned24h: string;
  readonly days: number;
  readonly issuanceChangeBps: number;
  readonly sinkChangeBps: number;
}

export interface EconomyScenarioProjection {
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

const INTEGER_TEXT = /^-?\d+$/;
const BPS_DENOMINATOR = 10_000n;

function integer(value: string, field: string): bigint {
  if (!INTEGER_TEXT.test(value)) throw new Error(`${field} must be an integer string`);
  return BigInt(value);
}

function scaleByBps(value: bigint, changeBps: number): bigint {
  return (value * BigInt(BPS_DENOMINATOR_NUMBER + changeBps)) / BPS_DENOMINATOR;
}

const BPS_DENOMINATOR_NUMBER = 10_000;

export function projectEconomyScenario(input: EconomyScenarioInput): EconomyScenarioProjection {
  if (!Number.isSafeInteger(input.days) || input.days < 1 || input.days > 365) {
    throw new Error('days must be a whole number between 1 and 365');
  }
  for (const [name, value] of [
    ['issuanceChangeBps', input.issuanceChangeBps],
    ['sinkChangeBps', input.sinkChangeBps],
  ] as const) {
    if (!Number.isSafeInteger(value) || value < -10_000 || value > 50_000) {
      throw new Error(`${name} must be a whole number between -10000 and 50000`);
    }
  }

  const m2 = integer(input.m2Amount, 'm2Amount');
  const issued = integer(input.issued24h, 'issued24h');
  const burned = integer(input.burned24h, 'burned24h');
  if (m2 < 0n || issued < 0n || burned < 0n) throw new Error('economy inputs cannot be negative');

  const projectedIssued = scaleByBps(issued, input.issuanceChangeBps);
  const projectedBurned = scaleByBps(burned, input.sinkChangeBps);
  const netPerDay = projectedIssued - projectedBurned;
  const unconstrained = m2 + netPerDay * BigInt(input.days);
  const supplyFloorReached = unconstrained < 0n;
  const projectedM2 = supplyFloorReached ? 0n : unconstrained;
  const delta = projectedM2 - m2;
  const changeBps = m2 === 0n ? null : ((delta * BPS_DENOMINATOR) / m2).toString();

  const advisory: string[] = [
    'This is a deterministic read-only projection, not an automatic policy recommendation.',
    'It assumes the latest 24-hour issuance and burn flows remain constant except for the selected multipliers.',
  ];
  if (supplyFloorReached) {
    advisory.push(
      'The mathematical projection crossed zero supply; the displayed M2 is floored at zero.',
    );
  }
  if (input.days > 90) {
    advisory.push(
      'Long-horizon results carry high model risk because behavior and policy responses are not modeled.',
    );
  }

  return {
    baseline_m2_amount: m2.toString(),
    baseline_issued_24h: issued.toString(),
    baseline_burned_24h: burned.toString(),
    days: input.days,
    issuance_change_bps: input.issuanceChangeBps,
    sink_change_bps: input.sinkChangeBps,
    projected_issued_per_day: projectedIssued.toString(),
    projected_burned_per_day: projectedBurned.toString(),
    projected_net_per_day: netPerDay.toString(),
    projected_m2_amount: projectedM2.toString(),
    projected_m2_delta_amount: delta.toString(),
    projected_m2_change_bps: changeBps,
    supply_floor_reached: supplyFloorReached,
    advisory,
  };
}
