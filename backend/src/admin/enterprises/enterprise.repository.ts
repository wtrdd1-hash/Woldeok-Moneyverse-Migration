import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
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

export interface SoeGovernanceReceipt {
  receipt_id: string;
  code: string;
  old_status: string;
  new_status: string;
  dividend_rate_bps: number;
  applied: true;
  settled: false;
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

  async listRecentDividendLogs(limit = 20, actorId?: string): Promise<StateEnterpriseDividendLogRow[]> {
    // Defense in depth for callers that bypass the HTTP controller.
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('limit must be an integer from 1 to 100');
    }
    if (typeof actorId !== 'string' || !/^[0-9a-f-]{36}$/i.test(actorId)) {
      throw new BadRequestException('valid administrator identity required');
    }
    const res = await this.pool.query<StateEnterpriseDividendLogRow>(
      'SELECT * FROM public.admin_soe_dividend_history_read($1::uuid, $2::integer)',
      [actorId, limit],
    );
    return res.rows;
  }

  /**
   * P0 #1080: legacy SOE remittance is not atomic or idempotent. No caller,
   * including scheduled jobs or direct repository users, may execute it.
   * Re-enable only through an independently verified DB-owned ledger settlement.
   */
  async distributeSoeDividends(adminId?: string): Promise<{
    total_dividends_collected: string;
    enterprises_processed: number;
    treasury_balance_after: string;
    ledger_transaction_id?: string;
  }> {
    if (!adminId) {
      throw new ServiceUnavailableException({
        code: 'SOE_DIVIDEND_ACTOR_REQUIRED',
        message: '공기업 배당 수취를 집행할 관리자 식별자가 필요합니다.',
      });
    }
    const result = await this.pool.query<{ harvest: {
      success: boolean;
      code: string;
      message: string;
      total_dividends_collected: string;
      enterprises_processed: number;
      treasury_balance_after: string;
      ledger_transaction_id?: string;
    } }>(
      'SELECT public.admin_soe_harvest_dividends_to_vault($1::uuid) AS harvest',
      [adminId],
    );
    const row = result.rows[0]?.harvest;
    if (!row || !row.success) {
      throw new ServiceUnavailableException({
        code: row?.code ?? 'SOE_DIVIDEND_HARVEST_FAILED',
        message: row?.message ?? '공기업 배당금 국고 귀속 처리에 실패했습니다.',
      });
    }
    const out: {
      total_dividends_collected: string;
      enterprises_processed: number;
      treasury_balance_after: string;
      ledger_transaction_id?: string;
    } = {
      total_dividends_collected: row.total_dividends_collected,
      enterprises_processed: row.enterprises_processed,
      treasury_balance_after: row.treasury_balance_after,
    };
    if (row.ledger_transaction_id) {
      out.ledger_transaction_id = row.ledger_transaction_id;
    }
    return out;
  }

  async updateSoeStatus(
    code: string,
    status: string,
    dividendRateBps: number | undefined,
    actorId: string,
    reason: string,
    idempotencyKey: string,
  ): Promise<SoeGovernanceReceipt> {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(actorId) || !uuid.test(idempotencyKey)
      || !/^SOE_[A-Z0-9_]{2,40}$/.test(code)
      || !['ACTIVE', 'PAUSED', 'PRIVATIZING'].includes(status)
      || (dividendRateBps !== undefined && (!Number.isInteger(dividendRateBps)
        || dividendRateBps < 0 || dividendRateBps > 10000))
      || typeof reason !== 'string' || reason.trim().length < 12 || reason.length > 500) {
      throw new BadRequestException('Invalid SOE governance request');
    }
    // The application never holds direct UPDATE permission on this table.
    // The approver role check, mutation and immutable receipt are in one DB call.
    const result = await this.pool.query<{ receipt: SoeGovernanceReceipt }>(
      `SELECT public.admin_soe_update_status($1::uuid, $2::text, $3::text, $4::integer, $5::text, $6::uuid) AS receipt`,
      [actorId, code, status, dividendRateBps ?? null, reason.trim(), idempotencyKey],
    );
    const receipt = result.rows[0]?.receipt;
    if (!receipt || receipt.applied !== true || receipt.settled !== false
      || receipt.code !== code || receipt.new_status !== status
      || receipt.receipt_id !== idempotencyKey) {
      throw new ServiceUnavailableException({
        code: 'SOE_STATUS_RECEIPT_UNVERIFIED',
        message: 'Database-owned SOE governance receipt missing or inconsistent',
      });
    }
    return receipt;
  }
}
