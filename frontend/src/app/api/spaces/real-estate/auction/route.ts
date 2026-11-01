import { viewerOrUnknown } from '@/lib/viewer';
import { realEstateUnauthorized, realEstateUnavailable } from '../source-hold';

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

export async function GET() {
  return realEstateUnavailable('read');
}

export async function POST(_request: Request) {
  const viewer = await viewerOrUnknown();
  if (!viewer?.signedIn) return realEstateUnauthorized();
  return realEstateUnavailable('settlement');
}
