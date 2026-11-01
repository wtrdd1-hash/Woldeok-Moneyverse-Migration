import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';
const json = (data: unknown, status: number) => NextResponse.json(data, {
  status, headers: { 'Cache-Control': 'private, no-store' },
});
const statuses = new Set(['ACTIVE', 'PAUSED', 'PRIVATIZING']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PUT(request: Request) {
  // The Next same-origin boundary preserves browser cookies and uses one-use
  // server-side CSRF. Never accept an untrusted forwarded host.
  const canonical = process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL).origin : new URL(request.url).origin;
  if (request.headers.get('origin') !== canonical) {
    return json({ code: 'SOE_ORIGIN_DENIED' }, 403);
  }
  let body: unknown;
  try { body = await request.json(); } catch { return json({ code: 'SOE_PAYLOAD_INVALID' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ code: 'SOE_PAYLOAD_INVALID' }, 400);
  }
  const data = body as Record<string, unknown>;
  if (typeof data.code !== 'string' || !/^SOE_[A-Z0-9_]{2,40}$/.test(data.code)
    || typeof data.status !== 'string' || !statuses.has(data.status)
    || typeof data.reason !== 'string' || data.reason.trim().length < 12 || data.reason.length > 500
    || typeof data.idempotencyKey !== 'string' || !uuid.test(data.idempotencyKey)
    || (data.dividendRateBps !== undefined &&
      (typeof data.dividendRateBps !== 'number' || !Number.isInteger(data.dividendRateBps)
       || data.dividendRateBps < 0 || data.dividendRateBps > 10000))) {
    return json({ code: 'SOE_PAYLOAD_INVALID' }, 400);
  }
  try {
    const receipt = await mutate<unknown>(
      `/api/v1/admin/enterprises/soes/${data.code}`,
      { method: 'PUT', body: {
        status: data.status, reason: data.reason.trim(), idempotencyKey: data.idempotencyKey,
        ...(data.dividendRateBps === undefined ? {} : { dividendRateBps: data.dividendRateBps }),
      } },
    );
    if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
      return json({ code: 'SOE_STATUS_RECEIPT_UNVERIFIED' }, 503);
    }
    const evidence = receipt as Record<string, unknown>;
    if (evidence.receipt_id !== data.idempotencyKey || evidence.code !== data.code
      || evidence.new_status !== data.status || evidence.applied !== true
      || evidence.settled !== false) {
      return json({ code: 'SOE_STATUS_RECEIPT_UNVERIFIED' }, 503);
    }
    return json(receipt, 200);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return json({ code: 'SOE_STATUS_WRITE_UNAVAILABLE' }, status);
  }
}
