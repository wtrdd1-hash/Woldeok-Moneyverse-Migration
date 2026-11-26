'use client';

import { useCallback, useEffect, useState } from 'react';
import { gameWeekLabel, gameYearLabel, parseGameClock, passbookDate, type GameClock } from '@/lib/game-calendar';
import { useLocale } from '@/components/locale-provider';
import { cn } from '@/lib/cn';

function remaining(endsAt: string, now: number): string {
  const ms = Math.max(0, Date.parse(endsAt) - now);
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


const NEXT_DAY: Record<string, string> = { en: 'next day in', ja: '翌日まで', zh: '距下一天', vi: 'ngày mới sau' };
const TITLE: Record<string, string> = {
  // Korean keeps the existing sentence and appends the approved 365-day year rule (GAMEYEAR.4).
  ko: '현실 10분 = 게임 1일, 게임 7일 = 1주, 게임 365일 = 1년',
  en: '10 real minutes = 1 game day · 7 game days = 1 week · 365 game days = 1 year',
  ja: '現実の10分 = ゲーム内1日、7日 = 1週、365日 = 1年',
  zh: '现实10分钟 = 游戏1天，7天 = 1周，365天 = 1年',
  vi: '10 phút thực = 1 ngày trong game · 7 ngày = 1 tuần · 365 ngày = 1 năm',
};
const DAY_OF_YEAR: Record<string, (d: number) => string> = {
  en: (d) => `D${d}`, ko: (d) => `${d}일차`, ja: (d) => `${d}日目`, zh: (d) => `第${d}天`, vi: (d) => `Ngày ${d}`,
};
const DAY_OF_WEEK: Record<string, (d: number) => string> = {
  en: (d) => `Day ${d}/7`, ko: (d) => `${d}일째`, ja: (d) => `${d}日目`, zh: (d) => `第${d}天`, vi: (d) => `Ngày ${d}/7`,
};

/**
 * All text the stamp renders, in the reader's language. The year and day-of-year come from the
 * API only; without a certified year the stamp shows the week and never a guessed year.
 */
export function dateStampText(locale: string, clock: GameClock, now: number) {
  const l = locale in DAY_OF_YEAR ? locale : 'en';
  const week = gameWeekLabel(l, clock.weekIndex + 1, clock.dayOfWeek);
  const left = remaining(clock.dayEndsAt, now);
  const desktopLine = clock.year ? `${gameYearLabel(l, clock.year, true)} · ${week}` : week;
  const compactLine = clock.year ? DAY_OF_YEAR[l]!(clock.year.dayOfYear) : DAY_OF_WEEK[l]!(clock.dayOfWeek);
  const yearFull = clock.year ? gameYearLabel(l, clock.year) : null;
  const aria = l === 'ko'
    ? `게임 날짜 ${passbookDate(clock.dayKey)}, ${yearFull ? yearFull + ', ' : ''}${clock.weekIndex + 1}주차 ${clock.dayOfWeek}일째, 다음 날까지 ${left}`
    : `${passbookDate(clock.dayKey)}, ${yearFull ? yearFull + ', ' : ''}${week}, ${NEXT_DAY[l]} ${left}`;
  return { desktopLine, compactLine, aria, title: TITLE[l]! };
}

/**
 * The passbook date column for the whole app: today's game date as a passbook printer would
 * print it, the week and day within it, and how long until the next game day. Reads the
 * server calendar (/api/v1/game-clock); shows nothing rather than a guessed date.
 */
export function GameDateStamp({ compact = false, className }: { readonly compact?: boolean; readonly className?: string }) {
  const { locale } = useLocale();
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

  const text = dateStampText(locale, clock, now);
  const dayMs = clock.realSecondsPerDay * 1000;
  const elapsed = Math.min(1, Math.max(0, (now - Date.parse(clock.dayStartedAt)) / dayMs));

  if (compact) {
    return (
      <span
        className={cn('inline-flex h-11 shrink-0 flex-col items-center justify-center rounded-md border border-[var(--g1-gold-deep)] px-2 leading-none text-[var(--g1-gold)]', className)}
        aria-label={text.aria}
        title={text.title}
      >
        <span className="mv-print text-[12px] font-medium">{passbookDate(clock.dayKey).slice(3)}</span>
        <span className="mt-1 text-[10px] font-semibold text-[var(--g1-muted)]">{text.compactLine}</span>
      </span>
    );
  }

  // shrink-0: with the longer localised year line the stamp must not be squeezed by the page
  // title next to it (browser QA 1280 px); the title truncates instead.
  return (
    <div
      className={cn('flex h-11 shrink-0 items-stretch overflow-hidden rounded-md border border-[var(--g1-gold-deep)] text-[var(--g1-ink)]', className)}
      aria-label={text.aria}
      title={text.title}
    >
      <span className="flex items-center bg-[var(--g1-gold)] px-2.5 text-[var(--g1-gold-ink)]">
        <span className="mv-print whitespace-nowrap text-[13px] font-medium">{passbookDate(clock.dayKey)}</span>
      </span>
      <span className="flex flex-col justify-center gap-1 px-3">
        <span className="whitespace-nowrap text-[11px] font-semibold leading-none">
          {text.desktopLine}
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
