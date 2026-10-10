import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store' };

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer) {
    return NextResponse.json({ error: 'Session unavailable' }, { status: 503, headers: privateHeaders });
  }
  if (!viewer.signedIn) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: privateHeaders });
  }
  try {
    const result = await api<unknown>('/api/v1/notifications/unread-count');
    if (!result || typeof result !== 'object' || !('unreadCount' in result)
      || typeof result.unreadCount !== 'number' || !Number.isSafeInteger(result.unreadCount)
      || result.unreadCount < 0) {
      throw new Error('Invalid unread-count response');
    }
    return NextResponse.json({ unreadCount: result.unreadCount }, { headers: privateHeaders });
  } catch (error) {
    const status = error instanceof ApiError && [401, 403, 429].includes(error.status) ? error.status : 503;
    return NextResponse.json({ error: 'Unread count unavailable' }, { status, headers: privateHeaders });
  }
}
