'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { groupDigits } from '@/lib/money';
import type { WalletSummary } from '@/lib/wallet-summary';
import { useMountedViewer } from '@/components/use-mounted-viewer';

/**
 * G2 signature (docs/design/game-ui-v2026.11.24.G2): the ledger status strip
 * on every page. Each cell shows only what its API returned — server clock,
 * today's rise/fall breadth from live quotes, the economy's base rate and the
 * member's own balance — and says "확인 불가" instead of guessing.
 */

interface Clock { readonly day: number; readonly week: number; readonly dayOfWeek: number }
interface Breadth { readonly rising: number; readonly falling: number }
type Cell<T> = { state: 'loading' } | { state: 'ok'; value: T } | { state: 'unavailable' };

const REFRESH_MS = 60_000;

function parseClock(json: unknown): Clock | null {
  const j = json as Record<string, unknown> | null;
  const day = Number(j?.dayIndex ?? j?.day_index);
  const week = Number(j?.weekIndex ?? j?.week_index);
  const dayOfWeek = Number(j?.dayOfWeek ?? j?.day_of_week);
  if (![day, week, dayOfWeek].every(Number.isSafeInteger)) return null;
  return { day: day + 1, week: week + 1, dayOfWeek };
}

function parseBreadth(json: unknown): Breadth | null {
  const stocks = (json as { stocks?: unknown } | null)?.stocks;
  if (!Array.isArray(stocks)) return null;
  let rising = 0;
  let falling = 0;
  for (const s of stocks as Array<Record<string, unknown>>) {
    const cur = String(s.current_price ?? '');
    const open = String(s.day_open_price ?? '');
    // Prices are integer strings; compare as BigInt, never Number().
    if (!/^\d+$/.test(cur) || !/^\d+$/.test(open)) continue;
    const diff = BigInt(cur) - BigInt(open);
    if (diff > 0n) rising += 1;
    else if (diff < 0n) falling += 1;
  }
  return { rising, falling };
}

function parseRate(json: unknown): string | null {
  const rate = (json as { baseInterestRatePct?: unknown } | null)?.baseInterestRatePct;
  return typeof rate === 'number' && Number.isFinite(rate) ? `${rate.toFixed(2)}%` : null;
}

async function load<T>(url: string, parse: (j: unknown) => T | null): Promise<Cell<T>> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { state: 'unavailable' };
    const value = parse(await res.json());
    return value === null ? { state: 'unavailable' } : { state: 'ok', value };
  } catch {
    return { state: 'unavailable' };
  }
}

function show<T>(cell: Cell<T>, render: (v: T) => React.ReactNode): React.ReactNode {
  if (cell.state === 'loading') return <span className="text-[var(--g1-faint)]">…</span>;
  if (cell.state === 'unavailable') return <span className="text-[var(--g1-faint)]">확인 불가</span>;
  return render(cell.value);
}

export function LedgerStrip() {
  const viewer = useMountedViewer();
  const pathname = usePathname();
  const [clock, setClock] = useState<Cell<Clock>>({ state: 'loading' });
  const [breadth, setBreadth] = useState<Cell<Breadth>>({ state: 'loading' });
  const [rate, setRate] = useState<Cell<string>>({ state: 'loading' });
  const [wallet, setWallet] = useState<Cell<string | null>>({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      void load('/app-api/v1/game-clock', parseClock).then((c) => !cancelled && setClock(c));
      void load('/app-api/v1/stocks', parseBreadth).then((c) => !cancelled && setBreadth(c));
      void load('/app-api/v1/economy/macro-pulse', parseRate).then((c) => !cancelled && setRate(c));
    };
    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!viewer?.signedIn) return;
    let cancelled = false;
    void load('/api/wallet/summary', (j) => {
      const s = j as WalletSummary | null;
      if (!s?.signedIn) return null;
      return s.totalAvailableAmount === null ? null : groupDigits(s.totalAvailableAmount);
    }).then((c) => !cancelled && setWallet(c));
    return () => {
      cancelled = true;
    };
  }, [viewer?.signedIn, pathname]);

  const cell = 'flex min-w-0 flex-col justify-center border-l border-[var(--g1-line)] px-4 py-1.5 first:border-l-0 lg:px-6';
  const label = 'truncate text-xs text-[var(--g1-faint)]';
  const value = 'truncate text-sm font-bold tabular-nums';

  return (
    <section
      aria-label="원장 상태"
      className="grid grid-cols-3 border-b border-[var(--g1-line)] bg-[var(--g1-night-2)] lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]"
    >
      <div className={cell}>
        <span className={label}>서버 시간, 현실 10분이 하루</span>
        <span className={value}>{show(clock, (c) => `D+${c.day}, ${c.week}주 ${c.dayOfWeek}일`)}</span>
      </div>
      <div className={`${cell} hidden lg:flex`}>
        <span className={label}>오늘 상승</span>
        <span className={`${value} text-[var(--g1-ember)]`}>{show(breadth, (b) => `${b.rising}종목`)}</span>
      </div>
      <div className={`${cell} hidden lg:flex`}>
        <span className={label}>오늘 하락</span>
        <span className={`${value} text-[var(--g1-rare-rare)]`}>{show(breadth, (b) => `${b.falling}종목`)}</span>
      </div>
      <div className={`${cell} lg:hidden`}>
        <span className={label}>상승/하락</span>
        <span className={value}>
          {show(breadth, (b) => (
            <>
              <span className="text-[var(--g1-ember)]">{b.rising}</span> / <span className="text-[var(--g1-rare-rare)]">{b.falling}</span>
            </>
          ))}
        </span>
      </div>
      <div className={`${cell} hidden lg:flex`}>
        <span className={label}>기준금리</span>
        <span className={value}>{show(rate, (r) => r)}</span>
      </div>
      <div className={cell}>
        <span className={label}>내 WLD</span>
        <span className={`${value} ${viewer?.signedIn ? 'text-[var(--g1-gold)]' : 'text-[var(--g1-muted)]'}`}>
          {viewer?.signedIn ? show(wallet, (w) => w ?? '확인 불가') : '로그인 필요'}
        </span>
      </div>
    </section>
  );
}
