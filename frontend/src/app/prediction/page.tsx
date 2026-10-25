'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BookOpen, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Only the backend can establish a real market, place a bet and return a ledger receipt.
// This page deliberately cannot perform any transaction.
type CapabilityState = 'checking' | 'unavailable' | 'error';

export default function PredictionPage() {
  const [capability, setCapability] = useState<CapabilityState>('checking');
  const [yesProbability, setYesProbability] = useState(50);

  useEffect(() => {
    const controller = new AbortController();
    async function checkCapability() {
      try {
        const response = await fetch('/api/prediction/status', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        });
        const data: unknown = await response.json();
        if (controller.signal.aborted) return;
        if (
          response.status === 503 &&
          typeof data === 'object' && data !== null &&
          'available' in data && data.available === false &&
          'reason' in data && data.reason === 'NO_SETTLEMENT_CONTRACT'
        ) {
          setCapability('unavailable');
        } else {
          // A new backend status is not proof that the trading flow is safe.
          setCapability('error');
        }
      } catch {
        if (!controller.signal.aborted) setCapability('error');
      }
    }
    void checkCapability();
    return () => controller.abort();
  }, []);

  const noProbability = 100 - yesProbability;
  const yesMultiplier = (100 / yesProbability).toFixed(2);
  const noMultiplier = (100 / noProbability).toFixed(2);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-5" />
          <span>월덕 가상 예측 마켓</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">예측 시장 — 교육용 확률 연습</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          실제 예측 시장의 개설·주문·원장 정산 기능은 아직 제공되지 않습니다.
          이 화면은 수학적 확률을 연습할 뿐, WLD 잔액·배당금·거래 내역을 변경하지 않습니다.
        </p>
      </header>

      <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
        <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <p>
          {capability === 'checking'
            ? '예측 거래 지원 상태 확인 중 — 거래는 비활성화되어 있습니다.'
            : capability === 'unavailable'
              ? '거래 미지원 — 서버에 검증된 예측 시장 및 정산 계약이 없습니다.'
              : '상태 확인 불가 — 거래는 안전을 위해 비활성화되어 있습니다.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen aria-hidden="true" className="size-5" />
            학습용 계산: YES/NO 확률
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            아래 값은 사용자가 직접 설정한 가정입니다. 실제 시장의 가격, 배당률, 수수료 또는 거래 제안이 아닙니다.
          </p>
          <div className="space-y-3">
            <label htmlFor="prediction-yes-probability" className="block text-sm font-semibold">
              YES 확률: {yesProbability}%
            </label>
            <input
              id="prediction-yes-probability"
              aria-label="YES 확률"
              type="range"
              min="1"
              max="99"
              step="1"
              value={yesProbability}
              onChange={(event) => setYesProbability(Number(event.currentTarget.value))}
              className="h-11 w-full cursor-pointer accent-primary"
            />
            <p className="text-xs text-muted-foreground">키보드 방향키로 1%씩 조정할 수 있습니다.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-live="polite">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="font-bold">YES {yesProbability}%</p>
              <p className="mt-2 text-sm">이론적 공정 배수: <strong>{yesMultiplier}배</strong></p>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <p className="font-bold">NO {noProbability}%</p>
              <p className="mt-2 text-sm">이론적 공정 배수: <strong>{noMultiplier}배</strong></p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            이론적 공정 배수는 100 ÷ 확률(%)로 계산하며 수수료·위험·유동성은 반영하지 않습니다.
            거래 기능이 아니므로 결제 버튼이나 체결 영수증이 없습니다.
          </p>
        </CardContent>
      </Card>

      <nav aria-label="다른 서비스로 이동" className="flex flex-wrap gap-3">
        <Link href="/stocks" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          실제 서버 기반 가상 주식 서비스
        </Link>
        <Link href="/guide" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          서비스 이용 안내
        </Link>
      </nav>
    </main>
  );
}
