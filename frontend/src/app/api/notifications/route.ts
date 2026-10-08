import { NextResponse } from 'next/server';
import { api, apiOrNull } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ notifications: [] }, { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const limit = searchParams.get('limit') || '50';

  const items = await apiOrNull<unknown>(`/api/v1/notifications?limit=${limit}${unreadOnly ? '&unreadOnly=true' : ''}`);

  if (!Array.isArray(items)) {
    return NextResponse.json(
      { error: 'Notification service unavailable' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    );
  }

  return NextResponse.json({ notifications: items }, { headers: { 'cache-control': 'private, no-store' } });
}

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      const result = await api('/api/v1/notifications/read-all', { method: 'POST' });
      return NextResponse.json(result);
    }

    if (notificationId) {
      const result = await api(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'POST' });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update notification' }, { status: 500 });
  }
}
