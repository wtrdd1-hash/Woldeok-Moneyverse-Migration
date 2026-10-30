import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { validateStorageSnapshot } from '@/app/admin/operations/storage/storage-view';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow' };

export async function GET() {
  try {
    await requireAdminConsole('/admin/operations/storage');
  } catch {
    return NextResponse.json({ status: 'UNKNOWN', error: 'unauthorized' }, { status: 401, headers });
  }
  try {
    const evidence: unknown = await api('/api/v1/admin/operations/storage');
    const verified = validateStorageSnapshot(evidence);
    if (verified) return NextResponse.json(verified, { headers });
  } catch {
    // The source's private paths, key details and raw errors must not escape the proxy.
  }
  return NextResponse.json({ status: 'UNKNOWN', error: 'storage evidence unavailable' }, { status: 503, headers });
}
