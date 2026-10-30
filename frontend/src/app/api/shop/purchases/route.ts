import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { parseShopPurchaseHistory } from '@/lib/shop-purchase-history';

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
    return NextResponse.json(
      { error: 'invalid purchase search' },
      { status: 400, headers: PRIVATE_HEADERS },
    );
  }
  const fromValues = params.getAll('from');
  const toValues = params.getAll('to');
  const from = fromValues[0];
  const to = toValues[0];
  const dateStart = (value: string | undefined): number | null => {
    if (!value || !/^d{4}-d{2}-d{2}$/.test(value)) return null;
    const millis = Date.parse(`${value}T00:00:00+09:00`);
    return Number.isFinite(millis) && new Date(millis + 9 * 60 * 60_000).toISOString().slice(0, 10) === value ? millis : null;
  };
  if (fromValues.length > 1 || toValues.length > 1 || (from === undefined) !== (to === undefined)) {
    return NextResponse.json({ error: 'invalid purchase date range' }, { status: 400, headers: PRIVATE_HEADERS });
  }
  if (from !== undefined && to !== undefined) {
    const start = dateStart(from);
    const last = dateStart(to);
    if (start === null || last === null || last < start || (last - start) / 86_400_000 >= 366) {
      return NextResponse.json({ error: 'invalid purchase date range' }, { status: 400, headers: PRIVATE_HEADERS });
    }
  }
  const amounts = params.getAll('minAmount');
  const minAmount = amounts[0];
  if (amounts.length > 1 || (minAmount !== undefined && !/^[1-9][0-9]{0,29}$/.test(minAmount))) {
    return NextResponse.json(
      { error: 'invalid minimum purchase WLD' },
      { status: 400, headers: PRIVATE_HEADERS },
    );
  }
  const forwarded: string[] = [];
  if (term) forwarded.push('q=' + encodeURIComponent(term));
  if (from && to) { forwarded.push('from=' + from); forwarded.push('to=' + to); }
  if (minAmount !== undefined) forwarded.push('minAmount=' + minAmount);
  const path = '/api/v1/shop/purchases' + (forwarded.length ? '?' + forwarded.join('&') : '');
  const data = await apiOrNull<unknown>(path);
  const verified = parseShopPurchaseHistory(data);
  if (!verified) {
    return NextResponse.json({ error: 'purchase history unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
  if (
    minAmount !== undefined &&
    !verified.purchases.every((row) => BigInt(row.amount) >= BigInt(minAmount))
  ) {
    return NextResponse.json(
      { error: 'purchase amount evidence unavailable' },
      { status: 503, headers: PRIVATE_HEADERS },
    );
  }
  }
  return NextResponse.json(verified, { headers: PRIVATE_HEADERS });
}
