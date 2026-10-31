/** Runtime boundary for public in-game SOE projections. A successful HTTP status alone is not proof. */
export interface EnterpriseDisclosure {
  readonly source: 'DATABASE_SNAPSHOT';
  readonly settlementStatus: 'NOT_VERIFIED';
  readonly disclosed_at: string;
  readonly overview: {
    readonly holding_name: string;
    readonly holding_code: string;
    readonly governance_model: string;
    readonly total_soe_assets_wld: string;
    readonly hourly_soe_revenue_wld: string;
    readonly hourly_soe_profit_wld: string;
    readonly hourly_soe_dividends_wld: string;
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
  return typeof value === 'string' && value.length > 0 && value.length <= 240 &&
    value.trim() === value && !/[\u0000-\u001f\u007f]/.test(value);
}

/** DB numeric(38,0) amounts must remain exact decimal strings. Negative profits are possible. */
function integer(value: unknown, signed = false): value is string {
  return typeof value === 'string' && value.length <= 39 &&
    (signed ? /^(?:0|[1-9][0-9]{0,37}|-[1-9][0-9]{0,37})$/ : /^(?:0|[1-9][0-9]{0,37})$/).test(value);
}

export function verifiedEnterpriseDisclosure(value: unknown): EnterpriseDisclosure | null {
  if (!record(value) || value.source !== 'DATABASE_SNAPSHOT' || value.settlementStatus !== 'NOT_VERIFIED') return null;
  if (typeof value.disclosed_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value.disclosed_at) ||
      !Number.isFinite(Date.parse(value.disclosed_at)) || !new Date(value.disclosed_at).toISOString().startsWith(value.disclosed_at.slice(0, 19))) return null;
  if (!record(value.overview) || !Array.isArray(value.soes) || value.soes.length > 100) return null;
  const o = value.overview;
  if (![o.holding_name, o.holding_code, o.governance_model].every(label)) return null;
  if (!integer(o.total_soe_assets_wld) || !integer(o.hourly_soe_revenue_wld) ||
      !integer(o.hourly_soe_profit_wld, true) || !integer(o.hourly_soe_dividends_wld, true)) return null;
  const codes = new Set<string>();
  for (const item of value.soes) {
    if (!record(item) || ![item.code, item.name, item.category, item.ceo_name, item.eval_grade, item.description].every(label)) return null;
    if (!integer(item.total_assets_wld) || !integer(item.net_profit_hourly_wld, true)) return null;
    if (!Number.isInteger(item.dividend_rate_bps) || (item.dividend_rate_bps as number) < 0 || (item.dividend_rate_bps as number) > 10000) return null;
    const code = (item.code as string).toUpperCase();
    if (codes.has(code)) return null;
    codes.add(code);
  }
  return value as unknown as EnterpriseDisclosure;
}
