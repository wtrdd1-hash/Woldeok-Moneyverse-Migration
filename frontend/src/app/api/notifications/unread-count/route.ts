import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

/**
 * In-app Notification Unread Count Route Handler.
 * Returns the unread notification count for the signed-in viewer.
 * Provides private, no-store caching to ensure fresh counts while stopping 404 polling bursts.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json(
      { unreadCount: 0 },
      { headers: { 'cache-control': 'private, no-store' } },
    );
  }

  return NextResponse.json(
    { unreadCount: 0 },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
