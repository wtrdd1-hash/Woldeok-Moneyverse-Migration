'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseVerifiedAdvisorResponse, type AdvisorDiagnosisView } from '@/lib/advisor-diagnosis';

const ASSETS = [
  { key: 'cash', label: '가상 현금' },
  { key: 'savings', label: '가상 예금' },
  { key: 'stocks', label: '가상 주식 평가액' },
  { key: 'bonds', label: '가상 채권 평가액' },
] as const;

export function AdvisorClient() {
  const [diagnosis, setDiagnosis] = useState<AdvisorDiagnosisView | null>(null);
  const [state, setState] = useState<'loading' | 'verified' | 'unavailable' | 'unauthenticated'>('loading');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    setDiagnosis(null);
    void (async () => {
      try {
        const response = await fetch('/api/advisor/deoki/diagnose', {
          signal: controller.signal, cache: 'no-store', credentials: 'same-origin',
        });
        if (controller.signal.aborted) return;
        if (response.status === 401 || response.status === 403) {
          setState('unauthenticated');
          return;
        }
        if (!response.ok) { setState('unavailable'); return; }
        const verified = parseVerifiedAdvisorResponse(await response.json());
        if (controller.signal.aborted) return;
        if (!verified) { setState('unavailable'); return; }
        setDiagnosis(verified);
        setState('verified');
      } catch {
        if (!controller.signal.aborted) setState('unavailable');
      }
    })();
    return () => controller.abort();
  }, [revision]);

  const retry = useCallback(() => setRevision((value) => value + 1), []);

  if (state !== 'verified' || !diagnosis) {
    return (
      <section aria-live="polite" role="status" className="rounded-xl border p-5 sm:p-7 space-y-4">
        <h2 className="text-lg font-semibold">포트폴리오 진단 증빙 확인 불가</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {state === 'loading' ? '회원별 진단 원천과 영수증을 확인하고 있습니다.' :
            state === 'unauthenticated' ? '진단은 본인 인증 및 동의가 완료된 회원에게만 제공됩니다.' :
              '검증된 자산 분석 자료가 없어 점수·평가액·수익률·자동 체결 내역을 표시하지 않습니다.'}
        </p>
        {state === 'unauthenticated' ? (
          <Link className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm" href="/login">로그인하기</Link>
        ) : state === 'unavailable' ? (
          <Button type="button" className="min-h-11" onClick={retry}>다시 확인</Button>
        ) : null}
      </section>
    );
  }

  return (
    <section aria-label="검증된 가상 자산 진단" className="space-y-5">
      <div className="rounded-lg border bg-muted/40 p-4 text-sm" role="status">
        마지막 진단 영수증 시각: <time dateTime={diagnosis.createdAt}>{new Date(diagnosis.createdAt).toLocaleString('ko-KR')}</time>.
        현재 시세나 실시간 잔액을 보장하지 않습니다.
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">가상 자산 합계</CardTitle></CardHeader>
          <CardContent className="text-xl font-semibold tabular-nums">{diagnosis.assetSummary.total.toLocaleString('ko-KR')} WLD</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">규칙 기반 위험 점수</CardTitle></CardHeader>
          <CardContent className="text-xl font-semibold tabular-nums">{diagnosis.prIndex} / 100</CardContent>
        </Card>
      </div>
      <h2 className="text-lg font-semibold">마지막 진단 기준 자산 구성</h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ASSETS.map(({ key, label }) => (
          <div key={key} className="rounded-lg border p-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-semibold tabular-nums">{diagnosis.assetSummary[key].toLocaleString('ko-KR')} WLD</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">본 화면은 읽기 전용입니다. 자동 리밸런싱과 체결 영수증 발행은 검증된 원장 연계 전까지 제공하지 않습니다.</p>
      <Button type="button" variant="outline" className="min-h-11" onClick={retry}>진단 다시 확인</Button>
      <Link className="inline-flex min-h-11 items-center px-4 text-sm underline underline-offset-4" href="/wallet">내 지갑 보기</Link>
    </section>
  );
}
