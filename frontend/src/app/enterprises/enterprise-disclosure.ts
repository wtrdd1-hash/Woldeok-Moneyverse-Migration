import { canonicalIntegerString } from '@/lib/money';

export interface EnterpriseDisclosure {
  readonly source: 'DATABASE_SNAPSHOT';
  readonly settlementStatus: 'NOT_VERIFIED';
  readonly disclosed_at: string;
  readonly overview: {
    readonly holding_name: string;
    readonly holding_code: string;
    readonly total_soe_assets_wld: string;
    readonly hourly_soe_revenue_wld: string;
    readonly hourly_soe_profit_wld: string;
    readonly hourly_soe_dividends_wld: string;
    readonly governance_model: string;
  };
  readonly soes: ReadonlyArray<{
    readonly code: string;
    readonly name: string;
    readonly category: string;
    readonly ceo_name: string;
    readonly total_assets_wld: string;
    readonly net_profit_hourly_wld: string;
    readonly dividend_rate_bps: number;
    readonly eval_grade: string;
    readonly description: string;
  }>;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function label(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 240;
}

function amount(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && canonicalIntegerString(value) !== null && !value.startsWith('-');
}

/** The public page must never present unverified or imprecise monetary data. */
export function verifiedEnterpriseDisclosure(value: unknown): EnterpriseDisclosure | null {
  if (!record(value) || value.source !== 'DATABASE_SNAPSHOT' || value.settlementStatus !== 'NOT_VERIFIED') return null;
  if (!label(value.disclosed_at) || !Number.isFinite(Date.parse(value.disclosed_at))) return null;
  if (!record(value.overview) || !Array.isArray(value.soes) || value.soes.length > 20) return null;
  const o = value.overview;
  if (!label(o.holding_name) || !label(o.holding_code) || !label(o.governance_model)) return null;
  if (![o.total_soe_assets_wld, o.hourly_soe_revenue_wld, o.hourly_soe_profit_wld, o.hourly_soe_dividends_wld].every(amount)) return null;
  for (const item of value.soes) {
    if (!record(item)) return null;
    if (![item.code, item.name, item.category, item.ceo_name, item.eval_grade, item.description].every(label)) return null;
    if (!amount(item.total_assets_wld) || !amount(item.net_profit_hourly_wld)) return null;
    if (!Number.isInteger(item.dividend_rate_bps) || (item.dividend_rate_bps as number) < 0 || (item.dividend_rate_bps as number) > 10000) return null;
  }
  return value as unknown as EnterpriseDisclosure;
}
