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
 * The viewer, resolved after hydration with a localStorage fallback applied in
 * the mount effect. The first render must equal the server HTML (no viewer):
 * reading the cache in the state initializer made cached public pages render
 * signed-in markup during hydration (React #418), and React then re-rendered
 * the whole root on the client, which costs more than one frame of guest UI.
 */
export function useViewer(): Viewer | null {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Apply the cached viewer right after mount, before the network answer.
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
