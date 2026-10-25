import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'cache-control': 'private, no-store' };

export async function POST(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer?.signedIn) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: PRIVATE_HEADERS });
  }

  // The database-backed legacy handler writes attendance and ledger in separate
  // transactions. No WLD claim may be forwarded until an atomic receipt exists.
  return NextResponse.json({
    ok: false,
    code: 'ATTENDANCE_SETTLEMENT_UNVERIFIED',
    error: 'Attendance reward settlement is temporarily unavailable',
  }, { status: 503, headers: PRIVATE_HEADERS });
}
