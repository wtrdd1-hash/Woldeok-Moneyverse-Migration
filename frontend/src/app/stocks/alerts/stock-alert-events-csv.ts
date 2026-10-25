/** Read-only latest-100 virtual-stock alert triggers, not executed trades or payouts. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER_WLD = /^(0|[1-9][0-9]{0,18})$/;
const MAX_WLD = 9_223_372_036_854_775_807n;
const CONDITIONS = new Set([
  'price_at_or_above', 'price_at_or_below',
  'day_change_at_or_above', 'day_change_at_or_below',
]);

function requiredText(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max) {
    throw new Error('invalid alert event ' + field);
  }
  return value;
}

function uuid(value: unknown, field: string): string {
  const id = requiredText(value, field, 36);
  if (!UUID.test(id)) throw new Error('invalid alert event ' + field);
  return id;
}

function amount(value: unknown, field: string, positive = false): string {
  if (typeof value !== 'string' || !INTEGER_WLD.test(value) ||
      BigInt(value) > MAX_WLD || (positive && value === '0')) {
    throw new Error('invalid alert event ' + field);
  }
  return value;
}

function integer(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error('invalid alert event ' + field);
  }
  return value;
}

function timestamp(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    throw new Error('invalid alert event timestamp');
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value) {
    throw new Error('invalid alert event timestamp');
  }
  return value;
}

function cell(value: string): string {
  const clean = value.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? "'" + clean : clean;
  return '"' + safe.replace(/"/g, '""') + '"';
}

function row(input: unknown): { eventId: string; cells: string[] } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid alert event');
  const value = input as Record<string, unknown>;
  const eventId = uuid(value['event_id'], 'event id');
  const alertId = uuid(value['alert_id'], 'alert id');
  const stockId = uuid(value['stock_id'], 'stock id');
  const symbol = requiredText(value['symbol'], 'symbol', 80);
  const name = requiredText(value['name'], 'name', 300);
  const condition = requiredText(value['condition_kind'], 'condition', 50);
  if (!CONDITIONS.has(condition)) throw new Error('unsupported alert condition');
  const isPrice = condition.startsWith('price_');
  const thresholdWld = isPrice ? amount(value['threshold_amount'], 'threshold WLD', true) : '';
  const thresholdBps = isPrice ? '' : String(integer(value['threshold_bps'], 'threshold bps', -100_000, 100_000));
  if (isPrice ? value['threshold_bps'] !== null : value['threshold_amount'] !== null) {
    throw new Error('mixed alert threshold units');
  }
  const price = amount(value['trigger_price'], 'trigger WLD');
  const changeBps = String(integer(value['trigger_day_change_bps'], 'trigger bps', -2_147_483_648, 2_147_483_647));
  const triggeredAt = timestamp(value['triggered_at']);
  return {
    eventId,
    cells: [triggeredAt, eventId, alertId, stockId, symbol, name, condition,
      thresholdWld, thresholdBps, price, changeBps,
      'recent trigger only; not a trade or payout receipt'],
  };
}

/** Validate the entire bounded response before emitting any downloadable bytes. */
export function stockAlertEventsCsv(input: unknown): string {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('alert snapshot unavailable');
  const data = input as Record<string, unknown>;
  if (data['scope'] !== 'recent_100_max' || !Array.isArray(data['events']) || data['events'].length > 100) {
    throw new Error('unverified alert snapshot');
  }
  const rows = data['events'].map((event: unknown) => row(event));
  if (new Set(rows.map((event) => event.eventId)).size !== rows.length) {
    throw new Error('duplicate alert event');
  }
  const header = [
    'Triggered at (UTC)', 'Event ID', 'Alert ID', 'Stock ID', 'Symbol', 'Stock name',
    'Condition', 'Threshold WLD (integer string)', 'Threshold basis points',
    'Trigger price WLD (integer string)', 'Trigger day change basis points', 'Scope',
  ];
  return '\uFEFF' + [header.map(cell).join(','), ...rows.map((event) => event.cells.map(cell).join(','))].join('\r\n') + '\r\n';
}
