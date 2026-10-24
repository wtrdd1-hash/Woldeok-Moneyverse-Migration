import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { verifySeoOperator } from '@/lib/admin-seo-authority';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'Cache-Control': 'private, no-store' };

/** Read-only, same-origin proxy; the NestJS endpoint independently enforces admin authority. */
export async function GET() {
  const denied = await verifySeoOperator();
  if (denied) return denied;

  try {
    const data = await api('/api/v1/admin/api-health/status');
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error) {
    const status = error instanceof ApiError
      ? error.status === 401 ? 401 : error.status === 403 || error.status === 428 ? 403 : 503
      : 503;
    return NextResponse.json({ status: 'UNKNOWN', error: status === 503 ? 'telemetry_unavailable' : 'forbidden' }, {
      status,
      headers: privateHeaders,
    });
  }
}
