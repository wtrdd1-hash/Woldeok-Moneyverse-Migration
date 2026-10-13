import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store' };
export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  try {
    const data = await api<{ unreadCount: number }>('/api/v1/notifications/unread-count');
    if (!Number.isSafeInteger(data?.unreadCount) || data.unreadCount < 0) throw new Error('Invalid count');
    return NextResponse.json(data, { headers });
  } catch {
    return NextResponse.json({ error: 'Count unavailable' }, { status: 503, headers });
  }
}
