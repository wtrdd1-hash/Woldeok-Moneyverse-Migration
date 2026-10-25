import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POSITIVE_WLD = /^[1-9][0-9]*$/;

function validPurchase(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.purchaseId === 'string' && UUID.test(row.purchaseId) &&
    typeof row.itemId === 'string' && UUID.test(row.itemId) &&
    typeof row.transactionId === 'string' && UUID.test(row.transactionId) &&
    typeof row.itemName === 'string' && row.itemName.trim().length > 0 && row.itemName.length <= 160 &&
    typeof row.amount === 'string' && POSITIVE_WLD.test(row.amount) &&
    typeof row.purchasedAt === 'string' && Number.isFinite(Date.parse(row.purchasedAt))
  );
}

function validHistory(value: unknown): value is { purchases: Record<string, string>[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const purchases = (value as { purchases?: unknown }).purchases;
  if (!Array.isArray(purchases) || purchases.length > 30 || !purchases.every(validPurchase)) return false;
  return new Set(purchases.map((row) => row.purchaseId)).size === purchases.length;
}

/** A private purchase list is never an empty-success fallback for a failed DB read. */
export async function GET(): Promise<NextResponse> {
  try {
    const data: unknown = await api('/api/v1/shop/purchases');
    if (!validHistory(data)) throw new Error('invalid shop purchase history response');
    return NextResponse.json(data, { headers: PRIVATE_HEADERS });
  } catch (error: unknown) {
    const status = error instanceof ApiError && [401, 403, 428].includes(error.status)
      ? error.status
      : 503;
    return NextResponse.json(
      { code: status === 503 ? 'shop_purchase_history_unavailable' : 'shop_purchase_history_denied' },
      { status, headers: PRIVATE_HEADERS },
    );
  }
}
