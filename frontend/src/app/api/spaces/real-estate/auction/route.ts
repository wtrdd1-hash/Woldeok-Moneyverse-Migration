import { NextResponse } from 'next/server';

// Kept as a type for the dormant presentation component. Not an authoritative
// auction or an ownership/ledger contract.
export interface LandmarkAuction {
  id: string;
  name: string;
  district: string;
  districtBadge: string;
  currentHighestBid: number;
  minBidIncrement: number;
  leaderNickname: string;
  endTimestamp: number;
  totalShares: number;
  annualYieldRate: number;
  dailyRentPool: number;
  userBid: number;
  userShares: number;
  unclaimedRent: number;
  imageUrl: string;
  description: string;
}

/** No in-memory bids, owner shares or WLD receipts may be exposed as real. */
function releaseHold() {
  return NextResponse.json(
    { ok: false, error: '경매 기능은 원장 기반 입찰 및 소유권 검증 전까지 이용할 수 없습니다.' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } },
  );
}

export async function GET() { return releaseHold(); }
export async function POST(_request: Request) { return releaseHold(); }
