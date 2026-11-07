import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { parseApiHealthResponse } from '@/app/admin/api-health/api-health-source';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer' };

export async function GET() {
  try {
    await requireAdminConsole('/admin/api-health');
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: privateHeaders });
  }

  try {
    const data = await api('/api/v1/admin/api-health/status');
    const verified = parseApiHealthResponse(data);
    if (verified === null) {
      return NextResponse.json({ error: 'api_health_source_unverified' }, { status: 503, headers: privateHeaders });
    }
    return NextResponse.json(verified, { headers: privateHeaders });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const detail = error instanceof ApiError ? error.detail : 'Service Unavailable';
    return NextResponse.json({ error: detail }, { status, headers: privateHeaders });
  }
}
