import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';

export interface StateEnterpriseRow {
  id: string;
  code: string;
  name: string;
  category: string;
  ceo_name: string;
  total_assets_wld: string;
  operating_revenue_hourly_wld: string;
  operating_cost_hourly_wld: string;
  net_profit_hourly_wld: string;
  dividend_rate_bps: number;
  eval_grade: string;
  eval_score: number;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface StateEnterpriseDividendLogRow {
  id: string;
  enterprise_id: string;
  enterprise_code: string;
  enterprise_name: string;
  dividend_amount_wld: string;
  revenue_wld: string;
  net_profit_wld: string;
  eval_grade: string;
  created_at: string;
}

export interface PrivateEnterpriseRow {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  stage: string;
  valuation_wld: string;
  revenue_hourly_wld: string;
  corporate_tax_rate_bps: number;
  tax_paid_total_wld: string;
  dividends_paid_total_wld: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StateHoldingOverview {
  holding_name: string;
  holding_code: string;
  total_soe_assets_wld: string;
  hourly_soe_revenue_wld: string;
  hourly_soe_profit_wld: string;
  hourly_soe_dividends_wld: string;
  total_private_enterprises: number;
  total_private_valuation_wld: string;
  hourly_corporate_tax_wld: string;
  governance_model: string;
}

@Injectable()
export class EnterpriseRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable) {}

  async getStateHoldingOverview(): Promise<StateHoldingOverview> {
    const soeRes = await this.pool.query<{
      total_assets: string;
      total_revenue: string;
      total_profit: string;
      total_dividends: string;
    }>(`
      SELECT
        coalesce(sum(total_assets_wld), 0)::numeric::text AS total_assets,
        coalesce(sum(operating_revenue_hourly_wld), 0)::numeric::text AS total_revenue,
        coalesce(sum(net_profit_hourly_wld), 0)::numeric::text AS total_profit,
        coalesce(sum(net_profit_hourly_wld * dividend_rate_bps / 10000), 0)::numeric::text AS total_dividends
      FROM public.state_enterprises
      WHERE status = 'ACTIVE'
    `);

    const pvtRes = await this.pool.query<{
      count: string;
      total_valuation: string;
      total_tax: string;
    }>(`
      SELECT
        count(*)::text AS count,
        coalesce(sum(valuation_wld), 0)::numeric::text AS total_valuation,
        coalesce(sum(revenue_hourly_wld * corporate_tax_rate_bps / 10000), 0)::numeric::text AS total_tax
      FROM public.private_enterprises
      WHERE active = true
    `);

    const soeRow = soeRes.rows[0];
    const pvtRow = pvtRes.rows[0];

    return {
      holding_name: '월덱 국가투자공사 (Woldeok State Holding Corp - WSHC)',
      holding_code: 'WSHC_SOE_HOLDING',
      total_soe_assets_wld: soeRow?.total_assets ?? '0',
      hourly_soe_revenue_wld: soeRow?.total_revenue ?? '0',
      hourly_soe_profit_wld: soeRow?.total_profit ?? '0',
      hourly_soe_dividends_wld: soeRow?.total_dividends ?? '0',
      total_private_enterprises: parseInt(pvtRow?.count ?? '0', 10),
      total_private_valuation_wld: pvtRow?.total_valuation ?? '0',
      hourly_corporate_tax_wld: pvtRow?.total_tax ?? '0',
      governance_model: '싱가포르 테마섹 + 노르웨이 GPFG 하이브리드 지주회사 모델',
    };
  }

  async listStateEnterprises(): Promise<StateEnterpriseRow[]> {
    const res = await this.pool.query<StateEnterpriseRow>(`
      SELECT
        id, code, name, category, ceo_name,
        total_assets_wld::text,
        operating_revenue_hourly_wld::text,
        operating_cost_hourly_wld::text,
        net_profit_hourly_wld::text,
        dividend_rate_bps,
        eval_grade, eval_score, status, description,
        created_at::text, updated_at::text
      FROM public.state_enterprises
      ORDER BY total_assets_wld DESC
    `);
    return res.rows;
  }

  async listPrivateEnterprises(): Promise<PrivateEnterpriseRow[]> {
    const res = await this.pool.query<PrivateEnterpriseRow>(`
      SELECT
        id, symbol, name, sector, stage,
        valuation_wld::text,
        revenue_hourly_wld::text,
        corporate_tax_rate_bps,
        tax_paid_total_wld::text,
        dividends_paid_total_wld::text,
        active,
        created_at::text, updated_at::text
      FROM public.private_enterprises
      ORDER BY valuation_wld DESC
    `);
    return res.rows;
  }

  async listRecentDividendLogs(limit = 20): Promise<StateEnterpriseDividendLogRow[]> {
    const res = await this.pool.query<StateEnterpriseDividendLogRow>(`
      SELECT
        l.id, l.enterprise_id,
        e.code AS enterprise_code,
        e.name AS enterprise_name,
        l.dividend_amount_wld::text,
        l.revenue_wld::text,
        l.net_profit_wld::text,
        l.eval_grade,
        l.created_at::text
      FROM public.state_enterprise_dividend_logs l
      JOIN public.state_enterprises e ON e.id = l.enterprise_id
      ORDER BY l.created_at DESC
      LIMIT $1
    `, [limit]);
    return res.rows;
  }

  async distributeSoeDividends(adminId?: string, idempotencyKey?: string): Promise<{
    total_dividends_collected: string;
    enterprises_processed: number;
    treasury_balance_after: string;
  }> {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!adminId || !uuid.test(adminId)) {
      throw new BadRequestException('valid administrator identity required');
    }
    if (idempotencyKey !== undefined && !uuid.test(idempotencyKey)) {
      throw new BadRequestException('valid idempotency key required');
    }

    // Legacy clients do not supply a key. Derive an hourly business key to
    // prevent duplicate remittances without widening any database grants.
    // New clients should persist and resend an explicit key across retries.
    const hour = new Date().toISOString().slice(0, 13);
    const digest = createHash('sha256').update(`soe-harvest:${adminId}:${hour}`).digest('hex');
    const fallbackKey = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}-${digest.slice(16, 20)}-${digest.slice(20, 32)}`;
    const result = await this.pool.query<{ receipt: unknown }>(
      'SELECT public.admin_harvest_soe_dividends($1::uuid, $2::uuid) AS receipt',
      [adminId, idempotencyKey ?? fallbackKey],
    );

    const receipt = result.rows[0]?.receipt;
    if (!receipt || typeof receipt !== 'object') {
      throw new Error('SOE dividend receipt missing');
    }
    const row = receipt as Record<string, unknown>;
    const canonicalWld = (value: unknown): value is string =>
      typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value);
    if (
      !canonicalWld(row.total_dividends_collected) ||
      !canonicalWld(row.treasury_balance_after) ||
      !Number.isSafeInteger(row.enterprises_processed) ||
      (row.enterprises_processed as number) < 0
    ) {
      throw new Error('SOE dividend receipt invalid');
    }
    return {
      total_dividends_collected: row.total_dividends_collected,
      enterprises_processed: row.enterprises_processed as number,
      treasury_balance_after: row.treasury_balance_after,
    };
  }

  async updateSoeStatus(code: string, status: string, dividendRateBps?: number): Promise<boolean> {
    const params: unknown[] = [status, code];
    let query = `UPDATE public.state_enterprises SET status = $1, updated_at = NOW()`;
    if (dividendRateBps !== undefined) {
      params.splice(1, 0, dividendRateBps);
      query = `UPDATE public.state_enterprises SET status = $1, dividend_rate_bps = $2, updated_at = NOW() WHERE code = $3`;
    } else {
      query += ` WHERE code = $2`;
    }

    const res = await this.pool.query(query, params);
    return ((res as { rowCount?: number }).rowCount ?? res.rows.length) > 0;
  }
}
