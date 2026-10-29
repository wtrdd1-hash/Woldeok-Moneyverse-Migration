'use client';

import { Coins, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface MintBatchItem {
  id: string;
  batchNumber: string;
  amountWld: string;
  denomination: string;
  productionCostWld: string;
  seigniorageWld: string;
  status: 'PENDING_CENTRAL_BANK_ACCEPTANCE' | 'ACCEPTED_BY_CENTRAL_BANK' | 'REJECTED';
  mintReason: string;
  verificationHash: string;
  createdAt: string;
}

/** No production financial status may be inferred from canned in-memory batches. */
export function NationalMintPanel() {
  return (
    <section className="space-y-4" aria-label="조폐국 검증 상태">
      <div className="flex items-center gap-2">
        <Coins className="size-5 text-primary" />
        <h2 className="text-xl font-bold">국가조폐국 (National Mint Bureau)</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="size-5" />정식 발행 증명서를 검증할 때까지 조폐 기능 보류</CardTitle>
          <CardDescription>
            서버 메모리에 저장된 시험용 발행 배치, 주조차익, 소각 증명서는 실제 WLD 발행 또는 폐기를 증명하지 않습니다.
            통화정책 승인서·정식 발행/폐기 인증서·복식원장의 원자적 정산이 검증되기 전까지 표시와 조작을 중단합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          현재 상태: UNVERIFIED / 발행·폐기 요청 불가. 관리자 통화정책 증명서 목록은 별도 DB 기반 화면에서 조회할 수 있습니다.
        </CardContent>
      </Card>
    </section>
  );
}
