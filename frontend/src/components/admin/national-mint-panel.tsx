'use client';

import { useEffect, useState } from 'react';
import { Coins, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseMintStatusEvidence, type MintStatusEvidence } from './mint-status-evidence';

export function NationalMintPanel() {
  const [evidence, setEvidence] = useState<MintStatusEvidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/mint/status?_t=${Date.now()}`, { cache: 'no-store', signal: controller.signal })
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

  useEffect(() => {
    const timer = setInterval(() => {
      fetch('/api/admin/mint/status?_t=' + Date.now(), { cache: 'no-store' })
        .then(async (res) => (res.ok ? parseMintStatusEvidence(await res.json()) : null))
        .then((res) => { if (res) setEvidence(res); })
        .catch(() => {});
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="space-y-4" aria-label="조폐국 검증 상태">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coins className="size-5 text-primary" />
          <h2 className="text-xl font-bold">국가조폐국 (National Mint Bureau)</h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          실시간 20초 자동 동기화
        </div>
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
              {evidence.verified_invariant ? (
                <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>통화량 불변식 전수 인증 완료: 조폐국 정책 DB와 국고/유통 원장 대차대조표가 100% 일치합니다.</span>
                </div>
              ) : (
                <div role="status" className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                  현재 통화량 지표는 일부 계정만 포함합니다. 전체 공급량과 정식 원장 발행·폐기 정산은 별도 검증 대상입니다.
                </div>
              )}
            </CardContent>
          </Card>
          {/* background 20s auto sync active */}
        </>
      )}
    </section>
  );
}
