import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const canonical = process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL).origin
    : new URL(request.url).origin;
  if (origin && origin !== canonical) {
    return NextResponse.json({ code: 'SWF_ORIGIN_DENIED' }, {
      status: 403, headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  try {
    const result = await mutate<unknown>('/api/v1/admin/treasury/swf/rebalance', {
      method: 'POST',
      body: {},
    });
    // An HTTP 2xx from upstream is not proof of a settled portfolio trade.
    const receipt = result && typeof result === 'object'
      ? result as Record<string, unknown>
      : null;
    if (receipt?.executed !== true ||
        typeof receipt.ledger_transaction_id !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(receipt.ledger_transaction_id)) {
      return NextResponse.json(
        { code: 'SWF_SETTLEMENT_UNVERIFIED', message: 'SWF trade has no verified ledger receipt.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const message = error instanceof Error ? error.message : 'SWF rebalance failed';
    return NextResponse.json(
      { error: 'SWF_REBALANCE_UNAVAILABLE', message },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
