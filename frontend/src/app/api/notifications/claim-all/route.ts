import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';
const noStore = { 'cache-control': 'private, no-store' };

/** A notification is not a reward ledger entry; never manufacture a claim receipt. */
export async function POST(): Promise<NextResponse> {
  let viewer: Awaited<ReturnType<typeof viewerOrUnknown>>;
  try {
    viewer = await viewerOrUnknown();
  } catch {
    return NextResponse.json({ error: 'Authentication status unavailable' }, { status: 503, headers: noStore });
  }
  if (!viewer) return NextResponse.json({ error: 'Authentication status unavailable' }, { status: 503, headers: noStore });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  return NextResponse.json(
    { error: 'Reward claim unavailable until ledger-backed settlement exists; no changes were made.' },
    { status: 409, headers: noStore },
  );
}
