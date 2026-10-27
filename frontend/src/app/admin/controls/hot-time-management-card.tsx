'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import { parseHotTimeEvidence } from '@/lib/hot-time-evidence';
import type { HotTimePayload } from '@/components/live-hot-time-banner';

type State = { readonly status: 'loading' | 'unavailable' } | { readonly status: 'ready'; readonly data: HotTimePayload };

export function HotTimeManagementCard() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const request = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ status: 'loading' });
    try {
      const response = await fetch('/app-api/v1/economy/hot-time/active', {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('hot-time API unavailable');
      const data = parseHotTimeEvidence(await response.json() as unknown);
      if (!data) throw new Error('invalid hot-time API evidence');
      if (!controller.signal.aborted) setState({ status: 'ready', data });
    } catch {
      if (!controller.signal.aborted) setState({ status: 'unavailable' });
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => request.current?.abort();
  }, [refresh]);

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-md">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame aria-hidden="true" className="size-5 text-amber-500" />
            <CardTitle className="text-base font-extrabold">경제 핫타임 상태 조회</CardTitle>
          </div>
          <CardDescription className="mt-1 text-xs">
            서버에 등록된 활성 이벤트만 표시합니다. 실제 급여·수수료 적용 여부는 별도 검증이 필요합니다.
          </CardDescription>
        </div>
        {state.status === 'ready' && (
          <Badge variant="outline">확인된 활성 버프 {state.data.activeBuffs.length}개</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {state.status === 'loading' && <p role="status" className="text-sm">서버 상태를 확인하는 중입니다.</p>}
        {state.status === 'unavailable' && (
          <p role="alert" className="text-sm text-destructive">핫타임 상태를 확인할 수 없습니다. 서버 연결과 권한을 확인해 주세요.</p>
        )}
        {state.status === 'ready' && (
          <>
            <p role="status" className="text-xs text-muted-foreground">
              서버 조회 시각: <time dateTime={state.data.serverTime}>{state.data.serverTime}</time>
            </p>
            {state.data.activeBuffs.length === 0 ? (
              <p className="text-sm">서버에서 확인된 활성 버프가 없습니다.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {state.data.activeBuffs.map((buff) => (
                  <li key={buff.id} className="rounded-xl border p-3">
                    <p className="break-words text-sm font-semibold">{buff.title}</p>
                    <p className="text-xs text-muted-foreground">도메인: {buff.targetDomain} · 배율: {buff.multiplier}</p>
                    <p className="text-xs text-muted-foreground">종료: <time dateTime={buff.endsAt}>{buff.endsAt}</time></p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => void refresh()} disabled={state.status === 'loading'}>
            상태 다시 확인
          </Button>
          <p className="text-xs text-muted-foreground">변경 기능은 DB 최소권한·감사·재인증 검증 전까지 중지됩니다.</p>
        </div>
      </CardContent>
    </Card>
  );
}
