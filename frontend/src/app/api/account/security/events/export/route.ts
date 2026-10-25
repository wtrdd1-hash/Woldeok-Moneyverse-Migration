import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { securityEventsCsv } from '@/app/account/security/security-events-csv';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
};

function failure(status: number): NextResponse {
  return NextResponse.json({ error: 'security_event_export_unavailable' }, {
    status,
    headers: PRIVATE_HEADERS,
  });
}

/** A same-origin, authenticated export; the NestJS guard verifies the owner. */
export async function GET(): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await api<unknown>('/api/v1/account/security/events/export');
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return failure(error.status);
    }
    return failure(503);
  }

  try {
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return failure(502);
    const record = payload as Record<string, unknown>;
    if (record.scope !== 'recent-50') return failure(502);
    const csv = securityEventsCsv(record.events);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="moneyverse-security-events-recent.csv"',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return failure(502);
  }
}
