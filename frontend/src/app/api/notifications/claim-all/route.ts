import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Obsolete claim-all only marked notifications as read, not awarded rewards. */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Notification reward claims are unavailable via this endpoint' },
    { status: 410, headers: { 'cache-control': 'private, no-store' } },
  );
}
