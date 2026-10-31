import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { parseSwfEvidence } from '@/app/admin/treasury/swf-evidence';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = parseSwfEvidence(await api<unknown>('/api/v1/admin/treasury/swf'));
    if (!data) {
      return NextResponse.json(
        { code: 'SWF_EVIDENCE_UNVERIFIED', error: 'SWF evidence is unavailable or malformed.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'private, no-store' } });
  }
}

export async function POST() {
  // Do not forward unverified financial execution to an upstream service.
  return NextResponse.json(
    { error: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function PUT(request: Request) {
  // A server-side CSRF token must never be sent to the browser. The BFF only
  // accepts same-origin requests and mutate() performs one-token-one-write.
  const origin = request.headers.get('origin');
  // Next's internal URL can be http:// behind a TLS-terminating Nginx proxy.
  // Compare with the server-configured canonical public origin, not a
  // client-provided forwarded header or the private loopback scheme.
  const canonical = process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL).origin
    : new URL(request.url).origin;
  if (!origin || origin !== canonical) {
    return NextResponse.json({ code: 'SWF_ORIGIN_DENIED' }, {
      status: 403, headers: { 'Cache-Control': 'private, no-store' },
    });
  }
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ code: 'SWF_POLICY_INVALID' }, {
        status: 400, headers: { 'Cache-Control': 'private, no-store' },
      });
    }
    const config = await mutate<unknown>('/api/v1/admin/treasury/swf/config', {
      method: 'PUT', body,
    });
    if (!parseSwfEvidence({ config, portfolios: [], events: [] })) {
      return NextResponse.json({ code: 'SWF_POLICY_EVIDENCE_UNVERIFIED' }, {
        status: 503, headers: { 'Cache-Control': 'private, no-store' },
      });
    }
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return NextResponse.json({ code: 'SWF_POLICY_WRITE_UNAVAILABLE' }, {
      status, headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}
