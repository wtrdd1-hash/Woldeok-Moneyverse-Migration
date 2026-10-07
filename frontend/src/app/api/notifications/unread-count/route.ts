import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json(
      { unreadCount: 0 },
      { headers: { 'cache-control': 'private, no-store' } },
    );
  }

  const result = await apiOrNull<{ unreadCount: number }>('/api/v1/notifications/unread-count');

  return NextResponse.json(
    { unreadCount: result?.unreadCount ?? 0 },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}

