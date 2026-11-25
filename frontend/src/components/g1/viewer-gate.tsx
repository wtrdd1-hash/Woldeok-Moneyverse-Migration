'use client';

import type { ReactNode } from 'react';
import { useMountedViewer } from '@/components/use-mounted-viewer';

/**
 * Render children only once the viewer is known and matches. Before that the
 * slot is empty on purpose, so a member never sees guest copy flash and a
 * guest never sees a member action (QA GH-03, GH-04).
 */
export function GuestOnly({ children }: { readonly children: ReactNode }) {
  const viewer = useMountedViewer();
  return viewer && !viewer.signedIn ? <>{children}</> : null;
}

export function MemberOnly({ children, fallback = null }: { readonly children: ReactNode; readonly fallback?: ReactNode }) {
  const viewer = useMountedViewer();
  if (!viewer) return null;
  return viewer.signedIn ? <>{children}</> : <>{fallback}</>;
}
