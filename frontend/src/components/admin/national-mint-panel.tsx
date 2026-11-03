'use client';

import { useEffect, useState } from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseMintStatusEvidence, type MintStatusEvidence } from './mint-status-evidence';

export function NationalMintPanel() {
  const [evidence, setEvidence] = useState<MintStatusEvidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/mint/status', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const body = response.ok ? await response.json() : null;
        if (!body || body.source !== 'persistent_monetary_policy') return null;
        return parseMintStatusEvidence(body);
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        setEvidence(result);
        setError(result === null);
      })
      .catch(() => { if (!controller.signal.aborted) { setEvidence(null); setError(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-4" aria-label="조폐국 검증 상태">
      <div className="flex items-center gap-2">
        <Coins className="size-5 text-primary" />
        <h2 className="text-xl font-bold">국가조폐국 (National Mint Bureau)</h2>
      </div>
      {loading && <p role="status" className="text-sm text-muted-foreground">정책 DB 및 발행 인증서 기록 확인 중...</p>}
      {error && <p role="alert" className="rounded-lg border border-red-500/40 p-4 text-sm">
        조폐국 공식 정책·증명서 조회가 실패했습니다. 실제 발행 상태로 인정하지 않습니다.
      </p>}
      {evidence && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">정책 DB 조회 완료</CardTitle>
              <CardDescription>
                운영 통화정책 DB에서 조회한 정책 상태와 발행·폐기 증명서 기록 수입니다.
                과거 서버 메모리의 시험용 주조 배치는 포함하지 않습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <span className="block text-muted-foreground">승인 상태의 정책 명령</span>
                  <strong className="text-xl tabular-nums">{evidence.active_policy_orders_count.toLocaleString('ko-KR')}건</strong>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="block text-muted-foreground">정식 발행 증명서 기록</span>
                  <strong className="text-xl tabular-nums">{evidence.total_mint_certificates_count.toLocaleString('ko-KR')}건</strong>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="block text-muted-foreground">폐기 증명서 기록</span>
                  <strong className="text-xl tabular-nums">{evidence.total_retirement_certificates_count.toLocaleString('ko-KR')}건</strong>
                </div>
              </div>
              {evidence.is_issuance_frozen && <p role="alert" className="rounded-lg border border-amber-500/40 p-3">발행 동결</p>}
              <p className="text-muted-foreground">
                {evidence.verified_invariant
                  ? '통화량 불변식 조회가 확인됐습니다. 금전 발행 권한은 별도로 통제됩니다.'
                  : '현재 통화량 지표는 일부 계정만 포함합니다. 전체 공급량과 정식 원장 발행·폐기 정산은 별도 검증 대상입니다.'}
              </p>
              <p className="text-muted-foreground">
                DB 기록 조회가 가능하다는 사실은 실제 신규 WLD 발행이나 소각이 승인됐다는 뜻은 아닙니다.
              </p>
            </CardContent>
          </Card>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-1 size-4" /> 새로고침
          </Button>
        </>
      )}
    </section>
  );
}
