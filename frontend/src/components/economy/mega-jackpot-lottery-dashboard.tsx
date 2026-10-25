'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock, ShieldCheck, Ticket, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatLotteryWld, parseLotteryRounds } from './lottery-rounds';
import type { PublicLotteryRound } from './lottery-rounds';

type RoundState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error' }
  | { readonly kind: 'ready'; readonly rounds: PublicLotteryRound[] };

function displayDate(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const STATUS: Record<PublicLotteryRound['status'], string> = {
  OPEN: '접수 중(기록상)',
  DRAWING: '추첨 처리 중',
  SETTLED: '정산 기록',
};

export function MegaJackpotLotteryDashboard() {
  const [state, setState] = useState<RoundState>({ kind: 'loading' });
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((previous) => previous + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    void (async () => {
      try {
        const response = await fetch('/api/lottery/rounds', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('lottery rounds unavailable');
        const rounds = parseLotteryRounds(await response.json());
        if (!controller.signal.aborted) setState({ kind: 'ready', rounds });
      } catch {
        if (!controller.signal.aborted) setState({ kind: 'error' });
      }
    })();
    return () => controller.abort();
  }, [reload]);

  return (
    <Card className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0A0D18] text-zinc-100">
      <CardHeader className="space-y-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Ticket aria-hidden="true" className="size-5 text-amber-400" />
          <CardTitle className="text-lg">국고 연동 복권 — 실제 회차 기록</CardTitle>
        </div>
        <CardDescription>
          데이터베이스에서 확인된 공개 회차만 표시합니다. 기록상 잭팟 풀은 실제 지급·소각·당첨 확정 증빙이 아닙니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="border-amber-500/40 text-amber-300">읽기 전용 · 구매 불가</Badge>
          <Button type="button" variant="outline" size="sm" onClick={refresh} aria-label="복권 회차 다시 조회">
            <RefreshCw aria-hidden="true" className="mr-2 size-4" /> 새로고침
          </Button>
        </div>
        {state.kind === 'loading' && <p role="status">서버에서 회차 기록을 확인하고 있습니다.</p>}
        {state.kind === 'error' && (
          <p role="alert" className="rounded-lg border border-rose-500/40 p-3 text-sm text-rose-200">
            회차 기록을 확인할 수 없습니다. 구매나 지급이 처리되었다고 표시하지 않습니다.
          </p>
        )}
        {state.kind === 'ready' && state.rounds.length === 0 && (
          <p role="status">서버에 확인된 공개 복권 회차가 없습니다.</p>
        )}
        {state.kind === 'ready' && state.rounds.length > 0 && (
          <div className="space-y-3" role="list" aria-label="서버 확인 복권 회차">
            {state.rounds.map((round) => (
              <section role="listitem" key={round.roundNumber} className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-amber-300">제 {round.roundNumber}회</h3>
                  <Badge variant="outline">{STATUS[round.status]}</Badge>
                </div>
                <p className="flex items-center gap-2 text-sm text-zinc-300">
                  <Clock aria-hidden="true" className="size-4" /> 기록된 추첨 예정 시각: {displayDate(round.drawsAt)} (KST)
                </p>
                <p className="text-sm">기록상 잭팟 풀: <strong className="font-mono">{formatLotteryWld(round.jackpotPoolWld)} WLD</strong></p>
                <p className="text-xs text-zinc-400">기록상 복권 가격: {formatLotteryWld(round.ticketPriceWld)} WLD · 발행 기록: {round.totalTicketsSold.toLocaleString('ko-KR')}장</p>
                {round.status === 'SETTLED' && round.winningNumbers && round.settledAt && (
                  <p className="text-sm">
                    정산 기록 번호: <strong>{round.winningNumbers.join(', ')}</strong>
                    <span className="block text-xs text-zinc-400">정산 기록 시각: {displayDate(round.settledAt)} (KST)</span>
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
        <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-400">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          실제 WLD 원장 정산 및 구매·추첨 공정성 증명이 검증되기 전에는 구매·보상 기능을 제공하지 않습니다.
        </p>
      </CardContent>
    </Card>
  );
}
