/** Read-only virtual stock position snapshot; NOT a transaction/settlement receipt. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER = /^(0|[1-9][0-9]{0,37})$/;
const LABEL = /^[^\u0000-\u001f\u007f]{1,200}$/;

function csvCell(value: string): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? `'${clean}` : clean;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function stockHoldingsCsv(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid holdings response');
  const response = data as Record<string, unknown>;
  if (response['scope'] !== 'current_holdings_only' ||
      !Array.isArray(response['holdings']) || response['holdings'].length > 100) {
    throw new Error('unverified current stock holdings');
  }
  const header = ['Stock ID', 'Symbol', 'Name', 'Shares', 'Average cost (WLD)',
    'Current price (WLD)', 'Market value (WLD)', 'Trading status', 'Scope'];
  const rows = response['holdings'].map((raw: unknown) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('invalid holding');
    const row = raw as Record<string, unknown>;
    if (typeof row['stock_id'] !== 'string' || !UUID.test(row['stock_id']) ||
        typeof row['symbol'] !== 'string' || row['symbol'].length > 32 || !LABEL.test(row['symbol']) ||
        typeof row['name'] !== 'string' || !LABEL.test(row['name']) ||
        typeof row['halt_status'] !== 'string' || !/^[A-Z_]{1,40}$/.test(row['halt_status']) ||
        !['quantity', 'average_cost', 'market_value', 'current_price'].every(
          (key) => typeof row[key] === 'string' && INTEGER.test(row[key]),
        )) throw new Error('unverified holding');
    return [row['stock_id'], row['symbol'], row['name'], row['quantity'],
      row['average_cost'], row['current_price'], row['market_value'],
      row['halt_status'], 'Current holdings only'].map((value) => csvCell(value as string)).join(',');
  });
  return '\uFEFF' + [header.map(csvCell).join(','), ...rows].join('\r\n') + '\r\n';
}
