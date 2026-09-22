'use client';

import { usePathname } from 'next/navigation';
import { ConsentStepUpModal } from './consent-step-up-modal';

const EXEMPT_PATHS = ['/login', '/terms', '/privacy'];

/**
 * Ensures signed-in users who have not yet consented to the latest policy
 * are presented with an elegant, in-place step-up consent modal rather than
 * being abruptly redirected away and crashing the client router.
 */
export function ConsentGuard({
  signedIn,
  consentCurrent,
}: {
  readonly signedIn: boolean;
  readonly consentCurrent: boolean;
}) {
  const pathname = usePathname();

  // If not signed in or already consented, do nothing
  if (!signedIn || consentCurrent) return null;

  // Allow terms, privacy documents, and login page itself without modal overlay
  const isExempt = EXEMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isExempt) return null;

  return <ConsentStepUpModal />;
}
