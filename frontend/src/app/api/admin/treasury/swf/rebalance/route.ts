import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Shared same-origin guard (QA 2026-11-25): the hand-rolled check here either
  // failed open without an Origin or refused every proxied browser request.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ code: 'SWF_ORIGIN_DENIED' }, {
      status: 403, headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  try {
    const result = await mutate<unknown>('/api/v1/admin/treasury/swf/rebalance', {
      method: 'POST',
      body: {},
    });
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
