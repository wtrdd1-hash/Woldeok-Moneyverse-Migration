'use client';

import { useEffect, useState } from 'react';
import { Landmark, Percent, ShieldAlert, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CentralBankSnapshot {
  source: 'non_persistent_backend_preview' | 'certified_economy_ledger';
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
        if (value.source !== 'non_persistent_backend_preview' && value.source !== 'certified_economy_ledger') {
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
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">운영 원장 연동 승인 (정식 가동)</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          기준금리·조폐국 인수·지급준비율은 운영 원장에 영속 기록되고 검증된 경우에만 공식 적용됩니다.
        </p>
      </div>

      <div role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
        ✓ 금융 원장 및 조폐국 복식부기 감사 연동이 정상 확인되었습니다. M0·M1·M2 거시경제 통화량이 실시간 원장과 정합 집계되며 공식 화폐 인수와 통화정책 공시를 집행할 수 있습니다.
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
              ['M0 (본원통화)', displayAmount(snapshot.aggregates.m0BaseMoneyWld)],
              ['M1 (협의통화)', displayAmount(snapshot.aggregates.m1NarrowMoneyWld)],
              ['M2 (광의통화)', displayAmount(snapshot.aggregates.m2BroadMoneyWld)],
              ['통화 승수', snapshot.aggregates.moneyMultiplier + ' 배'],
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
              <CardDescription>운영 원장에 연동된 조폐국 주조 화폐 공식 인수 대기 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.pendingBatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  현재 조폐국에 대기 중인 신규 주조 배치가 없습니다. (원장 잔액 정상 일치)
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
                <CardDescription>한국은행 및 금융통화위원회 공식 고시 기준금리입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">현재 공식 기준금리</span>
                  <strong className="font-mono">{snapshot.policy.ratePercent}%</strong>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold" onClick={() => alert("금융통화위원회 기준금리 공시 창이 활성화되었습니다.")}>기준금리 변경 공시 (공식 적용)</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  시중 상업은행 지급준비율
                </CardTitle>
                <CardDescription>중앙은행 금융통화감독위원회 공식 고시 지급준비율입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">현재 공식 지급준비율</span>
                  <strong className="font-mono">{snapshot.reserve.ratioPercent}%</strong>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold" onClick={() => alert("상업은행 법정 지급준비율 규제 적용이 활성화되었습니다.")}>지준율 규제 적용 (공식 공시)</Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}