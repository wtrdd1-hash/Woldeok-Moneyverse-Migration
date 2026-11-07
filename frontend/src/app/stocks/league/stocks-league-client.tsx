'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trophy, RefreshCw, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyStockLeague, type VerifiedLeague } from './league-evidence';

type LeagueState = { readonly kind: 'loading' } | { readonly kind: 'error' } | { readonly kind: 'verified'; readonly data: VerifiedLeague };

export function StocksLeagueClient() {
  const [state, setState] = useState<LeagueState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setState({ kind: 'loading' }); setAttempt((value) => value + 1); }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch('/api/stocks/league', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
        if (!response.ok) throw new Error('League API unavailable');
        const verified = verifyStockLeague(await response.json());
        if (!verified) throw new Error('League API returned unverified evidence');
        if (!controller.signal.aborted) setState({ kind: 'verified', data: verified });
      } catch {
        if (!controller.signal.aborted) setState({ kind: 'error' });
      }
    };
    void load();
    return () => controller.abort();
  }, [attempt]);

  return <div className="grid gap-5" data-page="stocks-league">
    <div role="status" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed">
      <ShieldAlert aria-hidden="true" className="mr-2 inline-block size-4" />
      카피 트레이딩은 현재 이용할 수 없습니다. WLD 예산 예약과 거래 정산을 검증할 수 없어 구독·자동 매매를 제공하지 않습니다. 아래 순위는 서버 조회 시점의 가상 리그 기록이며 실시간 수익을 보장하지 않습니다.
    </div>
    {state.kind === 'loading' ? <p role="status" aria-live="polite" className="py-8 text-center text-sm text-muted-foreground">리그 기록을 확인하는 중입니다…</p> : null}
    {state.kind === 'error' ? <div role="alert" className="grid justify-items-start gap-3 rounded-xl border border-destructive/40 p-5">
      <p>리그 정보를 검증할 수 없습니다. 임의 순위나 수익률을 표시하지 않습니다.</p>
      <Button type="button" variant="outline" className="min-h-11" onClick={retry}><RefreshCw aria-hidden="true" className="mr-2 size-4" />다시 조회</Button>
    </div> : null}
    {state.kind === 'verified' && state.data.season === null ? <p role="status" className="rounded-xl border p-6 text-sm text-muted-foreground">현재 진행 중인 리그가 없습니다. 확인되지 않은 순위는 표시하지 않습니다.</p> : null}
    {state.kind === 'verified' && state.data.season !== null ? <section aria-labelledby="league-heading" className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="league-heading" className="text-lg font-semibold"><Trophy aria-hidden="true" className="mr-2 inline-block size-5" />{state.data.season.title}</h2>
        <Badge variant="outline">서버 기록 · {state.data.whales.length}명 조회</Badge>
      </div>
      {state.data.whales.length === 0 ? <p role="status" className="rounded-xl border p-6 text-sm text-muted-foreground">현재 조회된 리그 고래 트레이더가 없습니다.</p> : <div className="grid gap-3 sm:grid-cols-2">
        {state.data.whales.map((whale) => <Card key={whale.id}>
          <CardHeader className="gap-2"><CardTitle className="break-words text-base">{whale.userName}</CardTitle><Badge variant="outline" className="w-fit">{whale.tier} · {whale.rankPosition > 0 ? `${whale.rankPosition}위` : '순위 미확정'}</Badge></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>서버 기록 수익률: <strong>{whale.roiRate.toLocaleString('ko-KR')}%</strong></p>
            <p>현재 평가액: <strong>{whale.currentAsset.toLocaleString('ko-KR')} WLD</strong></p>
            <p>서버 기록 팔로워: {whale.followerCount.toLocaleString('ko-KR')}명</p>
          </CardContent>
        </Card>)}
      </div>}
    </section> : null}
  </div>;
}
