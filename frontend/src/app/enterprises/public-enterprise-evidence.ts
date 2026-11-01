/** The public disclosure is an untrusted API boundary, not a licence to invent balances. */
export interface PublicEnterpriseDisclosure {
  readonly overview: {
    readonly holding_name: string;
    readonly holding_code: string;
    readonly total_soe_assets_wld: string;
    readonly hourly_soe_revenue_wld: string;
    readonly hourly_soe_profit_wld: string;
    readonly hourly_soe_dividends_wld: string;
    readonly governance_model: string;
  };
  readonly soes: readonly {
    readonly code: string;
    readonly name: string;
    readonly category: string;
    readonly ceo_name: string;
    readonly total_assets_wld: string;
    readonly operating_revenue_hourly_wld: string;
    readonly net_profit_hourly_wld: string;
    readonly dividend_rate_bps: number;
    readonly eval_grade: string;
    readonly status: 'ACTIVE' | 'PAUSED' | 'PRIVATIZING';
    readonly description: string;
  }[];
  readonly disclosed_at: string;
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const label = (value: unknown, max = 240): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const money = (value: unknown, allowNegative = false): value is string =>
  typeof value === 'string' && new RegExp(`^${allowNegative ? '-?' : ''}(?:0|[1-9][0-9]{0,37})(?:\\.[0-9]{1,18})?$`).test(value);

export function formatEnterpriseWld(value: string): string {
  const negative = value.startsWith('-');
  const [integer, fraction] = (negative ? value.slice(1) : value).split('.');
  const grouped = (integer ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '−' : ''}${grouped}${fraction === undefined ? '' : `.${fraction}`}`;
}

export function parsePublicEnterpriseDisclosure(value: unknown): PublicEnterpriseDisclosure | null {
  if (!record(value) || !record(value.overview) || !Array.isArray(value.soes) || value.soes.length > 100) return null;
  const date = value.disclosed_at;
  if (typeof date !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(date)) return null;
  const timestamp = Date.parse(date);
  if (!Number.isFinite(timestamp) || timestamp > Date.now() + 5 * 60_000) return null;
  const o = value.overview;
  if (!label(o.holding_name) || !label(o.holding_code, 80) || !label(o.governance_model, 500)
    || !money(o.total_soe_assets_wld) || !money(o.hourly_soe_revenue_wld)
    || !money(o.hourly_soe_profit_wld, true) || !money(o.hourly_soe_dividends_wld, true)) return null;

  const seen = new Set<string>();
  const soes: PublicEnterpriseDisclosure['soes'][number][] = [];
  for (const row of value.soes) {
    if (!record(row) || !label(row.code, 50) || !/^SOE_[A-Z0-9_]{2,40}$/.test(row.code)
      || seen.has(row.code) || !label(row.name) || !label(row.category, 80)
      || !label(row.ceo_name) || !label(row.description, 1000) || !label(row.eval_grade, 20)
      || !money(row.total_assets_wld) || !money(row.operating_revenue_hourly_wld)
      || !money(row.net_profit_hourly_wld, true)
      || typeof row.dividend_rate_bps !== 'number' || !Number.isInteger(row.dividend_rate_bps)
      || row.dividend_rate_bps < 0 || row.dividend_rate_bps > 10000
      || !['ACTIVE', 'PAUSED', 'PRIVATIZING'].includes(String(row.status))) return null;
    seen.add(row.code);
    soes.push({
      code: row.code, name: row.name, category: row.category, ceo_name: row.ceo_name,
      total_assets_wld: row.total_assets_wld, operating_revenue_hourly_wld: row.operating_revenue_hourly_wld,
      net_profit_hourly_wld: row.net_profit_hourly_wld, dividend_rate_bps: row.dividend_rate_bps,
      eval_grade: row.eval_grade, status: row.status as 'ACTIVE' | 'PAUSED' | 'PRIVATIZING', description: row.description,
    });
  }
  return {
    overview: {
      holding_name: o.holding_name, holding_code: o.holding_code,
      total_soe_assets_wld: o.total_soe_assets_wld, hourly_soe_revenue_wld: o.hourly_soe_revenue_wld,
      hourly_soe_profit_wld: o.hourly_soe_profit_wld, hourly_soe_dividends_wld: o.hourly_soe_dividends_wld,
      governance_model: o.governance_model,
    }, soes, disclosed_at: date,
  };
}
