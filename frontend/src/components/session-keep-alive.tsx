'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Silent Background Session Keep-Alive Component
 *
 * Prevents unexpected logouts and session timeouts by periodically pinging
 * session endpoints and touching the admin session while the browser tab is open.
 */
export function SessionKeepAlive() {
  const pathname = usePathname();
  const lastTouchRef = useRef<number>(Date.now());

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    const performKeepAlive = async () => {
      lastTouchRef.current = Date.now();
      try {
        // 1. Silent touch for member session & CSRF refresh
        await fetch('/api/v1/auth/session', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }).catch(() => {
          /* ignore network blips */
        });

        // 2. If viewing admin surfaces, touch the admin session idle lock
        if (pathname?.startsWith('/admin')) {
          await fetch('/api/v1/admin/security', {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          }).catch(() => {
            /* ignore network blips */
          });
        }
      } catch {
        /* fail silently */
      }
    };

    // Keep-alive every 3 minutes (180,000ms)
    timerId = setInterval(performKeepAlive, 180_000);

    // Also touch when user returns to this tab or window after inactivity (>60s)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastTouchRef.current > 60_000) {
        performKeepAlive();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [pathname]);

  return null;
}
