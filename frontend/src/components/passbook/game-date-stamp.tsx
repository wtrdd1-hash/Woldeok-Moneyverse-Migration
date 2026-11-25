'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseGameClock, passbookDate, type GameClock } from '@/lib/game-calendar';
import { cn } from '@/lib/cn';

function remaining(endsAt: string, now: number): string {
  const ms = Math.max(0, Date.parse(endsAt) - now);
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * The passbook date column for the whole app: today's game date as a passbook printer would
 * print it, the week and day within it, and how long until the next game day. Reads the
 * server calendar (/api/v1/game-clock); shows nothing rather than a guessed date.
 */
export function GameDateStamp({ compact = false, className }: { readonly compact?: boolean; readonly className?: string }) {
  const [clock, setClock] = useState<GameClock | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/app-api/v1/game-clock', { cache: 'no-store' });
      if (!response.ok) return;
      const next = parseGameClock(await response.json());
      if (next) setClock(next);
    } catch {
      // The date is supplemental; navigation stays usable without it.
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!clock) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const roll = window.setTimeout(() => void refresh(), Math.max(1_000, Date.parse(clock.dayEndsAt) - Date.now() + 800));
    return () => { window.clearInterval(tick); window.clearTimeout(roll); };
  }, [clock, refresh]);

  if (!clock) return null;

  const week = clock.weekIndex + 1;
  const dayMs = clock.realSecondsPerDay * 1000;
  const elapsed = Math.min(1, Math.max(0, (now - Date.parse(clock.dayStartedAt)) / dayMs));
  const label = `게임 날짜 ${passbookDate(clock.dayKey)}, ${week}주차 ${clock.dayOfWeek}일째, 다음 날까지 ${remaining(clock.dayEndsAt, now)}`;

  if (compact) {
    return (
      <span
        className={cn('inline-flex h-11 shrink-0 flex-col items-center justify-center rounded-md border border-[var(--g1-gold-deep)] px-2 leading-none text-[var(--g1-gold)]', className)}
        aria-label={label}
        title="현실 10분 = 게임 1일, 게임 7일 = 1주"
      >
        <span className="mv-print text-[12px] font-medium">{passbookDate(clock.dayKey).slice(3)}</span>
        <span className="mt-1 text-[10px] font-semibold text-[var(--g1-muted)]">{clock.dayOfWeek}일째</span>
      </span>
    );
  }

  return (
    <div
      className={cn('flex h-11 items-stretch overflow-hidden rounded-md border border-[var(--g1-gold-deep)] text-[var(--g1-ink)]', className)}
      aria-label={label}
      title="현실 10분 = 게임 1일, 게임 7일 = 1주"
    >
      <span className="flex items-center bg-[var(--g1-gold)] px-2.5 text-[var(--g1-gold-ink)]">
        <span className="mv-print text-[13px] font-medium">{passbookDate(clock.dayKey)}</span>
      </span>
      <span className="flex flex-col justify-center gap-1 px-3">
        <span className="whitespace-nowrap text-[11px] font-semibold leading-none">
          {week.toLocaleString('ko-KR')}주차 · {clock.dayOfWeek}일째
        </span>
        <span className="flex items-center gap-2 leading-none">
          <span className="h-1 w-16 overflow-hidden rounded-full bg-[var(--g1-track)]" aria-hidden>
            <span className="block h-full bg-[var(--g1-gold)]" style={{ width: `${Math.round(elapsed * 100)}%` }} />
          </span>
          <span className="mv-print text-[11px] text-[var(--g1-muted)]">{remaining(clock.dayEndsAt, now)}</span>
        </span>
      </span>
    </div>
  );
}
