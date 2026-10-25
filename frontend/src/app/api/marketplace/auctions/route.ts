import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { parseAuctionListings } from '@/app/marketplace/auction-feed';

export const dynamic = 'force-dynamic';

const headers = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' };

/** Read-only same-origin gateway. The backend's session/consent guards remain authoritative. */
export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'Auction authentication unavailable' }, { status: 503, headers });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Login required' }, { status: 401, headers });

  try {
    const rows = await api<unknown>('/api/v1/marketplace/auctions');
    const auctions = parseAuctionListings(rows);
    return NextResponse.json({ auctions }, { headers });
  } catch {
    return NextResponse.json({ error: 'Verified auction listings unavailable' }, { status: 503, headers });
  }
}
