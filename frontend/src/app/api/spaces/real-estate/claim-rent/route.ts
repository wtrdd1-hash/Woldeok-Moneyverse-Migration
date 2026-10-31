import { protectedLandmarkWrite } from '../source-unverified';

// A fabricated 4,990 WLD success response is not a payout receipt.
export async function POST() {
  return protectedLandmarkWrite('LANDMARK_RENT_LEDGER_UNVERIFIED');
}
