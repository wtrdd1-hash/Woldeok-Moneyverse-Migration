'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ActivityEvent {
  readonly eventId: string;
  readonly eventType: 'page_view' | 'page_dwell' | 'button_click' | 'form_submit';
  readonly path: string;
  readonly targetLabel?: string;
  readonly dwellTimeMs?: number;
  readonly sessionId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
}

const BATCH_FLUSH_INTERVAL_MS = 2000;
const RETRY_STORAGE_KEY = 'mv_activity_retry_v1';
const MAX_QUEUED_EVENTS = 200;

function eventId(): string {
  return crypto.randomUUID();
}

export function ActivityTracker() {
  const pathname = usePathname();
  // Query strings may contain member IDs, IP addresses, or other private filters.
  // Request middleware records the server route; client telemetry records pathname only.
  const currentPath = pathname;

  const pageEnteredAtRef = useRef<number>(Date.now());
  const activePathRef = useRef<string>(currentPath);
  const queueRef = useRef<ActivityEvent[]>([]);
  const sessionIdRef = useRef<string>('');
  const flushingRef = useRef(false);

  const persistQueue = useCallback(() => {
    try {
      localStorage.setItem(RETRY_STORAGE_KEY, JSON.stringify(queueRef.current.slice(-MAX_QUEUED_EVENTS)));
    } catch {
      // Storage can be disabled; the in-memory queue still retries while this page is alive.
    }
  }, []);

  // Generate or retrieve anonymous session id
  useEffect(() => {
    let sid = sessionStorage.getItem('mv_session_id');
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      try {
        sessionStorage.setItem('mv_session_id', sid);
      } catch {
        // storage disabled
      }
    }
    sessionIdRef.current = sid;
    try {
      const pending = JSON.parse(localStorage.getItem(RETRY_STORAGE_KEY) ?? '[]');
      if (Array.isArray(pending)) queueRef.current.push(...pending.slice(-MAX_QUEUED_EVENTS));
    } catch {
      // Ignore malformed or unavailable storage.
    }
  }, []);

  // Flush queued events
  const flushQueue = useCallback(async (useBeacon = false) => {
    if (queueRef.current.length === 0 || flushingRef.current) return;
    const batch = [...queueRef.current];
    const payload = JSON.stringify({ events: batch });

    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      // Keep the batch persisted even when accepted into the browser queue. A later retry is
      // safe because the server deduplicates each client event ID.
      if (!navigator.sendBeacon('/api/activity/events', blob)) persistQueue();
      else persistQueue();
      return;
    }

    flushingRef.current = true;
    try {
      const response = await fetch('/api/activity/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
      if (!response.ok) throw new Error(`activity delivery failed: ${response.status}`);
      const sentIds = new Set(batch.map((event) => event.eventId));
      queueRef.current = queueRef.current.filter((event) => !sentIds.has(event.eventId));
      persistQueue();
    } catch {
      persistQueue();
    } finally {
      flushingRef.current = false;
    }
  }, [persistQueue]);

  // 1. Track page view and dwell time on route change
  useEffect(() => {
    const prevPath = activePathRef.current;
    const now = Date.now();
    const dwellMs = Math.max(0, now - pageEnteredAtRef.current);

    // Record dwell time for previous page if valid
    if (prevPath && dwellMs > 100) {
      queueRef.current.push({
        eventId: eventId(),
        eventType: 'page_dwell',
        path: prevPath,
        dwellTimeMs: dwellMs,
        sessionId: sessionIdRef.current,
        createdAt: new Date().toISOString(),
      });
    }

    // Update to current page
    activePathRef.current = currentPath;
    pageEnteredAtRef.current = now;

    // Record page view
    queueRef.current.push({
      eventId: eventId(),
      eventType: 'page_view',
      path: currentPath,
      sessionId: sessionIdRef.current,
      metadata: {
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
      createdAt: new Date().toISOString(),
    });

    // Flush quickly
    flushQueue();
  }, [currentPath, flushQueue]);

  // 2. Global click listener for buttons and links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest clickable element (button, anchor, role="button", input[type="submit"])
      const clickable = target.closest<HTMLElement>(
        'button, a, [role="button"], input[type="submit"], input[type="button"]',
      );
      if (!clickable) return;

      let label =
        clickable.getAttribute('aria-label') ||
        clickable.getAttribute('title') ||
        clickable.getAttribute('name') ||
        clickable.innerText ||
        clickable.getAttribute('href') ||
        clickable.id ||
        clickable.tagName.toLowerCase();

      // Clean label
      label = label.replace(/\s+/g, ' ').trim().slice(0, 150);
      if (!label) return;

      queueRef.current.push({
        eventId: eventId(),
        eventType: 'button_click',
        path: activePathRef.current,
        targetLabel: label,
        sessionId: sessionIdRef.current,
        metadata: {
          tagName: clickable.tagName.toLowerCase(),
          id: clickable.id || undefined,
          href: clickable.getAttribute('href') || undefined,
        },
        createdAt: new Date().toISOString(),
      });

      // Flush if queue builds up
      if (queueRef.current.length >= 5) {
        flushQueue();
      }
    };

    document.addEventListener('click', handleClick, { passive: true, capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [flushQueue]);

  // 3. Page unload / visibility change listener for final dwell time flush
  useEffect(() => {
    const handleUnload = () => {
      const now = Date.now();
      const dwellMs = Math.max(0, now - pageEnteredAtRef.current);
      if (activePathRef.current && dwellMs > 100) {
        queueRef.current.push({
          eventId: eventId(),
          eventType: 'page_dwell',
          path: activePathRef.current,
          dwellTimeMs: dwellMs,
          sessionId: sessionIdRef.current,
          createdAt: new Date().toISOString(),
        });
      }
      flushQueue(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };

    window.addEventListener('pagehide', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => flushQueue(), BATCH_FLUSH_INTERVAL_MS);

    return () => {
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [flushQueue]);

  return null;
}
