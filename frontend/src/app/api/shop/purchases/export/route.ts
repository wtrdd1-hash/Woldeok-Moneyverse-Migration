import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Purchase {
  readonly purchaseId: string;
  readonly itemId: string;
  readonly transactionId: string;
  readonly itemName: string;
  readonly amount: string;
  readonly purchasedAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]*)$/;
const CSV_HEADERS = ['Purchased at (UTC)', 'Purchase ID', 'Item ID', 'Item name', 'Amount (WLD)', 'Transaction reference ID'];
const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
};

function csvCell(value: string): string {
  // Spreadsheet software evaluates leading formulas even in quoted CSV cells.
  const normalized = value.replace(/[\p{Cc}\p{Cf}\u2028\u2029]+/gu, ' ').trim();
  const escaped = /^[=+@-]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${escaped.replace(/"/g, '""')}"`;
}

function parsePurchase(value: unknown): Purchase {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('invalid purchase record');
  }
  const record = value as Record<string, unknown>;
  for (const key of ['purchaseId', 'itemId', 'transactionId']) {
    if (typeof record[key] !== 'string' || !UUID.test(record[key])) {
      throw new Error('invalid purchase identifier');
    }
  }
  if (typeof record.itemName !== 'string' || !record.itemName.trim() || record.itemName.length > 160) {
    throw new Error('invalid purchase item');
  }
  if (typeof record.amount !== 'string' || !WLD.test(record.amount) || record.amount.length > 19 || BigInt(record.amount) <= 0n || BigInt(record.amount) > 9223372036854775807n) {
    throw new Error('invalid purchase amount');
  }
  if (typeof record.purchasedAt !== 'string' || !Number.isFinite(Date.parse(record.purchasedAt))) {
    throw new Error('invalid purchase date');
  }
  return record as unknown as Purchase;
}

function problem(status: number, code: string): NextResponse {
  return NextResponse.json({ code }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const raw = params.getAll('limit');
  if ([...params.keys()].some((key) => key !== 'limit') || raw.length > 1) {
    return problem(400, 'invalid_purchase_export_limit');
  }
  const limit = raw.length === 0 ? 100 : /^(?:[1-9]|[1-9][0-9]|100)$/.test(raw[0]!) ? Number(raw[0]) : null;
  if (limit === null) return problem(400, 'invalid_purchase_export_limit');

  try {
    // The NestJS session/consent guards choose the member; no actor ID crosses the URL.
    const payload = await api<unknown>(`/api/v1/shop/purchases?limit=${limit}`);
    if (!payload || typeof payload !== 'object' || !('purchases' in payload)) {
      throw new Error('purchase API returned an invalid response');
    }
    const purchases = (payload as { purchases: unknown }).purchases;
    if (!Array.isArray(purchases) || purchases.length > limit) {
      throw new Error('purchase API returned an invalid list');
    }
    const rows = purchases.map((value: unknown) => {
      const purchase = parsePurchase(value);
      return [
        new Date(purchase.purchasedAt).toISOString(), purchase.purchaseId, purchase.itemId,
        purchase.itemName, purchase.amount, purchase.transactionId,
      ].map(csvCell).join(',');
    });
    const content = '\uFEFF' + [CSV_HEADERS.map(csvCell).join(','), ...rows].join('\r\n');
    return new NextResponse(content, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="moneyverse-shop-purchases-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && [401, 403, 428].includes(error.status)) {
      return problem(error.status, 'purchase_export_not_authorized');
    }
    return problem(503, 'purchase_export_unavailable');
  }
}
