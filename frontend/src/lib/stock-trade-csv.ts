/** Exact, bounded, member-only virtual stock trade export. Never coerce WLD to Number. */
export interface ExportStockTrade {
  readonly trade_id: string;
  readonly symbol: string;
  readonly side: string;
  readonly quantity: string;
  readonly unit_price: string;
  readonly gross_amount: string;
  readonly tax_amount: string;
  readonly created_at: string;
}

const CANONICAL_INTEGER = /^(?:0|[1-9][0-9]*)$/;

function amount(value: string): string {
  if (typeof value !== 'string' || !CANONICAL_INTEGER.test(value)) {
    throw new Error('Invalid stock trade integer');
  }
  return value;
}

/** Prefix spreadsheet formulas even when preceded by whitespace or control bytes. */
function cell(value: string): string {
  const clean = value.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? `'${clean}` : clean;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function stockTradeCsv(trades: readonly ExportStockTrade[]): string {
  if (!Array.isArray(trades) || trades.length > 100) throw new Error('Invalid trade export size');
  const rows = trades.map((trade) => {
    if (trade.side !== 'buy' && trade.side !== 'sell') throw new Error('Invalid stock trade side');
    if (typeof trade.created_at !== 'string' || !Number.isFinite(Date.parse(trade.created_at))) {
      throw new Error('Invalid stock trade timestamp');
    }
    return [
      trade.created_at, trade.trade_id, trade.symbol, trade.side,
      amount(trade.quantity), amount(trade.unit_price),
      amount(trade.gross_amount), amount(trade.tax_amount),
    ].map(cell).join(',');
  });
  const header = ['Timestamp', 'Trade ID', 'Symbol', 'Side', 'Quantity', 'Unit price (WLD)', 'Gross (WLD)', 'Tax (WLD)'];
  return '\uFEFF' + [header.map(cell).join(','), ...rows].join('\r\n');
}
