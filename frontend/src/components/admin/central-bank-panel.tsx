'use client';

import { Landmark, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** Historical in-memory central bank counters are NOT sovereign monetary statements. */
export function CentralBankPanel() {
  return (
    <section className="space-y-4" aria-label="중앙은행 정책 상태">
      <div className="flex items-center gap-2">
        <Landmark className="size-5 text-primary" />
        <h2 className="text-xl font-bold">국가중앙은행 (Central Bank)</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="size-5" />독립 원장 검증 전 — 금융정책 공시 보류</CardTitle>
          <CardDescription>
            M0·M1·M2, 기준금리 및 지급준비율을 입증하는 영속 정책·정산 증거가 없습니다.
            기존 메모리 기반 숫자와 금리 변경/가상 조폐 승인 UI를 실제 금융 집행으로 표시하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          현재 상태: UNVERIFIED / 쓰기 기능 일시 중단. 자세한 정책·대사 상태는 관리자 경제 관제의 통화정책 증거에서 확인하십시오.
        </CardContent>
      </Card>
    </section>
  );
}
