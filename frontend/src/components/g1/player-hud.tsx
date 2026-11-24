'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { groupDigits } from '@/lib/money';
import type { WalletSummary } from '@/lib/wallet-summary';
import { useMountedViewer } from '@/components/use-mounted-viewer';

/**
 * The G1 signature: the player HUD (real favicon medal, gold WLD counter).
 *
 * It shows only what the API proves for this caller. There is no level or XP
 * endpoint, so the mockup's level ring and XP bar are drawn as a plain gold
 * frame rather than a progress figure nobody computed. A member whose balance
 * could not be read is told so instead of shown zero.
 */
export function PlayerHud({ compact = false }: { readonly compact?: boolean }) {
  const viewer = useMountedViewer();
  const pathname = usePathname();
  const [summary, setSummary] = useState<WalletSummary | null>(null);

  useEffect(() => {
    if (!viewer?.signedIn) return;
    let cancelled = false;
    void fetch('/api/wallet/summary', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: WalletSummary | null) => {
        if (!cancelled) setSummary(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [viewer?.signedIn, pathname]);

  const medal = (
    <span className={`relative inline-block shrink-0 rounded-full ring-2 ring-[var(--g1-gold)] ${compact ? 'size-8' : 'size-11'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/favicon.ico" alt="" width={44} height={44} className="size-full rounded-full" />
    </span>
  );

  if (!viewer?.signedIn) {
    return (
      <Link
        href="/login"
        prefetch={false}
        className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--g1-gold-deep)] bg-[var(--g1-plum)] py-1 pl-1 pr-4 text-sm font-semibold text-[var(--g1-ink)] transition-transform duration-150 active:scale-[0.97]"
      >
        {medal}
        <span className="whitespace-nowrap">{compact ? '로그인' : '로그인하고 모험 시작'}</span>
      </Link>
    );
  }

  const amount = summary?.signedIn && summary.totalAvailableAmount !== null ? groupDigits(summary.totalAvailableAmount) : null;

  return (
    <Link
      href="/wallet"
      prefetch={false}
      aria-label={amount ? `내 지갑, ${amount} WLD` : '내 지갑'}
      className="flex min-h-11 items-center gap-3 rounded-full border border-[var(--g1-gold-deep)] bg-[var(--g1-plum)] py-1 pl-1 pr-4 transition-transform duration-150 active:scale-[0.97]"
    >
      {medal}
      {!compact && <span className="text-sm font-semibold text-[var(--g1-ink)]">내 캐릭터</span>}
      <span className="flex items-center gap-2" aria-live="polite">
        <span aria-hidden className="size-4 rounded-full bg-[radial-gradient(circle_at_35%_35%,var(--g1-moon),var(--g1-gold)_55%,var(--g1-gold-deep))]" />
        <span className="g1-num text-sm text-[var(--g1-gold)]">{amount ?? (summary ? '확인 불가' : '…')}</span>
        {!compact && <span className="text-xs text-[var(--g1-muted)]">WLD</span>}
      </span>
    </Link>
  );
}
