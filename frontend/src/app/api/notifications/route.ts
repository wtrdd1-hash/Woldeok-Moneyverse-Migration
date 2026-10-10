import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<NextResponse> {
  const privateHeaders = { 'cache-control': 'private, no-store' };
  const viewer = await viewerOrUnknown();
  if (!viewer) return NextResponse.json({ error: 'Session unavailable' }, { status: 503, headers: privateHeaders });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: privateHeaders });

  const searchParams = new URL(req.url).searchParams;
  const requested = Number(searchParams.get('limit') ?? '50');
  const limit = Number.isSafeInteger(requested) ? Math.max(1, Math.min(100, requested)) : 50;
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  try {
    const notifications = await api<unknown>(`/api/v1/notifications?limit=${limit}${unreadOnly ? '&unreadOnly=true' : ''}`);
    if (!Array.isArray(notifications)) throw new Error('Invalid notification payload');
    return NextResponse.json({ notifications }, { headers: privateHeaders });
  } catch (error) {
    const status = error instanceof ApiError && [401, 403, 429].includes(error.status) ? error.status : 503;
    return NextResponse.json({ error: 'Notification service unavailable' }, { status, headers: privateHeaders });
  }
}

/** Legacy browser POST is retired: writes require a CSRF-protected server action. */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Use the authenticated notification action' },
    { status: 405, headers: { allow: 'GET', 'cache-control': 'private, no-store' } },
  );
}
