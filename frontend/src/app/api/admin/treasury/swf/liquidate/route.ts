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

  let body: unknown = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  try {
    const receipt = await mutate<unknown>('/api/v1/admin/treasury/swf/liquidate', {
      method: 'POST',
      body,
    });
    return NextResponse.json(receipt, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const message = error instanceof Error ? error.message : 'SWF liquidation settlement failed';
    return NextResponse.json(
      { error: 'SWF_LIQUIDATION_UNAVAILABLE', message },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
