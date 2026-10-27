import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';
const privateHeaders = { 'cache-control': 'private, no-store' };

export async function GET(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);

  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers: privateHeaders });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const limit = searchParams.get('limit') || '50';
  if (!/^[0-9]{1,3}$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) return NextResponse.json({ error: 'Invalid limit' }, { status: 400, headers: privateHeaders });

  try {
    const items = await api<unknown>(`/api/v1/notifications?limit=${limit}${unreadOnly ? '&unreadOnly=true' : ''}`);
    if (!Array.isArray(items)) throw new Error('Invalid feed');
    return NextResponse.json({ notifications: items }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: 'Notification feed unavailable' }, { status: 503, headers: privateHeaders });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);

  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers: privateHeaders });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders });

  if (req.headers.get('x-moneyverse-notification-action') !== '1' ||
      !req.headers.get('content-type')?.startsWith('application/json') ||
      (req.headers.get('sec-fetch-site') !== null && !['same-origin', 'none'].includes(req.headers.get('sec-fetch-site')!))) {
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403, headers: privateHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll === true && notificationId === undefined) {
      const receipt = await mutate<{ updatedCount: number; remainingUnreadCount: number }>(
        '/api/v1/notifications/read-all-receipt',
      );
      if (!Number.isSafeInteger(receipt?.updatedCount) || receipt.updatedCount < 0 ||
          !Number.isSafeInteger(receipt?.remainingUnreadCount) || receipt.remainingUnreadCount < 0) {
        throw new Error('Invalid read-all receipt');
      }
      return NextResponse.json(receipt, { headers: privateHeaders });
    }

    if (typeof notificationId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(notificationId) && markAll === undefined) {
      const result = await mutate<boolean>(`/api/v1/notifications/${notificationId}/read`);
      if (result !== true) return NextResponse.json({ error: 'Notification not found' }, { status: 404, headers: privateHeaders });
      return NextResponse.json({ read: true }, { headers: privateHeaders });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400, headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: 'Notification update unavailable' }, { status: 503, headers: privateHeaders });
  }
}
