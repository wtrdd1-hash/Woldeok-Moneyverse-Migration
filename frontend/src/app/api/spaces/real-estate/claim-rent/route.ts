import { viewerOrUnknown } from '@/lib/viewer';
import { realEstateUnauthorized, realEstateUnavailable } from '../source-hold';

export async function POST() {
  const viewer = await viewerOrUnknown();
  if (!viewer?.signedIn) return realEstateUnauthorized();
  return realEstateUnavailable('settlement');
}
