'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { WalletSummary } from '@/lib/wallet-summary';
import { groupDigits } from '@/lib/money';

/**
 * The balance, on the landing page's glance panel.
 *
 * The panel used to say 로그인 후 확인 to everybody, including a member who
 * had just signed in — the page is statically generated, so the server had no
 * way to know. The figure is fetched after hydration instead.
 *
 * Three states, kept distinct on purpose: not known yet, signed out, and
 * signed in. A signed-in member whose balance could not be read is told so
 * rather than shown a zero, because an unreachable wallet and an empty one
 * are different facts.
 */
export function WalletGlance() {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/wallet/summary', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: WalletSummary | null) => {
        if (!cancelled && value) setSummary(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!summary || !summary.signedIn) return <>로그인 후 확인</>;

  if (summary.totalAvailableAmount === null) return <>잔액 확인 중</>;

  return (
    <span aria-live="polite" className="tabular">
      {groupDigits(summary.totalAvailableAmount)}
      <span className="ml-1 text-[0.85em] opacity-80">{summary.currency}</span>
    </span>
  );
}
