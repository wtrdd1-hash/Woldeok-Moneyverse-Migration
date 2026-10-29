import { canonicalIntegerString } from '@/lib/money';
import type {
  DividendLogItem,
  PrivateEnterpriseItem,
  StateEnterpriseItem,
  StateHoldingOverviewItem,
} from './enterprise-control-tower';

type RecordValue = Record<string, unknown>;

export interface EnterpriseEvidence {
  readonly overview: StateHoldingOverviewItem;
  readonly soes: StateEnterpriseItem[];
  readonly privateEnterprises: PrivateEnterpriseItem[];
  readonly dividendLogs: DividendLogItem[];
}

function object(value: unknown): RecordValue | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

function label(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 512;
}

function integer(value: unknown, negative = false): string | null {
  // PostgreSQL numeric division may serialize a mathematically integral WLD
  // amount as "36000.000000"; normalize only zero fractional tails.
  if (typeof value !== 'string') return null;
  const result = canonicalIntegerString(value.replace(/\.0+$/, ''));
  return result !== null && (negative || !result.startsWith('-')) ? result : null;
}

function count(value: unknown, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
}

function uuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function grade(value: unknown): value is string {
  return typeof value === 'string' && /^[SABCDE]$/.test(value);
}

function date(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function unique<T>(items: T[], key: (item: T) => string): boolean {
  return new Set(items.map(key)).size === items.length;
}

function overviewRow(value: unknown): StateHoldingOverviewItem | null {
  const row = object(value);
  if (
    !row ||
    !label(row.holding_name) ||
    !label(row.holding_code) ||
    !label(row.governance_model) ||
    !count(row.total_private_enterprises)
  )
    return null;
  const assets = integer(row.total_soe_assets_wld);
  const revenue = integer(row.hourly_soe_revenue_wld);
  const profit = integer(row.hourly_soe_profit_wld, true);
  const dividends = integer(row.hourly_soe_dividends_wld, true);
  const valuation = integer(row.total_private_valuation_wld);
  const tax = integer(row.hourly_corporate_tax_wld);
  if ([assets, revenue, profit, dividends, valuation, tax].some((n) => n === null)) return null;
  return {
    holding_name: row.holding_name,
    holding_code: row.holding_code,
    total_soe_assets_wld: assets!,
    hourly_soe_revenue_wld: revenue!,
    hourly_soe_profit_wld: profit!,
    hourly_soe_dividends_wld: dividends!,
    total_private_enterprises: row.total_private_enterprises,
    total_private_valuation_wld: valuation!,
    hourly_corporate_tax_wld: tax!,
    governance_model: row.governance_model,
  };
}

function soeRow(value: unknown): StateEnterpriseItem | null {
  const row = object(value);
  if (
    !row ||
    !uuid(row.id) ||
    !label(row.code) ||
    !label(row.name) ||
    !label(row.category) ||
    !label(row.ceo_name) ||
    !grade(row.eval_grade) ||
    !count(row.eval_score, 100) ||
    !count(row.dividend_rate_bps, 10000) ||
    !['ACTIVE', 'PAUSED', 'PRIVATIZING'].includes(String(row.status)) ||
    !(typeof row.description === 'string' || row.description === null)
  )
    return null;
  const assets = integer(row.total_assets_wld);
  const revenue = integer(row.operating_revenue_hourly_wld);
  const cost = integer(row.operating_cost_hourly_wld);
  const profit = integer(row.net_profit_hourly_wld, true);
  if ([assets, revenue, cost, profit].some((n) => n === null)) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    ceo_name: row.ceo_name,
    total_assets_wld: assets!,
    operating_revenue_hourly_wld: revenue!,
    operating_cost_hourly_wld: cost!,
    net_profit_hourly_wld: profit!,
    dividend_rate_bps: row.dividend_rate_bps,
    eval_grade: row.eval_grade,
    eval_score: row.eval_score,
    status: row.status as string,
    description: row.description ?? '',
  };
}

function privateRow(value: unknown): PrivateEnterpriseItem | null {
  const row = object(value);
  if (
    !row ||
    !uuid(row.id) ||
    !label(row.symbol) ||
    !label(row.name) ||
    !label(row.sector) ||
    !['SEED', 'SERIES_A', 'SERIES_B', 'IPO_LISTED'].includes(String(row.stage)) ||
    !count(row.corporate_tax_rate_bps, 10000) ||
    typeof row.active !== 'boolean'
  )
    return null;
  const valuation = integer(row.valuation_wld);
  const revenue = integer(row.revenue_hourly_wld);
  const tax = integer(row.tax_paid_total_wld);
  const dividends = integer(row.dividends_paid_total_wld);
  if ([valuation, revenue, tax, dividends].some((n) => n === null)) return null;
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    sector: row.sector,
    stage: row.stage as string,
    valuation_wld: valuation!,
    revenue_hourly_wld: revenue!,
    corporate_tax_rate_bps: row.corporate_tax_rate_bps,
    tax_paid_total_wld: tax!,
    dividends_paid_total_wld: dividends!,
    active: row.active,
  };
}

function dividendRow(value: unknown): DividendLogItem | null {
  const row = object(value);
  if (
    !row ||
    !uuid(row.id) ||
    !uuid(row.enterprise_id) ||
    !label(row.enterprise_code) ||
    !label(row.enterprise_name) ||
    !grade(row.eval_grade) ||
    !date(row.created_at)
  )
    return null;
  const dividend = integer(row.dividend_amount_wld);
  const revenue = integer(row.revenue_wld);
  const profit = integer(row.net_profit_wld, true);
  if ([dividend, revenue, profit].some((n) => n === null)) return null;
  return {
    id: row.id,
    enterprise_id: row.enterprise_id,
    enterprise_code: row.enterprise_code,
    enterprise_name: row.enterprise_name,
    dividend_amount_wld: dividend!,
    revenue_wld: revenue!,
    net_profit_wld: profit!,
    eval_grade: row.eval_grade,
    created_at: row.created_at,
  };
}

function rows<T>(value: unknown, parse: (row: unknown) => T | null, limit: number): T[] | null {
  if (!Array.isArray(value) || value.length > limit) return null;
  const parsed = value.map(parse);
  return parsed.every((row): row is T => row !== null) ? parsed : null;
}

export function parseEnterpriseEvidence(input: {
  readonly overview: unknown;
  readonly soes: unknown;
  readonly privateEnterprises: unknown;
  readonly dividendLogs: unknown;
}): EnterpriseEvidence | null {
  const overview = overviewRow(input.overview);
  const soes = rows(input.soes, soeRow, 1000);
  const privateEnterprises = rows(input.privateEnterprises, privateRow, 10000);
  const dividendLogs = rows(input.dividendLogs, dividendRow, 100);
  if (
    !overview ||
    !soes ||
    !privateEnterprises ||
    !dividendLogs ||
    !unique(soes, (row) => row.id) ||
    !unique(soes, (row) => row.code) ||
    !unique(privateEnterprises, (row) => row.id) ||
    !unique(privateEnterprises, (row) => row.symbol) ||
    !unique(dividendLogs, (row) => row.id)
  )
    return null;
  return { overview, soes, privateEnterprises, dividendLogs };
}
