'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ConsentStepUpModal } from './consent-step-up-modal';


interface ConsentGuardProps {
  readonly signedIn: boolean;
  readonly consentCurrent: boolean;
  readonly termsVersion?: string;
  readonly privacyVersion?: string;
}

const EXEMPT_PATHS = [
  '/login',
  '/terms',
  '/privacy',
  '/data-deletion',
  '/account-deletion',
  '/safety',
  '/safety/takedown',
  '/robots.txt',
  '/sitemap.xml',
  '/api/og',
  '/icon.svg',
  '/apple-icon.png',
  '/frontend-version',
  '/api/health',
];

/**
 * Ensures signed-in users who have not yet consented to the latest policy
 * are presented with an elegant, in-place step-up consent modal rather than
 * being abruptly redirected away and crashing the client router.
 */
export function ConsentGuard({
  signedIn,
  consentCurrent,
  termsVersion,
  privacyVersion,
}: ConsentGuardProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR-client hydration mismatch flicker
  if (!mounted) return null;

  // If not signed in, already consented, or dismissed in this session, do nothing
  if (!signedIn || consentCurrent || dismissed) return null;

  // Allow terms, privacy documents, and public safety/SEO paths without modal overlay
  const isExempt = EXEMPT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (isExempt) return null;

  return (
    <ConsentStepUpModal
      termsVersion={termsVersion}
      privacyVersion={privacyVersion}
      onSuccess={() => setDismissed(true)}
    />
  );
}
