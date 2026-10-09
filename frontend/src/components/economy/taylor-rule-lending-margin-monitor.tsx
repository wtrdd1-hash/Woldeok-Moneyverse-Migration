'use client';

import React, { useState, useMemo } from 'react';
import {
  Percent,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Landmark,
  Coins,
  AlertTriangle,
  ArrowRight,
  Info,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export function TaylorRuleLendingMarginMonitor() {
  // 테일러 칙 산출 파라미터 (r = r* + pi + 0.5(pi - pi*) + 0.5(y - y*))
  const neutralRate = 2.0; // r* 중립금리 2.0%
  const targetInflation = 2.0; // pi* 목표 인플레이션 2.0%
  const [currentInflation, setCurrentInflation] = useState<number>(3.2); // 현재 인플레이션 3.2%
  const [outputGap, setOutputGap] = useState<number>(0.8); // 생산 갭 +0.8%

  // 실시간 테일러 칙 기준금리 계산
  const taylorRate = useMemo(() => {
    const rate =
      neutralRate +
      currentInflation +
      0.5 * (currentInflation - targetInflation) +
      0.5 * outputGap;
    return Math.max(1.0, Math.min(12.0, Number(rate.toFixed(2))));
  }, [currentInflation, outputGap]);

  // 대출 시뮬레이션 상태
  const [collateralAsset, setCollateralAsset] = useState<'WDG' | 'KTB3Y'>('WDG');
  const [collateralValue, setCollateralValue] = useState<number>(100000); // 담보 평가액 100,000 WLD
  const [borrowedAmount, setBorrowedAmount] = useState<number>(65000); // 대출 실행액 65,000 WLD
  const [priceShock, setPriceShock] = useState<number>(0); // 주가 변동 시뮬레이션 (-50% ~ +20%)

  // 마진콜 분석 엔진
  const marginAnalysis = useMemo(() => {
    const shockMultiplier = 1 + priceShock / 100;
    const currentCollateral = Math.round(collateralValue * shockMultiplier);
    const maxLtvAmount = Math.round(currentCollateral * 0.7); // LTV 70% 한도
    const collateralRatio = borrowedAmount > 0 ? (currentCollateral / borrowedAmount) * 100 : 999;

    // 위험 등급 산출
    let status: 'SAFE' | 'WARNING' | 'LIQUIDATION' = 'SAFE';
    if (collateralRatio < 100) {
      status = 'LIQUIDATION'; // 100% 미만 강제 반대매매
    } else if (collateralRatio <= 125) {
      status = 'WARNING'; // 125% 이하 마진콜 경보
    }

    // 연간 및 월간 이자액 (국고 세입 귀속)
    const annualInterest = Math.round(borrowedAmount * (taylorRate / 100));
    const monthlyInterest = Math.round(annualInterest / 12);

    return {
      currentCollateral,
      maxLtvAmount,
      collateralRatio: Math.round(collateralRatio),
      status,
      annualInterest,
      monthlyInterest,
    };
  }, [collateralValue, borrowedAmount, priceShock, taylorRate]);

  const handleRepay = () => {
    if (borrowedAmount <= 0) {
      toast.info('상환할 대출 원리금이 없습니다.');
      return;
    }
    const repayVal = Math.min(borrowedAmount, 10000);
    setBorrowedAmount((prev) => Math.max(0, prev - repayVal));
    toast.success(`대출 원금 ${repayVal.toLocaleString()} WLD 상환 완료!`, {
      description: '담보 비율이 안전 구간으로 즉각 상승했습니다.',
    });
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#090B13] text-zinc-100 shadow-2xl overflow-hidden">
      {/* Header */}
      <CardHeader className="p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Percent className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  테일러 칙(Taylor Rule) 기준금리 & 담보대출 마진콜 관제
                </CardTitle>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-mono">
                  MCB TAYLOR-LENDING
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                물가·생산 갭 기반 자동 기준금리 산정과 주식·국채 LTV 70% 담보비율 및 반대매매 청산을 감시합니다.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-mono">
            <span className="text-blue-300">중앙은행 테일러 금리:</span>
            <span className="font-extrabold text-blue-400 text-sm">연 {taylorRate}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Margin Status Alert Banner */}
        <div
          className={cn(
            'p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
            marginAnalysis.status === 'SAFE' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
            marginAnalysis.status === 'WARNING' && 'bg-amber-500/10 border-amber-500/30 text-amber-300',
            marginAnalysis.status === 'LIQUIDATION' && 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
          )}
        >
          <div className="flex items-start sm:items-center gap-3">
            {marginAnalysis.status === 'SAFE' && <ShieldCheck className="size-6 text-emerald-400 shrink-0" />}
            {marginAnalysis.status === 'WARNING' && <AlertTriangle className="size-6 text-amber-400 shrink-0" />}
            {marginAnalysis.status === 'LIQUIDATION' && <ShieldAlert className="size-6 text-rose-400 shrink-0" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">
                  {marginAnalysis.status === 'SAFE' && '담보 건전성 양호 (정상 상태)'}
                  {marginAnalysis.status === 'WARNING' && '⚠️ 마진콜 경보 (담보 비율 125% 이하)'}
                  {marginAnalysis.status === 'LIQUIDATION' && '🚨 강제 반대매매 청산 진행 (100% 미달)'}
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-zinc-900 border border-border">
                  담보비율: {marginAnalysis.collateralRatio}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {marginAnalysis.status === 'SAFE' && '담보가치가 안정적이며 추가 대출 여력이 존재합니다.'}
                {marginAnalysis.status === 'WARNING' && '주가 급락 시 24시간 내 추가 증거금 납부 또는 일부 원금 상환이 필요합니다.'}
                {marginAnalysis.status === 'LIQUIDATION' && '국고 채권자 보호를 위해 담보 주식이 시장가로 즉시 원자적 자동 청산됩니다.'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleRepay}
            className="shrink-0 h-10 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-all min-h-[40px]"
          >
            원금 1만 WLD 상환
          </Button>
        </div>

        {/* 4 Core Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1">
            <span className="text-[11px] text-muted-foreground">현재 담보 평가액</span>
            <div className="text-base sm:text-lg font-mono font-bold text-foreground">
              {marginAnalysis.currentCollateral.toLocaleString()} WLD
            </div>
            <p className="text-[10px] text-muted-foreground">시세 변동: {priceShock > 0 ? `+${priceShock}%` : `${priceShock}%`}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1">
            <span className="text-[11px] text-muted-foreground">실행 대출 원금</span>
            <div className="text-base sm:text-lg font-mono font-bold text-blue-400">
              {borrowedAmount.toLocaleString()} WLD
            </div>
            <p className="text-[10px] text-muted-foreground">최대 LTV 70%: {marginAnalysis.maxLtvAmount.toLocaleString()} WLD</p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1">
            <span className="text-[11px] text-muted-foreground">월 대출이자 (국고 환수)</span>
            <div className="text-base sm:text-lg font-mono font-bold text-amber-400">
              {marginAnalysis.monthlyInterest.toLocaleString()} WLD/월
            </div>
            <p className="text-[10px] text-muted-foreground">연간 이자: {marginAnalysis.annualInterest.toLocaleString()} WLD</p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1">
            <span className="text-[11px] text-muted-foreground">마진콜 위험 임계치</span>
            <div className="text-base sm:text-lg font-mono font-bold text-rose-400">
              110% (100% 청산)
            </div>
            <p className="text-[10px] text-muted-foreground">현재 마진 여유: {Math.max(0, marginAnalysis.collateralRatio - 100)}%p</p>
          </div>
        </div>

        {/* Stress-Testing Sliders */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>📉</span> 담보 자산 가격 변동 스트레스 테스트
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">가상 시장 충격 시뮬레이션</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground">주가 시세 변동률</Label>
                <span className={cn('font-mono font-bold', priceShock < 0 ? 'text-rose-400' : 'text-emerald-400')}>
                  {priceShock > 0 ? `+${priceShock}%` : `${priceShock}%`}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={20}
                step={5}
                value={priceShock}
                onChange={(e) => setPriceShock(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                담보 주식 가격이 -35% 이상 폭락할 경우 마진콜 경보가 발령되고 자동 청산됩니다.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground">인플레이션 갭 (물가 상승 압력)</Label>
                <span className="font-mono font-bold text-blue-400">
                  {currentInflation.toFixed(1)}% (목표 2.0%)
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.5}
                value={currentInflation}
                onChange={(e) => setCurrentInflation(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                인플레이션이 상승하면 테일러 칙에 의해 대출 금리가 자동으로 상향 조정됩니다.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="size-4 text-blue-400" />
          <span>
            <b>테일러 칙 규칙 공식:</b> $r = r^* + \pi + 0.5(\pi - \pi^*) + 0.5(y - y^*)$ 알고리즘으로 중앙은행 기준금리가 자동 산정됩니다.
          </span>
        </div>
        <a
          href="/stocks"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-foreground font-semibold text-xs transition-colors flex items-center gap-1"
        >
          <span>담보 대상 우량주(WDG) 보러가기</span>
          <span>→</span>
        </a>
      </CardFooter>
    </Card>
  );
}
