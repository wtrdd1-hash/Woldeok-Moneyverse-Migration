import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { PG_POOL } from '../core/pool.provider';
import type { UpdateBaseRateDto, UpdateReserveRequirementDto } from './central-bank.dto';

interface Row {
  id: string;
  adjusted_policy_rate: string;
  inflation_target: string;
  taylor_base_rate: string;
  governor_note: string;
  last_decision_at: Date | string;
  rate_decided_by: string | null;
  reserve_requirement_ratio: string;
  reserve_decision_at: Date | string;
  reserve_rationale: string;
  reserve_decided_by: string | null;
}
const FIELDS = [
  'id, adjusted_policy_rate::text, inflation_target::text, taylor_base_rate::text,',
  'governor_note, last_decision_at, rate_decided_by::text,',
  'reserve_requirement_ratio::text, reserve_decision_at, reserve_rationale, reserve_decided_by::text',
].join(' ');
const SELECT = 'SELECT ' + FIELDS + ' FROM public.central_bank_monetary_policy ORDER BY last_decision_at DESC, id LIMIT 1';
const pct = (fraction: string): string => (Number(fraction) * 100).toFixed(2);
const iso = (value: Date | string): string => new Date(value).toISOString();
function rate(value: string, min: number, max: number): number {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)) {
    throw new BadRequestException('Invalid rate precision');
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new BadRequestException('Rate outside permitted range');
  }
  return parsed;
}
function reason(value: string) {
  if (typeof value !== 'string' || value.trim().length < 10 || value.trim().length > 2000) {
    throw new BadRequestException('A reason between 10 and 2000 characters is required');
  }
}
const base = (row: Row) => ({
  ratePercent: pct(row.adjusted_policy_rate),
  rationale: row.governor_note,
  targetInflationPercent: pct(row.inflation_target),
  taylorRuleEstimatedRate: pct(row.taylor_base_rate),
  decidedBy: row.rate_decided_by ?? 'INITIAL_POLICY',
  decidedAt: iso(row.last_decision_at),
  source: 'persistent_monetary_policy' as const,
});
const reserve = (row: Row) => ({
  ratioPercent: pct(row.reserve_requirement_ratio),
  rationale: row.reserve_rationale,
  decidedBy: row.reserve_decided_by ?? 'INITIAL_POLICY',
  enforcedAt: iso(row.reserve_decision_at),
  source: 'persistent_monetary_policy' as const,
});

@Injectable()
export class DurableCentralBankPolicyService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool | null) {}

  private requiredPool(): Pool {
    if (!this.pool) throw new ServiceUnavailableException('MONETARY_POLICY_DATABASE_UNAVAILABLE');
    return this.pool;
  }

  async getBaseRate() {
    const rows = (await this.requiredPool().query<Row>(SELECT)).rows;
    if (!rows[0]) throw new ServiceUnavailableException('MONETARY_POLICY_NOT_INITIALIZED');
    return base(rows[0]);
  }

  async getReserveRequirement() {
    const rows = (await this.requiredPool().query<Row>(SELECT)).rows;
    if (!rows[0]) throw new ServiceUnavailableException('MONETARY_POLICY_NOT_INITIALIZED');
    return reserve(rows[0]);
  }

  private async transaction<T>(callback: (client: PoolClient, previous: Row) => Promise<T>): Promise<T> {
    const client = await this.requiredPool().connect();
    try {
      await client.query('BEGIN');
      const rows = (await client.query<Row>(
        'SELECT ' + FIELDS + ' FROM public.central_bank_monetary_policy ORDER BY last_decision_at DESC, id LIMIT 1 FOR UPDATE',
      )).rows;
      if (!rows[0]) throw new ServiceUnavailableException('MONETARY_POLICY_NOT_INITIALIZED');
      const response = await callback(client, rows[0]);
      await client.query('COMMIT');
      return response;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateBaseRate(dto: UpdateBaseRateDto, actor: string) {
    const next = rate(dto.baseRatePercent, 0, 25);
    const inflation = rate(dto.targetInflationPercent ?? '2.00', 0, 25);
    reason(dto.rateDecisionRationale);
    const taylor = 2 + inflation + (inflation - 2) / 2;
    return this.transaction(async (client, previous) => {
      const rows = (await client.query<Row>(
        'UPDATE public.central_bank_monetary_policy SET adjusted_policy_rate=$1::numeric/100,' +
        'inflation_target=$2::numeric/100, taylor_base_rate=$3::numeric/100, governor_note=$4,' +
        'rate_decided_by=$5::uuid, last_decision_at=clock_timestamp() WHERE id=$6::uuid RETURNING ' + FIELDS,
        [next, inflation, taylor, dto.rateDecisionRationale.trim(), actor, previous.id],
      )).rows;
      await client.query(
        'INSERT INTO public.central_bank_policy_decisions (policy_id,decision_type,previous_value,new_value,rationale,actor_id)' +
        " VALUES ($1::uuid,'BASE_RATE',$2::numeric,$3::numeric/100,$4,$5::uuid)",
        [previous.id, previous.adjusted_policy_rate, next, dto.rateDecisionRationale.trim(), actor],
      );
      return base(rows[0]!);
    });
  }

  async updateReserveRequirement(dto: UpdateReserveRequirementDto, actor: string) {
    const next = rate(dto.reserveRatioPercent, 1, 50);
    reason(dto.regulationRationale);
    return this.transaction(async (client, previous) => {
      const rows = (await client.query<Row>(
        'UPDATE public.central_bank_monetary_policy SET reserve_requirement_ratio=$1::numeric/100,' +
        'reserve_rationale=$2, reserve_decided_by=$3::uuid, reserve_decision_at=clock_timestamp()' +
        ' WHERE id=$4::uuid RETURNING ' + FIELDS,
        [next, dto.regulationRationale.trim(), actor, previous.id],
      )).rows;
      await client.query(
        'INSERT INTO public.central_bank_policy_decisions (policy_id,decision_type,previous_value,new_value,rationale,actor_id)' +
        " VALUES ($1::uuid,'RESERVE_REQUIREMENT',$2::numeric,$3::numeric/100,$4,$5::uuid)",
        [previous.id, previous.reserve_requirement_ratio, next, dto.regulationRationale.trim(), actor],
      );
      return reserve(rows[0]!);
    });
  }
}
