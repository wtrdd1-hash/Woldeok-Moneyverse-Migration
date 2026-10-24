import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { ledgerCsvContent } from '@/lib/ledger-csv';
import { isCanonicalWld, pocketBreakdown, type TransactionView } from '@/app/wallet/sides';

export const dynamic = 'force-dynamic';

interface WalletRecentExport {
  readonly currency: string;
  readonly recentLimit: number;
  readonly transactions: readonly TransactionView[];
}

const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
};

function unavailable(status: number): NextResponse {
  return NextResponse.json({ error: 'wallet export unavailable' }, { status, headers: PRIVATE_HEADERS });
}

function validTransaction(value: unknown): value is TransactionView {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<TransactionView>;
  return typeof row.transactionId === 'string'
    && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(row.transactionId)
    && typeof row.type === 'string' && row.type.length <= 100
    && typeof row.label === 'string' && row.label.length <= 200
    && (row.direction === 'in' || row.direction === 'out' || row.direction === 'neutral')
    && typeof row.occurredAt === 'string' && !Number.isNaN(Date.parse(row.occurredAt))
    && isCanonicalWld(row.netAmount)
    && pocketBreakdown(row) !== null;
}

/** Download a fresh owner-scoped snapshot, not the possibly stale five wallet UI rows. */
export async function GET(request: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer) return unavailable(503);
  if (!viewer.signedIn) return unavailable(401);
  if (!viewer.consentCurrent) return unavailable(403);

  try {
    const result = await api<WalletRecentExport>('/api/v1/wallet/transactions/export');
    if (!result || result.currency !== 'WLD' || result.recentLimit !== 50
      || !Array.isArray(result.transactions) || result.transactions.length > 50
      || !result.transactions.every(validTransaction)) return unavailable(503);
    const isEn = new URL(request.url).searchParams.get('lang') === 'en';
    const content = ledgerCsvContent(result.transactions, isEn);
    return new NextResponse(content, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="moneyverse-ledger-recent.csv"',
      },
    });
  } catch {
    return unavailable(503);
  }
}
