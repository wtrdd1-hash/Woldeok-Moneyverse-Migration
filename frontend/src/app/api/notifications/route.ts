import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);

  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const limit = searchParams.get('limit') || '50';
  if (!/^[0-9]{1,3}$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });

  try {
    const items = await api<unknown>(`/api/v1/notifications?limit=${limit}${unreadOnly ? '&unreadOnly=true' : ''}`);
    if (!Array.isArray(items)) throw new Error('Invalid feed');
    return NextResponse.json({ notifications: items }, { headers: { 'cache-control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Notification feed unavailable' }, { status: 503 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);

  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (req.headers.get('x-moneyverse-notification-action') !== '1' ||
      !req.headers.get('content-type')?.startsWith('application/json') ||
      (req.headers.get('sec-fetch-site') !== null && !['same-origin', 'none'].includes(req.headers.get('sec-fetch-site')!))) {
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll === true && notificationId === undefined) {
      const result = await mutate<number>('/api/v1/notifications/read-all');
      if (!Number.isSafeInteger(result) || result < 0) throw new Error('Invalid read-all response');
      return NextResponse.json({ updatedCount: result });
    }

    if (typeof notificationId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(notificationId) && markAll === undefined) {
      const result = await mutate<boolean>(`/api/v1/notifications/${notificationId}/read`);
      if (result !== true) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      return NextResponse.json({ read: true });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Notification update unavailable' }, { status: 503 });
  }
}
