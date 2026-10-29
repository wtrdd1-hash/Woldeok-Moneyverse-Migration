'use client';

import { useEffect, useState } from 'react';
import { Landmark, Percent, ShieldAlert, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CentralBankSnapshot {
  source: 'non_persistent_backend_preview';
  aggregates: {
    m0BaseMoneyWld: string;
    m1NarrowMoneyWld: string;
    m2BroadMoneyWld: string;
    moneyMultiplier: string;
  };
  policy: {
    ratePercent: string;
    taylorRuleEstimatedRate?: string;
  };
  reserve: {
    ratioPercent: string;
  };
  pendingBatches: Array<{
    id: string;
    batchNumber: string;
    amountWld: string;
    mintReason?: string;
  }>;
}

function displayAmount(value: string | undefined): string {
  if (!value || !/^\d+$/.test(value)) return '확인 불가';
  return new Intl.NumberFormat('ko-KR').format(BigInt(value)) + ' WLD';
}

export function CentralBankPanel() {
  const [snapshot, setSnapshot] = useState<CentralBankSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    void (async () => {
      try {
        const response = await fetch('/api/admin/central-bank/status', {
          cache: 'no-store',
          signal: abort.signal,
        });
        if (!response.ok) throw new Error('중앙은행 임시 API를 조회할 수 없습니다.');
        const value: CentralBankSnapshot = await response.json();
        if (value.source !== 'non_persistent_backend_preview') {
          throw new Error('중앙은행 데이터 출처를 검증할 수 없습니다.');
        }
        if (!abort.signal.aborted) setSnapshot(value);
      } catch {
        if (!abort.signal.aborted) setError('중앙은행 임시 데이터 조회 실패. 운영 원장 값은 확인되지 않았습니다.');
      }
    })();
    return () => abort.abort();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Landmark className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold tracking-tight">국가중앙은행 (Woldeok Central Bank)</h2>
          <Badge variant="outline">원장 연동 검증 대기</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          기준금리·조폐국 인수·지급준비율은 운영 원장에 영속 기록되고 검증된 경우에만 공식 적용됩니다.
        </p>
      </div>

      <div role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
        현재 중앙은행 API의 통화량·주조 배치·정책 값은 서버 메모리에 있는 임시 참고 데이터입니다.
        실제 금융 원장 수치나 승인 완료 기록이 아니며 서버 재시작 시 초기화될 수 있습니다.
        원장 정산 및 감사 기능 검증 전에는 화폐 인수와 정책 변경 버튼을 사용할 수 없습니다.
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-500/40 p-4 text-sm text-red-500">
          {error}
        </div>
      ) : !snapshot ? (
        <p role="status" className="text-sm text-muted-foreground">중앙은행 임시 API 조회 중...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['M0 (임시 주조 인수 추정)', displayAmount(snapshot.aggregates.m0BaseMoneyWld)],
              ['M1 (임시 계산 추정)', displayAmount(snapshot.aggregates.m1NarrowMoneyWld)],
              ['M2 (임시 계산 추정)', displayAmount(snapshot.aggregates.m2BroadMoneyWld)],
              ['통화 승수 (임시 추정)', snapshot.aggregates.moneyMultiplier + ' 배'],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold">{label}</CardDescription>
                  <CardTitle className="text-xl font-mono break-all">{value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                국가조폐국 주조 화폐 인수 승인
              </CardTitle>
              <CardDescription>임시 API의 인수 대기 목록이며 실제 발행·국고 반영 증빙이 아닙니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.pendingBatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  임시 API에 인수 대기 배치가 없습니다. 운영 원장의 대기 건수는 별도 확인이 필요합니다.
                </p>
              ) : snapshot.pendingBatches.map((batch) => (
                <div key={batch.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                  <div className="text-sm">
                    <p className="font-semibold">{batch.batchNumber}</p>
                    <p>{displayAmount(batch.amountWld)}</p>
                    <p className="text-xs text-muted-foreground">{batch.mintReason ?? '사유 확인 불가'}</p>
                  </div>
                  <Button disabled variant="outline" title="원장 정산 및 승인지급 증빙 검증 전에는 집행할 수 없습니다.">
                    공식 인수 보류
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Percent className="h-4 w-4 text-blue-600" />
                  국가 기준금리 (Base Interest Rate)
                </CardTitle>
                <CardDescription>서버의 비영속 참고값이며 공식 확정 공시가 아닙니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">현재 임시 기준금리</span>
                  <strong className="font-mono">{snapshot.policy.ratePercent}%</strong>
                </div>
                <Button variant="outline" disabled>기준금리 변경 공시 (원장 연동 대기)</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  시중 상업은행 지급준비율
                </CardTitle>
                <CardDescription>서버의 비영속 참고값이며 공식 규제 적용이 아닙니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">현재 임시 지급준비율</span>
                  <strong className="font-mono">{snapshot.reserve.ratioPercent}%</strong>
                </div>
                <Button variant="outline" disabled>지준율 규제 적용 (원장 연동 대기)</Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
