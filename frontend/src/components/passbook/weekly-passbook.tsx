'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDays, parseGameClock, passbookDate, weekDayOf, type GameClock } from '@/lib/game-calendar';
import { groupDigits } from '@/lib/money';
import type { WalletHistoryPage } from '@/app/wallet/activity/types';

interface DayColumn {
  readonly day: number;
  readonly dayKey: string;
  readonly entries: number;
  readonly incoming: bigint;
  readonly outgoing: bigint;
  readonly rewarded: boolean;
}

const REWARD_TYPE = 'MINT_TO_USER';

/** Pure: folds the member's ledger lines into the seven days of the current game week. */
export function weekColumns(clock: GameClock, history: WalletHistoryPage): readonly DayColumn[] {
  const columns = Array.from({ length: clock.gameDaysPerWeek }, (_, i) => ({
    day: i + 1,
    dayKey: addDays(clock.weekKey, i),
    entries: 0,
    incoming: 0n,
    outgoing: 0n,
    rewarded: false,
  }));
  for (const t of history.transactions) {
    const day = weekDayOf(clock, t.occurredAt);
    if (day === null) continue;
    const column = columns[day - 1]!;
    let net = 0n;
    try { net = BigInt(t.netAmount); } catch { continue; }
    column.entries += 1;
    if (net > 0n) column.incoming += net;
    if (net < 0n) column.outgoing -= net;
    if (t.type === REWARD_TYPE) column.rewarded = true;
  }
  return columns;
}

async function readJson(path: string): Promise<unknown> {
  const response = await fetch(path, { cache: 'no-store', credentials: 'same-origin' });
  return response.ok ? response.json() : null;
}

/**
 * This game week as one passbook page: seven dated columns from the server calendar, each
 * holding what the ledger recorded that game day. Read in the member's own browser (the home
 * page is cached for everyone); renders nothing without both the server clock and the
 * member's own ledger lines, never a guessed week.
 */
export function WeeklyPassbook() {
  const [state, setState] = useState<{ clock: GameClock; history: WalletHistoryPage } | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const [rawClock, rawHistory] = await Promise.all([
          readJson('/app-api/v1/game-clock'),
          readJson('/app-api/v1/wallet/activity?period=all&direction=all'),
        ]);
        const clock = parseGameClock(rawClock);
        const history = rawHistory as WalletHistoryPage | null;
        if (live && clock && history && Array.isArray(history.transactions)) setState({ clock, history });
      } catch {
        // A guest or an unreadable ledger simply shows no page.
      }
    })();
    return () => { live = false; };
  }, []);

  if (!state) return null;
  const { clock, history } = state;
  const columns = weekColumns(clock, history);
  const week = clock.weekIndex + 1;
  const last = addDays(clock.weekKey, clock.gameDaysPerWeek - 1);

  return (
    <section aria-labelledby="weekly-passbook-title" className="mv-leaf overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--mv-page-rule-strong)] px-4 py-3 sm:px-5">
        <h2 id="weekly-passbook-title" className="text-[15px] font-bold">
          이번 주 통장 <span className="mv-leaf-muted font-semibold">· {week.toLocaleString('ko-KR')}주차</span>
        </h2>
        <p className="mv-print mv-leaf-muted text-[12px]">
          {passbookDate(clock.weekKey)} – {passbookDate(last)}
        </p>
      </div>
      <ol className="grid grid-cols-7" aria-label={`${week}주차 게임 일별 기록`}>
        {columns.map((c) => {
          const today = c.day === clock.dayOfWeek;
          const future = c.day > clock.dayOfWeek;
          return (
            <li
              key={c.day}
              aria-current={today ? 'date' : undefined}
              className={[
                'flex min-h-[124px] flex-col items-center gap-1.5 border-r border-[var(--mv-page-rule)] px-1 py-3 text-center last:border-r-0',
                today ? 'bg-[var(--mv-page-2)]' : '',
                future ? 'opacity-45' : '',
              ].join(' ')}
            >
              <span className="text-[11px] font-semibold mv-leaf-muted">{c.day}일째</span>
              <span className={`mv-print text-[13px] ${today ? 'font-bold text-[var(--mv-seal)]' : 'font-medium'}`}>{passbookDate(c.dayKey).slice(3)}</span>
              {c.rewarded ? (
                <span className="mv-seal mt-1 size-9 text-[11px]" aria-label="보상 받음">받음</span>
              ) : (
                <span className="mt-1 size-9 rounded-full border border-dashed border-[var(--mv-page-rule-strong)]" aria-hidden />
              )}
              {c.entries > 0 ? (
                <span className="mv-print mt-auto text-[11px] leading-tight">
                  {c.incoming > 0n && <span className="block text-[var(--mv-rise-on-page)]">+{groupDigits(c.incoming.toString())}</span>}
                  {c.outgoing > 0n && <span className="block text-[var(--mv-fall-on-page)]">-{groupDigits(c.outgoing.toString())}</span>}
                  {c.incoming === 0n && c.outgoing === 0n && <span className="block mv-leaf-muted">{c.entries}건</span>}
                </span>
              ) : (
                <span className="mt-auto text-[11px] mv-leaf-muted">{future ? '' : '—'}</span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--mv-page-rule-strong)] px-4 py-2.5 text-[12px] sm:px-5">
        <span className="mv-leaf-muted">현실 10분이 게임 하루예요. 칸마다 그날 원장에 찍힌 금액이에요.</span>
        <Link href="/wallet/activity" prefetch={false} className="font-semibold text-[var(--mv-fall-on-page)] underline-offset-4 hover:underline">
          통장 전체 보기
        </Link>
      </div>
    </section>
  );
}
