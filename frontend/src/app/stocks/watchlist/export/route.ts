import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff',
};

interface ExportRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly created_at: string;
}

function isExportRow(value: unknown): value is ExportRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return typeof row.stock_id === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(row.stock_id)
    && typeof row.symbol === 'string' && row.symbol.length > 0 && row.symbol.length <= 40
    && typeof row.name === 'string' && row.name.length > 0 && row.name.length <= 256
    && typeof row.current_price === 'string' && /^(0|[1-9][0-9]{0,18})$/.test(row.current_price)
    && typeof row.day_open_price === 'string' && /^(0|[1-9][0-9]{0,18})$/.test(row.day_open_price)
    && typeof row.created_at === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(row.created_at)
    && Number.isFinite(Date.parse(row.created_at));
}

function csvCell(value: string): string {
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ');
  // Spreadsheet engines can execute formula-looking text even inside quoted CSV cells.
  const safe = /^[\s]*[=+\-@]/.test(cleaned) ? `'${cleaned}` : cleaned;
  return `"${safe.replace(/"/g, '""')}"`;
}

function errorResponse(status: number): NextResponse {
  return NextResponse.json({ error: 'watchlist export unavailable' }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(): Promise<NextResponse> {
  try {
    const snapshot = await api<unknown>('/api/v1/stocks/watchlist/export');
    if (!snapshot || typeof snapshot !== 'object' || !('stocks' in snapshot)) return errorResponse(503);
    const rows = (snapshot as { stocks: unknown }).stocks;
    if (!Array.isArray(rows) || rows.length > 100 || !rows.every(isExportRow)) return errorResponse(503);

    const columns = ['stock_id', 'symbol', 'name', 'current_price_wld', 'day_open_price_wld', 'saved_at'];
    const lines = rows.map((row: ExportRow) => [row.stock_id, row.symbol, row.name, row.current_price, row.day_open_price, row.created_at].map(csvCell).join(','));
    const csv = `\uFEFF${[columns.join(','), ...lines].join('\r\n')}\r\n`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="moneyverse-stock-watchlist.csv"',
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 409)) {
      return errorResponse(error.status);
    }
    return errorResponse(503);
  }
}
