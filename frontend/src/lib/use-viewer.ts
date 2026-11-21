'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Viewer } from './viewer-state';

const VIEWER_STORAGE_KEY = 'moneyverse_cached_viewer';

function readCachedViewer(): Viewer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(VIEWER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Viewer;
    if (parsed && typeof parsed === 'object' && parsed.signedIn) {
      return parsed;
    }
  } catch {
    /* ignore storage error */
  }
  return null;
}

/**
 * The viewer, resolved after hydration with instant localStorage fallback
 * so hard refreshes (F5/Ctrl+F5) immediately preserve the signed-in state
 * without any UI flicker or loss of profile information.
 */
export function useViewer(): Viewer | null {
  const [viewer, setViewer] = useState<Viewer | null>(readCachedViewer);
  const pathname = usePathname();

  useEffect(() => {
    // If state was empty on initial SSR pass, hydrate immediately from local cache
    const initialCache = readCachedViewer();
    if (initialCache && (!viewer || !viewer.signedIn)) {
      setViewer(initialCache);
    }

    let cancelled = false;
    void fetch('/api/viewer', { cache: 'no-store', credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: Viewer | null) => {
        if (cancelled) return;
        if (value) {
          setViewer(value);
          if (value.signedIn) {
            try {
              localStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(value));
            } catch {
              /* ignore storage write error */
            }
          } else {
            // Explicitly signed out from server
            try {
              localStorage.removeItem(VIEWER_STORAGE_KEY);
            } catch {
              /* ignore storage delete error */
            }
          }
        }
      })
      .catch(() => undefined);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VIEWER_STORAGE_KEY) {
        setViewer(readCachedViewer());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  return viewer;
}
