'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ClockPayload {
  readonly dayIndex?: string;
  readonly day_index?: string;
  readonly weekIndex?: string;
  readonly week_index?: string;
  readonly dayOfWeek?: number;
  readonly day_of_week?: number;
  readonly dayEndsAt?: string;
  readonly day_ends_at?: string;
}

interface ClockView {
  readonly day: number;
  readonly week: number;
  readonly dayOfWeek: number;
  readonly dayEndsAt: string | null;
}

function normalize(payload: ClockPayload): ClockView | null {
  const dayRaw = payload.dayIndex ?? payload.day_index;
  const weekRaw = payload.weekIndex ?? payload.week_index;
  const dayOfWeek = payload.dayOfWeek ?? payload.day_of_week;
  if (dayRaw === undefined || weekRaw === undefined || dayOfWeek === undefined) return null;
  const day = Number(dayRaw);
  const week = Number(weekRaw);
  if (!Number.isSafeInteger(day) || !Number.isSafeInteger(week) || !Number.isSafeInteger(dayOfWeek)) return null;
  return {
    day: day + 1,
    week: week + 1,
    dayOfWeek,
    dayEndsAt: payload.dayEndsAt ?? payload.day_ends_at ?? null,
  };
}

export function ServerClockPill({ className }: { readonly className?: string }) {
  const [clock, setClock] = useState<ClockView | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/app-api/v1/game-clock', { cache: 'no-store' });
      if (!response.ok) return;
      const next = normalize((await response.json()) as ClockPayload);
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

  return (
    <div
      className={cn(
        'inline-flex min-h-9 items-center gap-2 rounded-xl border bg-muted/45 px-2.5 text-[11px] font-bold text-muted-foreground',
        className,
      )}
      title="현실 10분 = 서버 1일, 서버 7일 = 1주"
    >
      <Clock3 className="size-3.5 text-primary" aria-hidden="true" />
      <span className="whitespace-nowrap">
        서버 {clock.day}일 · {clock.week}주차 {clock.dayOfWeek}일차
      </span>
    </div>
  );
}
