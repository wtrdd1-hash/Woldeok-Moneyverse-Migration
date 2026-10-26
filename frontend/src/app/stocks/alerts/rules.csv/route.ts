import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { buildStockAlertRulesCsv, type ExportableStockAlertRule } from '../stock-alert-rules-csv';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff',
  vary: 'Cookie',
};

export async function GET(): Promise<NextResponse> {
  try {
    const response = await api<{ readonly rules: readonly ExportableStockAlertRule[]; readonly limit: number }>(
      '/api/v1/stocks/alerts/rules-export', { timeoutMs: 12_000 },
    );
    if (response.limit !== 100) throw new Error('Invalid export limit');
    const csv = buildStockAlertRulesCsv(response.rules);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="moneyverse-active-stock-alert-rules.csv"',
      },
    });
  } catch (error: unknown) {
    const status = error instanceof ApiError && [401, 403, 409, 428].includes(error.status)
      ? error.status : 503;
    return NextResponse.json({ error: 'Private stock alert rule export unavailable; no file was generated.' }, {
      status, headers: PRIVATE_HEADERS,
    });
  }
}
