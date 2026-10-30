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

const PRIVATE_HEADERS = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const queries = params.getAll('q');
  const term = queries[0]?.trim() ?? '';
  if (queries.length > 1 || Array.from(term).length > 80 || /[\u0000-\u001f\u007f]/.test(term)) {
    return NextResponse.json({ error: 'invalid purchase search' }, { status: 400, headers: PRIVATE_HEADERS });
  }
  const path = `/api/v1/shop/purchases${term ? `?q=${encodeURIComponent(term)}` : ''}`;
  const data = await apiOrNull<unknown>(path);
  if (!data || typeof data !== 'object' || !('purchases' in data) || !Array.isArray(data.purchases)) {
    return NextResponse.json({ error: 'purchase history unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
  return NextResponse.json(data, { headers: PRIVATE_HEADERS });
}
