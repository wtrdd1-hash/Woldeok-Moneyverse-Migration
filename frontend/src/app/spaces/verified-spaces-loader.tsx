import { apiOrNull } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';
import { VerifiedSpacesPanel, type VerifiedSpace } from './verified-spaces-panel';

/** Read-only authenticated owner view; no WLD mutation or localStorage fallback. */
export async function VerifiedSpacesLoader() {
  if (!(await isLoggedInMember())) {
    return <VerifiedSpacesPanel state="guest" />;
  }
  const result = await apiOrNull<{ spaces: VerifiedSpace[] }>('/api/v1/spaces');
  if (!result || !Array.isArray(result.spaces) || result.spaces.some((space) =>
    !space || typeof space.id !== 'string' || typeof space.name !== 'string' ||
    typeof space.space_type !== 'string' || typeof space.privacy !== 'string')) {
    return <VerifiedSpacesPanel state="unavailable" />;
  }
  return <VerifiedSpacesPanel state="ready" spaces={result.spaces} />;
}
