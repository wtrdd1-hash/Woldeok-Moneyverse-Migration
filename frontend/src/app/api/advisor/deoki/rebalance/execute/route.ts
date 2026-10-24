import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

/** No ledger-backed, idempotent execution contract exists for this route. */
export async function POST(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  return NextResponse.json(
    { success: false, error: 'Automatic rebalancing is unavailable until server-verified orders and ledger receipts exist. No trades were made.' },
    { status: 503, headers },
  );
}
