import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

/**
 * The caller's own purchase receipts.
 *
 * A route handler rather than part of the page, because `/shop` is statically
 * generated for the catalogue — that page is what a crawler and a first-time
 * visitor see — and a member's receipts cannot live in a document that is
 * cached for everyone. Fetching them after hydration keeps both.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const data = await apiOrNull<unknown>('/api/v1/shop/purchases');
  return NextResponse.json(data ?? { purchases: [] }, {
    headers: { 'cache-control': 'private, no-store' },
  });
}
