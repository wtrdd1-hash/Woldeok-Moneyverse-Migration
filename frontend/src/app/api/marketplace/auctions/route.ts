import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { parseVerifiedAuctions } from '@/app/marketplace/auction-evidence';

export const dynamic = 'force-dynamic';
const privateHeaders = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
  'referrer-policy': 'no-referrer',
};

export async function GET(): Promise<NextResponse> {
  try {
    const source = await api<unknown>('/api/v1/marketplace/auctions');
    const auctions = parseVerifiedAuctions(source);
    if (auctions === null) throw new Error('auction evidence invalid');
    return NextResponse.json(auctions, { headers: privateHeaders });
  } catch (error) {
    const status = error instanceof ApiError && (error.status === 401 || error.status === 403)
      ? error.status : 503;
    return NextResponse.json(
      { code: 'auction_source_unavailable', message: 'auction evidence unavailable' },
      { status, headers: privateHeaders },
    );
  }
}
