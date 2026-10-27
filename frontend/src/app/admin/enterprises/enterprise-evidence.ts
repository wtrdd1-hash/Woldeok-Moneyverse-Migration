import type {
  DividendLogItem,
  PrivateEnterpriseItem,
  StateEnterpriseItem,
  StateHoldingOverviewItem,
} from './enterprise-control-tower';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 500;
const wld = (value: unknown) => typeof value === 'string' && /^-?(0|[1-9][0-9]*)$/.test(value);
const nonnegativeWld = (value: unknown) =>
  typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value);
const safeCount = (value: unknown) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const bps = (value: unknown) => safeCount(value) && (value as number) <= 10000;
const uuid = (value: unknown) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const fields = (row: RecordValue, keys: string[], validator: (value: unknown) => boolean) =>
  keys.every((key) => validator(row[key]));
const unique = <T>(rows: T[], key: (row: T) => string) =>
  new Set(rows.map(key)).size === rows.length;
const overviewOk = (value: unknown): value is StateHoldingOverviewItem =>
  record(value) &&
  fields(value, ['holding_name', 'holding_code', 'governance_model'], text) &&
  fields(value, ['total_soe_assets_wld', 'total_private_valuation_wld'], nonnegativeWld) &&
  fields(
    value,
    [
      'hourly_soe_revenue_wld',
      'hourly_soe_profit_wld',
      'hourly_soe_dividends_wld',
      'hourly_corporate_tax_wld',
    ],
    wld,
  ) &&
  safeCount(value.total_private_enterprises);
const soeOk = (value: unknown): value is StateEnterpriseItem =>
  record(value) &&
  uuid(value.id) &&
  fields(value, ['code', 'name', 'category', 'ceo_name'], text) &&
  ['S', 'A', 'B', 'C', 'D', 'E'].includes(String(value.eval_grade)) &&
  typeof value.description === 'string' &&
  value.description.length <= 5000 &&
  nonnegativeWld(value.total_assets_wld) &&
  fields(
    value,
    ['operating_revenue_hourly_wld', 'operating_cost_hourly_wld', 'net_profit_hourly_wld'],
    wld,
  ) &&
  bps(value.dividend_rate_bps) &&
  safeCount(value.eval_score) &&
  (value.eval_score as number) <= 100 &&
  ['ACTIVE', 'PAUSED', 'PRIVATIZING'].includes(String(value.status));
const privateOk = (value: unknown): value is PrivateEnterpriseItem =>
  record(value) &&
  uuid(value.id) &&
  fields(value, ['symbol', 'name', 'sector'], text) &&
  ['SEED', 'SERIES_A', 'SERIES_B', 'IPO_LISTED'].includes(String(value.stage)) &&
  fields(
    value,
    ['valuation_wld', 'tax_paid_total_wld', 'dividends_paid_total_wld'],
    nonnegativeWld,
  ) &&
  wld(value.revenue_hourly_wld) &&
  bps(value.corporate_tax_rate_bps) &&
  typeof value.active === 'boolean';
const logOk = (value: unknown): value is DividendLogItem =>
  record(value) &&
  uuid(value.id) &&
  uuid(value.enterprise_id) &&
  fields(value, ['enterprise_code', 'enterprise_name'], text) &&
  ['S', 'A', 'B', 'C', 'D', 'E'].includes(String(value.eval_grade)) &&
  nonnegativeWld(value.dividend_amount_wld) &&
  fields(value, ['revenue_wld', 'net_profit_wld'], wld) &&
  typeof value.created_at === 'string' &&
  Number.isFinite(Date.parse(value.created_at));

export function parseEnterpriseEvidence(
  overview: unknown,
  soes: unknown,
  privateRows: unknown,
  logs: unknown,
): {
  overview: StateHoldingOverviewItem;
  soes: StateEnterpriseItem[];
  privateEnterprises: PrivateEnterpriseItem[];
  dividendLogs: DividendLogItem[];
} | null {
  if (
    !overviewOk(overview) ||
    !Array.isArray(soes) ||
    soes.length > 10000 ||
    !soes.every(soeOk) ||
    !Array.isArray(privateRows) ||
    privateRows.length > 10000 ||
    !privateRows.every(privateOk) ||
    !Array.isArray(logs) ||
    logs.length > 20 ||
    !logs.every(logOk)
  )
    return null;
  if (
    !unique(soes, (row) => row.id) ||
    !unique(soes, (row) => row.code) ||
    !unique(privateRows, (row) => row.id) ||
    !unique(privateRows, (row) => row.symbol) ||
    !unique(logs, (row) => row.id)
  )
    return null;
  return { overview, soes, privateEnterprises: privateRows, dividendLogs: logs };
}
