'use client';

import { useEffect, useState } from 'react';

/**
 * How long ago something was observed, kept correct in the browser.
 *
 * Deliberately not computed on the server: this page is revalidated on a
 * timer, so a relative time rendered into the HTML would be as old as the
 * cached page and could say "방금 전" about a five-minute-old reading. The
 * absolute timestamp beside it comes from the server and does not move; this
 * is the part that has to.
 *
 * Renders nothing until it has mounted, so the server and the first client
 * paint agree.
 */
export function TimeAgo({ at }: { readonly at: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const moment = new Date(at);
    if (Number.isNaN(moment.valueOf())) return;

    const update = () => setLabel(relative(Date.now() - moment.getTime()));
    update();
    const timer = setInterval(update, 15_000);
    return () => clearInterval(timer);
  }, [at]);

  if (label === null) return null;
  return <span suppressHydrationWarning>{label}</span>;
}

function relative(elapsedMs: number): string {
  // A clock a little behind the server's would otherwise render "-3초 전".
  const seconds = Math.max(0, Math.round(elapsedMs / 1000));
  if (seconds < 45) return '방금 전';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.round(hours / 24)}일 전`;
}
