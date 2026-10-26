export interface ExportableStockAlertRule {
  readonly alert_id: string;
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly condition_kind: string;
  readonly threshold_amount: string | null;
  readonly threshold_bps: number | null;
  readonly cooldown_seconds: number;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly current_day_change_bps: number;
  readonly condition_met: boolean;
  readonly last_evaluated_at: string | null;
  readonly last_triggered_at: string | null;
  readonly created_at: string;
}

const CONDITIONS = new Set([
  'price_at_or_above', 'price_at_or_below',
  'day_change_at_or_above', 'day_change_at_or_below',
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(0|[1-9][0-9]{0,18})$/;
function validAmount(value: unknown): value is string {
  return typeof value === 'string' && AMOUNT.test(value) && BigInt(value) <= 9_223_372_036_854_775_807n;
}
const HEADERS = [
  'alert_id', 'stock_id', 'symbol', 'name', 'condition_kind', 'threshold_amount_wld',
  'threshold_bps', 'cooldown_seconds', 'current_price_wld', 'day_open_price_wld',
  'current_day_change_bps', 'condition_met', 'last_evaluated_at', 'last_triggered_at', 'created_at',
];

function validTime(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && value.length <= 40;
}

function cell(value: string): string {
  const clean = value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ');
  const safe = /^\s*[=+\-@]/.test(clean) ? `'${clean}` : clean;
  return `"${safe.replace(/"/g, '""')}"`;
}

function fields(row: ExportableStockAlertRule): string[] {
  if (!row || !UUID.test(row.alert_id) || !UUID.test(row.stock_id) ||
      typeof row.symbol !== 'string' || row.symbol.length > 64 ||
      typeof row.name !== 'string' || row.name.length > 512 ||
      !CONDITIONS.has(row.condition_kind) || !validAmount(row.current_price) ||
      !validAmount(row.day_open_price) ||
      (row.threshold_amount !== null && !validAmount(row.threshold_amount)) ||
      (row.threshold_bps !== null && !Number.isSafeInteger(row.threshold_bps)) ||
      !Number.isSafeInteger(row.cooldown_seconds) || row.cooldown_seconds < 300 || row.cooldown_seconds > 604800 ||
      !Number.isSafeInteger(row.current_day_change_bps) || typeof row.condition_met !== 'boolean' ||
      !validTime(row.created_at) ||
      (row.last_evaluated_at !== null && !validTime(row.last_evaluated_at)) ||
      (row.last_triggered_at !== null && !validTime(row.last_triggered_at))) {
    throw new Error('Invalid private stock alert rule snapshot');
  }
  const price = row.condition_kind.startsWith('price_');
  if (price ? row.threshold_amount === null || row.threshold_bps !== null : row.threshold_amount !== null || row.threshold_bps === null) {
    throw new Error('Invalid alert threshold type');
  }
  return [row.alert_id, row.stock_id, row.symbol, row.name, row.condition_kind,
    row.threshold_amount ?? '', row.threshold_bps === null ? '' : String(row.threshold_bps),
    String(row.cooldown_seconds), row.current_price, row.day_open_price,
    String(row.current_day_change_bps), String(row.condition_met),
    row.last_evaluated_at ?? '', row.last_triggered_at ?? '', row.created_at];
}

export function buildStockAlertRulesCsv(rows: readonly ExportableStockAlertRule[]): string {
  if (!Array.isArray(rows) || rows.length > 100) throw new Error('Stock alert rule export exceeds complete snapshot limit');
  return `\ufeff${[HEADERS.map(cell).join(','), ...rows.map((row) => fields(row).map(cell).join(','))].join('\r\n')}\r\n`;
}
