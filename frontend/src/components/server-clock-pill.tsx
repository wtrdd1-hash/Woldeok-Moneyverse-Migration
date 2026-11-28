'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocale } from '@/components/locale-provider';
import { gameWeekLabel, gameYearLabel, parseGameClock, type GameClock } from '@/lib/game-calendar';

// GAMEYEAR.4: the year and day-of-year come from the API (365 server days per year). The Korean
// sentence keeps the existing product copy and appends the year rule from the approved spec.
const TITLE: Record<string, string> = {
  en: '10 real minutes = 1 server day · 7 server days = 1 week · 365 server days = 1 year',
  ko: '현실 10분 = 서버 1일, 서버 7일 = 1주, 서버 365일 = 1년',
  ja: '現実の10分 = サーバー1日、7日 = 1週、365日 = 1年',
  zh: '现实10分钟 = 服务器1天，7天 = 1周，365天 = 1年',
  vi: '10 phút thực = 1 ngày máy chủ · 7 ngày = 1 tuần · 365 ngày = 1 năm',
};

/** Year text, or null when the API did not certify a year (the week is still shown). */
export function serverClockText(locale: string, clock: GameClock): { readonly year: string | null; readonly week: string } {
  return {
    year: clock.year ? gameYearLabel(locale, clock.year, true) : null,
    week: gameWeekLabel(locale, clock.weekIndex + 1, clock.dayOfWeek),
  };
}

export function ServerClockPill({ className }: { readonly className?: string }) {
  const { locale } = useLocale();
  const [clock, setClock] = useState<GameClock | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/app-api/v1/game-clock', { cache: 'no-store' });
      if (!response.ok) return;
      const next = parseGameClock(await response.json());
      if (next) setClock(next);
    } catch {
      // Time display is supplemental; navigation must stay usable offline.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!clock?.dayEndsAt) return;
    const delay = Math.max(1_000, Math.min(Date.parse(clock.dayEndsAt) - Date.now() + 1_000, 10 * 60_000));
    const timer = window.setTimeout(() => void refresh(), delay);
    return () => window.clearTimeout(timer);
  }, [clock?.dayEndsAt, refresh]);

  if (!clock) return null;
  const text = serverClockText(locale, clock);

  return (
    <div
      className={cn(
        'inline-flex min-h-9 items-center gap-2 rounded-xl border bg-muted/45 px-2.5 text-[11px] font-bold text-muted-foreground',
        className,
      )}
      title={TITLE[locale] ?? TITLE.en}
      data-testid="server-clock"
    >
      <Clock3 className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
      {/* Wraps instead of overflowing in narrow places (mobile menu sheet at 320 px, browser QA). */}
      <span className="text-center">
        {text.year ? <>{text.year} · </> : null}
        {text.week}
      </span>
    </div>
  );
}
