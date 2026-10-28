import type { SwfPortfolioItem, SwfEvent } from './swf-control-panel';

export interface VerifiedSwfConfig {
  id: 'current';
  is_enabled: boolean;
  safe_reserve_wld: string;
  max_single_investment_wld: string;
  reinvestment_ratio_pct: number;
  max_investment_ratio_pct: number;
  equity_ratio_pct: number;
  bond_ratio_pct: number;
  dividend_ratio_pct: number;
  auto_harvest_enabled?: boolean;
  auto_tax_enabled?: boolean;
  auto_growth_yield_bps?: number;
  target_anchor_wld?: string;
}

export interface VerifiedSwfEvidence {
  config: VerifiedSwfConfig;
  portfolios: SwfPortfolioItem[];
  events: SwfEvent[];
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const unsigned = /^(0|[1-9][0-9]*)$/;
const signed = /^(0|-?[1-9][0-9]*)$/;
const quantity = /^(0|[1-9][0-9]*)(?:\.[0-9]+)?$/;

function object(raw: unknown): Record<string, unknown> | null {
  return raw !== null && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Record<string, unknown> : null;
}
function text(raw: unknown, max = 120): raw is string {
  return typeof raw === 'string' && raw.trim().length > 0 && raw.length <= max;
}
function decimal(raw: unknown, allowNegative = false): raw is string {
  return typeof raw === 'string' && raw.length <= 80 && (allowNegative ? signed : unsigned).test(raw);
}
function percentage(raw: unknown): raw is number {
  return typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 && raw <= 100;
}
function timestamp(raw: unknown): raw is string {
  return text(raw, 40) && /^\d{4}-\d\d-\d\dT/.test(raw) && Number.isFinite(Date.parse(raw));
}

/** Only observed, well-formed DB projections may authorize a financial console display. */
export function parseSwfEvidence(raw: unknown): VerifiedSwfEvidence | null {
  const data = object(raw);
  const config = object(data?.config);
  if (!data || !config || !Array.isArray(data.portfolios) || !Array.isArray(data.events) ||
      data.portfolios.length > 500 || data.events.length > 50 ||
      config.id !== 'current' || typeof config.is_enabled !== 'boolean' ||
      !decimal(config.safe_reserve_wld) || !decimal(config.max_single_investment_wld) ||
      !percentage(config.reinvestment_ratio_pct) || !percentage(config.max_investment_ratio_pct) ||
      !percentage(config.equity_ratio_pct) || !percentage(config.bond_ratio_pct) ||
      !percentage(config.dividend_ratio_pct) ||
      (config.auto_harvest_enabled !== undefined && typeof config.auto_harvest_enabled !== 'boolean') ||
      (config.auto_tax_enabled !== undefined && typeof config.auto_tax_enabled !== 'boolean') ||
      (config.auto_growth_yield_bps !== undefined &&
        (!Number.isSafeInteger(config.auto_growth_yield_bps) || (config.auto_growth_yield_bps as number) < 0)) ||
      (config.target_anchor_wld !== undefined && !decimal(config.target_anchor_wld))) return null;

  const seenPortfolioIds = new Set<string>();
  for (const item of data.portfolios) {
    const p = object(item);
    if (!p || !text(p.id, 36) || !uuid.test(p.id) || seenPortfolioIds.has(p.id) ||
        !text(p.asset_type, 40) || !text(p.asset_symbol, 40) || !text(p.asset_name, 120) ||
        !text(p.quantity, 80) || !quantity.test(p.quantity) ||
        !decimal(p.total_invested_wld) ||
        !text(p.average_price_wld, 80) || !quantity.test(p.average_price_wld) ||
        !decimal(p.current_valuation_wld) || !decimal(p.unrealized_pnl_wld, true)) return null;
    seenPortfolioIds.add(p.id);
  }
  const seenEventIds = new Set<string>();
  for (const item of data.events) {
    const e = object(item);
    if (!e || !text(e.id, 36) || !uuid.test(e.id) || seenEventIds.has(e.id) ||
        !text(e.event_type, 60) || !decimal(e.amount_wld, true) ||
        !text(e.summary, 1000) || !timestamp(e.created_at)) return null;
    seenEventIds.add(e.id);
  }
  return data as unknown as VerifiedSwfEvidence;
}

/** Never round numeric(38,0) PostgreSQL values through IEEE-754 Number. */
export function swfPortfolioTotals(portfolios: readonly SwfPortfolioItem[]): { aumWld: string; pnlWld: string } {
  return {
    aumWld: portfolios.reduce((sum, row) => sum + BigInt(row.current_valuation_wld), 0n).toString(),
    pnlWld: portfolios.reduce((sum, row) => sum + BigInt(row.unrealized_pnl_wld), 0n).toString(),
  };
}

/** Decimal quantity formatting without a lossy Number conversion. */
export function formatSwfQuantity(value: string): string {
  if (!quantity.test(value)) return '—';
  const [whole, fraction] = value.split('.');
  return (whole ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fraction === undefined ? '' : `.${fraction}`);
}
