'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type FxSnapshot = {
  reserves: {
    currency: 'USD';
    currentRate: number;
    totalReservesUsd: number;
    isHalted: boolean;
    updatedAt: string;
  };
  history: Array<{
    id: string;
    rate: number;
    changePct: number;
    volumeUsd: number;
    interventionType: string;
    createdAt: string;
  }>;
};

type LoadState = 'loading' | 'ready' | 'unavailable';

export default function FxPortalPage() {
  const [state, setState] = useState<LoadState>('loading');
  const [snapshot, setSnapshot] = useState<FxSnapshot | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/fx/portal', {
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error('FX data unavailable');
        const result = (await response.json()) as { success?: boolean; data?: FxSnapshot };
        if (!result.success || !result.data) throw new Error('FX data unavailable');
        if (!controller.signal.aborted) {
          setSnapshot(result.data);
          setState('ready');
        }
      } catch {
        if (!controller.signal.aborted) {
          setSnapshot(null);
          setState('unavailable');
        }
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 text-slate-100">
      <header className="space-y-3">
        <span className="inline-block rounded-full border border-cyan-700 px-3 py-1 text-xs text-cyan-300">
          Moneyverse · 가상 외환시장 참고 정보
        </span>
        <h1 className="text-2xl font-bold sm:text-3xl">서울외환시장(FX) 현황</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          이 화면은 서비스 내부 가상 경제 데이터만 표시합니다. 실제 USD 환전,
          한국은행 공식 공시 또는 실물 외화 예금 서비스가 아닙니다.
        </p>
      </header>

      <section className="rounded-2xl border border-amber-700/70 bg-amber-950/30 p-5" aria-labelledby="fx-hold-title">
        <h2 id="fx-hold-title" className="text-lg font-semibold text-amber-200">환전·선물환 거래 중단</h2>
        <p className="mt-2 text-sm leading-6 text-amber-100">
          WLD 원장과 외환 잔고를 동시에 검증하는 안전한 정산 계약이 확인되지 않아
          신규 환전 및 선물환 체결을 제공하지 않습니다. 이 화면에서 잔액을 차감하거나
          거래를 성공으로 표시하지 않습니다.
        </p>
        <Link href="/wallet" className="mt-4 inline-flex min-h-[44px] items-center rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
          실제 WLD 지갑 거래 내역 확인
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5" aria-labelledby="fx-market-title">
        <h2 id="fx-market-title" className="text-lg font-semibold">가상 시장 기준환율</h2>
        <div role="status" aria-live="polite" className="mt-3 text-sm text-slate-300">
          {state === 'loading' && '서버에서 시장 정보를 확인하고 있습니다.'}
          {state === 'unavailable' && '서버에서 검증된 시장 정보를 가져오지 못했습니다. 환율과 잔액은 표시하지 않습니다.'}
          {state === 'ready' && snapshot && (
            <div className="space-y-2">
              <p className="text-2xl font-bold tabular-nums text-cyan-300">
                1 가상 USD = {snapshot.reserves.currentRate.toLocaleString('ko-KR', { maximumFractionDigits: 4 })} WLD
              </p>
              <p>자료 시각: <time dateTime={snapshot.reserves.updatedAt}>{new Date(snapshot.reserves.updatedAt).toLocaleString('ko-KR')}</time></p>
              <p>서버 시장 상태: {snapshot.reserves.isHalted ? '거래 정지' : '참고 시세 제공 중 · 실제 거래는 중단'}</p>
            </div>
          )}
        </div>
      </section>

      {state === 'ready' && snapshot && (
        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5" aria-labelledby="fx-history-title">
          <h2 id="fx-history-title" className="text-lg font-semibold">서버 확인 환율 기록</h2>
          {snapshot.history.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">확인된 환율 기록이 없습니다.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <caption className="sr-only">가상 외환시장 서버 기록: 시각, 기준환율, 등락률</caption>
                <thead><tr className="border-b border-slate-700 text-slate-300">
                  <th scope="col" className="p-3">시각</th>
                  <th scope="col" className="p-3">WLD / 가상 USD</th>
                  <th scope="col" className="p-3">등락률</th>
                </tr></thead>
                <tbody>{snapshot.history.slice(0, 12).map((point) => (
                  <tr key={point.id} className="border-b border-slate-800">
                    <td className="p-3"><time dateTime={point.createdAt}>{new Date(point.createdAt).toLocaleString('ko-KR')}</time></td>
                    <td className="p-3 tabular-nums">{point.rate.toLocaleString('ko-KR')}</td>
                    <td className="p-3 tabular-nums">{point.changePct.toFixed(2)}%</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
