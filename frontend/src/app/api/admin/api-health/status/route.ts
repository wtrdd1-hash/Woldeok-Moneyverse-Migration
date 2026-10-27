import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminConsole('/admin/api-health');
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const data = await api('/api/v1/admin/api-health/status');
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const detail = error instanceof ApiError ? error.detail : 'Service Unavailable';
    return NextResponse.json({ error: detail }, { status });
  }
}
