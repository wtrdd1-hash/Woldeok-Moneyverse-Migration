'use client';

import { useState } from 'react';
import { Dice5, Landmark, Percent, ShieldAlert, ShieldCheck, Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// No operational lottery draw, monetary burn or central-bank write API is wired to this
// card. Preserve only a clearly labelled client-side illustration until a reviewed,
// audited server-authoritative implementation is available.
export function AdminNationalTreasuryControlCard() {
  const [neutralRate, setNeutralRate] = useState(2);
  const [targetInflation, setTargetInflation] = useState(2);
  const [alphaWeight, setAlphaWeight] = useState(0.5);
  const [betaWeight, setBetaWeight] = useState(0.5);

  // Fixed EXAMPLE inputs, not observed inflation, output gap or an applied policy.
  const illustrativeInflation = 3.2;
  const illustrativeOutputGap = 0.8;
  const inputsValid =
    Number.isFinite(neutralRate) &&
    Number.isFinite(targetInflation) &&
    Number.isFinite(alphaWeight) &&
    Number.isFinite(betaWeight) &&
    neutralRate >= 0.5 && neutralRate <= 5 &&
    targetInflation >= 1 && targetInflation <= 4 &&
    alphaWeight >= 0.1 && alphaWeight <= 1.5 &&
    betaWeight >= 0.1 && betaWeight <= 1.5;
  const illustration = inputsValid
    ? neutralRate +
      illustrativeInflation +
      alphaWeight * (illustrativeInflation - targetInflation) +
      betaWeight * illustrativeOutputGap
    : null;

  return (
    <Card className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#090C16] text-zinc-100 shadow-2xl sm:rounded-3xl">
      <CardHeader className="border-b border-zinc-800/80 bg-zinc-950/70 p-4 sm:p-6">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Landmark className="size-5 shrink-0 text-amber-400" />
              <CardTitle className="text-base font-bold text-foreground sm:text-lg">
                국고 복권 및 테일러 준칙 정책 검토
              </CardTitle>
              <Badge variant="outline" className="border-amber-500/50 text-amber-300">미연동 · 모의 화면</Badge>
            </div>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground">
              운영 복권 회차·당첨금·실제 금리·국고 원장과 연결되지 않은 예시입니다. 이 화면에서는 추첨·소각·금리 저장을 실행할 수 없습니다.
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0 border-zinc-700 text-zinc-300">
            <Percent className="mr-1 size-3.5" /> LIVE DATA: UNAVAILABLE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6">
        <section aria-label="국고 복권 추첨 비활성 안내" className="space-y-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Dice5 className="size-4 text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">국고 복권 수동 추첨</h3>
            <Badge variant="outline" className="text-[10px]">실제 집행 차단</Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            서버에서 검증된 회차·추첨 권한·공정 난수·정산·조폐국 폐기증서·감사 기록이 확인되기 전까지 당첨 번호와 소각 완료 상태를 만들거나 표시하지 않습니다.
          </p>
          <Button type="button" disabled className="min-h-[44px] w-full sm:w-auto">
            서버 정산 연동 전 추첨 불가
          </Button>
        </section>

        <section aria-label="테일러 준칙 예시 계산" className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Sliders className="size-4 text-blue-400" />
            <h3 className="text-sm font-bold text-foreground">테일러 준칙 예시 계산기</h3>
            <Badge variant="outline" className="text-[10px]">로컬 계산만 수행</Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            가정: 인플레이션 3.2%, 산출갭 0.8%p (운영 지표가 아닌 고정 예시).
            계산식: r = r* + π + α(π - π*) + β × 산출갭.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="taylor-neutral" className="text-xs">중립금리 r* (%)</Label>
              <Input id="taylor-neutral" type="number" min="0.5" max="5" step="0.1" value={neutralRate}
                onChange={(e) => setNeutralRate(e.target.value === '' ? Number.NaN : Number(e.target.value))}
                className="min-h-[44px] bg-zinc-900 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taylor-target" className="text-xs">목표 물가상승률 π* (%)</Label>
              <Input id="taylor-target" type="number" min="1" max="4" step="0.1" value={targetInflation}
                onChange={(e) => setTargetInflation(e.target.value === '' ? Number.NaN : Number(e.target.value))}
                className="min-h-[44px] bg-zinc-900 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taylor-alpha" className="text-xs">물가 갭 가중치 α</Label>
              <Input id="taylor-alpha" type="number" min="0.1" max="1.5" step="0.05" value={alphaWeight}
                onChange={(e) => setAlphaWeight(e.target.value === '' ? Number.NaN : Number(e.target.value))}
                className="min-h-[44px] bg-zinc-900 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taylor-beta" className="text-xs">산출 갭 가중치 β</Label>
              <Input id="taylor-beta" type="number" min="0.1" max="1.5" step="0.05" value={betaWeight}
                onChange={(e) => setBetaWeight(e.target.value === '' ? Number.NaN : Number(e.target.value))}
                className="min-h-[44px] bg-zinc-900 font-mono" />
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-semibold text-foreground" aria-live="polite">
              예시 산출금리: <output data-testid="taylor-illustrative-rate">{illustration === null ? '입력 범위 확인 필요' : `연 ${illustration.toFixed(2)}%`}</output>
            </p>
            <Button type="button" disabled className="min-h-[44px] w-full sm:w-auto">
              운영 금리 저장·적용 불가
            </Button>
          </div>
          <p className="flex items-start gap-2 text-xs text-amber-300">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            예시 값을 변경해도 데이터베이스, 국고, 대출 계약, 실시간 기준금리 또는 감사 원장은 변경되지 않습니다.
          </p>
        </section>
      </CardContent>

      <CardFooter className="flex flex-col items-start justify-between gap-3 border-t border-zinc-800/80 bg-zinc-950/70 p-4 text-xs sm:flex-row sm:items-center sm:p-5">
        <span className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4 text-amber-400" />
          실제 적용에는 서버 권한·재인증·정책 버전·원장 대사·감사 증거가 필요합니다.
        </span>
        <Badge variant="outline" className="text-zinc-400">POLICY-SYNC: NOT CONNECTED</Badge>
      </CardFooter>
    </Card>
  );
}
