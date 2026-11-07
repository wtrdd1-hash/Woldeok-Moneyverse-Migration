import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
  'referrer-policy': 'no-referrer',
};

export async function GET(
  _request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  if (!UUID.test(id)) {
    return NextResponse.json(
      { code: 'stock_orderbook_id_invalid', detail: 'stock id must be a UUID' },
      { status: 400, headers: PRIVATE_HEADERS },
    );
  }

  try {
    // Consult the actual Nest contract; even a legacy 200 cannot certify fabricated depth.
    await api(`/api/v1/stocks/${id}/orderbook`, { timeoutMs: 3000 });
  } catch {
    // Missing backend, 404, and 503 are all unverified rather than empty books.
  }
  return NextResponse.json(
    { code: 'stock_orderbook_source_unverified', detail: 'verified order depth is unavailable' },
    { status: 503, headers: PRIVATE_HEADERS },
  );
}
