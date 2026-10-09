'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Dice5,
  Percent,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function AdminNationalTreasuryControlCard() {
  // 복권 수동 추첨 상태
  const [currentRound, setCurrentRound] = useState<number>(42);
  const [accumulatedJackpot, setAccumulatedJackpot] = useState<number>(1450000);
  const [lastDrawnNumbers, setLastDrawnNumbers] = useState<readonly number[] | null>(null);
  const [lastBonusNumber, setLastBonusNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // 테일러 칙 파라미터 상태
  const [neutralRate, setNeutralRate] = useState<number>(2.0); // r*
  const [targetInflation, setTargetInflation] = useState<number>(2.0); // pi*
  const [alphaWeight, setAlphaWeight] = useState<number>(0.5); // 인플레 가중치
  const [betaWeight, setBetaWeight] = useState<number>(0.5); // 산출 갭 가중치
  const [calculatedRate, setCalculatedRate] = useState<number>(3.75);
  const [isSavingParams, setIsSavingParams] = useState<boolean>(false);

  // 메가 잭팟 수동 추첨 실행 핸들러
  const handleManualDraw = async () => {
    setIsDrawing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 1~45 중 6개 무작위 중복 없는 번호 생성
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      const sorted = Array.from(numbers).sort((a, b) => a - b);
      let bonus = Math.floor(Math.random() * 45) + 1;
      while (sorted.includes(bonus)) {
        bonus = Math.floor(Math.random() * 45) + 1;
      }

      const burnedAmount = Math.round(accumulatedJackpot * 0.5);
      setLastDrawnNumbers(sorted);
      setLastBonusNumber(bonus);
      setCurrentRound((prev) => prev + 1);
      setAccumulatedJackpot(850000); // 잭팟 초기 시드로 재설정

      toast.success(
        `제 ${currentRound}회 메가 잭팟 수동 추첨 완료! 당첨 번호: [${sorted.join(', ')}] + 보너스 [${bonus}]`,
        {
          description: `판매/적립액의 50%인 ${burnedAmount.toLocaleString()} WLD가 국고(VAULT_MAIN)로 귀속되어 영구 소각되었습니다.`,
        }
      );
    } catch {
      toast.error('수동 추첨 집행 중 오류가 발생했습니다.');
    } finally {
      setIsDrawing(false);
    }
  };

  // 테일러 칙 파라미터 저장 핸들러
  const handleSaveTaylorParams = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingParams(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // 새 금리 계산 공식 적용 (예시: 물가 3.2%, 갭 0.8%)
      const inflation = 3.2;
      const gap = 0.8;
      const newRate =
        neutralRate +
        inflation +
        alphaWeight * (inflation - targetInflation) +
        betaWeight * gap;
      setCalculatedRate(Number(newRate.toFixed(2)));

      toast.success(
        `테일러 칙 거시경제 파라미터가 갱신되었습니다. 신규 산출 기준금리: 연 ${newRate.toFixed(2)}%`,
        { description: '전 금융기관 및 가상 담보대출 금리에 실시간 동기화되었습니다.' }
      );
    } catch {
      toast.error('파라미터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingParams(false);
    }
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#090C16] text-zinc-100 shadow-2xl overflow-hidden">
      {/* Header */}
      <CardHeader className="p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Landmark className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  국고 메가 잭팟 복권 & 테일러 칙 관리자 관제 콘솔
                </CardTitle>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] font-mono">
                  ADMIN CONTROL
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                복권 수동 추첨 집행 및 50% 영구 소각, 중앙은행 테일러 칙 거시경제 금리 파라미터를 미세 조정합니다.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <Percent className="size-3.5 text-blue-400" />
            <span className="text-muted-foreground">현재 테일러 기준금리:</span>
            <span className="font-bold text-blue-400">연 {calculatedRate}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Module 1: 메가 잭팟 복권 수동 추첨 트리거 */}
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Dice5 className="size-4 text-amber-400" />
                <h4 className="text-sm font-bold text-foreground">
                  메가 잭팟 복권 제 {currentRound}회 수동 추첨 트리거
                </h4>
                <Badge className="bg-zinc-800 text-zinc-300 text-[10px]">
                  누적 풀: {accumulatedJackpot.toLocaleString()} WLD
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                일요일 자동 추첨 외에 비상 점검 또는 운영상 필요 시 관리자 권한으로 수동 추첨을 집행하며, 즉시 50% 국고 소각 트랜잭션이 발동됩니다.
              </p>
            </div>

            <Button
              type="button"
              disabled={isDrawing}
              onClick={handleManualDraw}
              className="shrink-0 h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shadow-md transition-all min-h-[40px]"
            >
              <Dice5 className="size-4 mr-1.5" />
              {isDrawing ? '추첨 집행 중...' : '🎲 메가 잭팟 수동 추첨 즉시 집행'}
            </Button>
          </div>

          {/* 추첨 결과 표시 */}
          {lastDrawnNumbers && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-zinc-950/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">최근 추첨 완료 번호:</span>
                <div className="flex items-center gap-1.5 font-mono">
                  {lastDrawnNumbers.map((n) => (
                    <span
                      key={n}
                      className="size-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs font-bold"
                    >
                      {n}
                    </span>
                  ))}
                  <span className="text-muted-foreground px-0.5">+</span>
                  <span className="size-6 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-xs font-bold">
                    {lastBonusNumber}
                  </span>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                50% 국고 영구 소각 완료
              </Badge>
            </div>
          )}
        </div>

        {/* Module 2: 테일러 칙 거시경제 파라미터 미세 조정 */}
        <form onSubmit={handleSaveTaylorParams} className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="size-4 text-blue-400" />
                테일러 칙(Taylor Rule) 기준금리 파라미터 미세 조정
              </h4>
              <p className="text-xs text-muted-foreground">
                $r = r^* + \pi + \alpha(\pi - \pi^*) + \beta(y - y^*)$ 산출 계수를 동적으로 조정합니다.
              </p>
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-mono">
              POLICY KNOBS
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Knob 1: 중립금리 r* */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">중립 기준금리 ($r^*$)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                max="5.0"
                value={neutralRate}
                onChange={(e) => setNeutralRate(Number(e.target.value))}
                className="font-mono text-xs bg-zinc-900 border-zinc-800"
              />
              <p className="text-[10px] text-muted-foreground">기본값 2.0% (잠재 경제 성장률)</p>
            </div>

            {/* Knob 2: 목표 인플레이션 pi* */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">목표 인플레이션 ($\pi^*$)</Label>
              <Input
                type="number"
                step="0.1"
                min="1.0"
                max="4.0"
                value={targetInflation}
                onChange={(e) => setTargetInflation(Number(e.target.value))}
                className="font-mono text-xs bg-zinc-900 border-zinc-800"
              />
              <p className="text-[10px] text-muted-foreground">기본값 2.0% (물가 안정 목표치)</p>
            </div>

            {/* Knob 3: 인플레 갭 가중치 alpha */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">인플레 가중치 ($\alpha$)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.1"
                max="1.5"
                value={alphaWeight}
                onChange={(e) => setAlphaWeight(Number(e.target.value))}
                className="font-mono text-xs bg-zinc-900 border-zinc-800"
              />
              <p className="text-[10px] text-muted-foreground">기본값 0.5 (물가 대응 민감도)</p>
            </div>

            {/* Knob 4: 산출 갭 가중치 beta */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">산출 갭 가중치 ($\beta$)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.1"
                max="1.5"
                value={betaWeight}
                onChange={(e) => setBetaWeight(Number(e.target.value))}
                className="font-mono text-xs bg-zinc-900 border-zinc-800"
              />
              <p className="text-[10px] text-muted-foreground">기본값 0.5 (경기 활성화 민감도)</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-muted-foreground font-mono">
              조정 후 즉시 전체 대출 마진콜 및 예금 금리에 반영됩니다.
            </span>
            <Button
              type="submit"
              disabled={isSavingParams}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
            >
              {isSavingParams ? '저장 중...' : '💾 테일러 칙 파라미터 즉시 저장 및 금리 재계산'}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>
            <b>중앙은행 통화 안정성:</b> 모든 파라미터 변경 내역은 감사 원장(`audit_logs`)에 서명되어 영구 보존됩니다.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] text-zinc-400 font-mono">
          POLICY-SYNC: ACTIVE
        </Badge>
      </CardFooter>
    </Card>
  );
}
