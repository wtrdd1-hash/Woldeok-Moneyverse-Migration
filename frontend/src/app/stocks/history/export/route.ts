import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { stockTradeCsv, type ExportStockTrade } from '@/lib/stock-trade-csv';

export const dynamic = 'force-dynamic';

/** No browser-side financial data fetch, no shared cache, and no guessed empty receipts. */
export async function GET(): Promise<Response> {
  await requireMember();
  const { trades } = await api<{ trades: ExportStockTrade[] }>('/api/v1/stocks/history?limit=100');
  const content = stockTradeCsv(trades);
  return new Response(content, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="moneyverse-stock-trades-recent.csv"',
      'cache-control': 'private, no-store, max-age=0',
      'x-robots-tag': 'noindex, nofollow',
      'x-content-type-options': 'nosniff',
    },
  });
}
