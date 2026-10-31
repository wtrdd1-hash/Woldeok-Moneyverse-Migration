import { sourceUnavailable, protectedLandmarkWrite } from '../source-unverified';

// The previous process-local auction array could not establish ownership,
// bids, escrow, or WLD ledger settlement. Keep both methods fail-closed.
export async function GET() {
  return sourceUnavailable('LANDMARK_AUCTION_SOURCE_UNVERIFIED');
}

export async function POST(_request: Request) {
  return protectedLandmarkWrite('LANDMARK_AUCTION_SOURCE_UNVERIFIED');
}
