'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const EXEMPT_PATHS = ['/login', '/terms', '/privacy'];

/**
 * Ensures signed-in users who have not yet consented to the latest policy
 * cannot navigate away to other pages without completing consent.
 */
export function ConsentGuard({
  signedIn,
  consentCurrent,
}: {
  readonly signedIn: boolean;
  readonly consentCurrent: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If not signed in or already consented, do nothing
    if (!signedIn || consentCurrent) return;

    // Allow terms, privacy documents, and login page itself
    const isExempt = EXEMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
    if (isExempt) return;

    // Immediately redirect back to consent page
    toast.error('서비스 이용을 위해 이용약관 및 개인정보처리방침 동의가 필요합니다.');
    router.replace('/login?error=consent_required');
  }, [signedIn, consentCurrent, pathname, router]);

  return null;
}
