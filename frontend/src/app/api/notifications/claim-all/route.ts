import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';
const noStore = { 'cache-control': 'private, no-store' };

/** A notification is not a reward ledger entry; never manufacture a claim receipt. */
export async function POST(request: Request): Promise<NextResponse> {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
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
