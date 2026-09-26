'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';

interface PredictionMarket {
  id: string;
  title: string;
  category: 'stocks' | 'economy' | 'council';
  endDate: string;
  totalPoolWld: number;
  yesProbability: number;
  yesOdds: number;
  noOdds: number;
  volume24h: number;
}

const INITIAL_MARKETS: PredictionMarket[] = [
  {
    id: 'pred-1',
    title: '월덕게임즈 (WDG) 이번 주 종가 1,500 WLD 돌파할까?',
    category: 'stocks',
    endDate: 'D-3 (09.29 24:00)',
    totalPoolWld: 1450000,
    yesProbability: 58,
    yesOdds: 1.68,
    noOdds: 2.32,
    volume24h: 320000,
  },
  {
    id: 'pred-2',
    title: '가상 중앙은행 AI 위원회, 10월 기준금리 0.25%p 인하할까?',
    category: 'council',
    endDate: 'D-5 (10.01 18:00)',
    totalPoolWld: 890000,
    yesProbability: 35,
    yesOdds: 2.75,
    noOdds: 1.48,
    volume24h: 180000,
  },
  {
    id: 'pred-3',
    title: '파이낸스덕 (FNAK) 24시간 거래량 전 종목 1위 달성?',
    category: 'stocks',
    endDate: 'D-1 (09.27 24:00)',
    totalPoolWld: 2100000,
    yesProbability: 72,
    yesOdds: 1.36,
    noOdds: 3.45,
    volume24h: 580000,
  },
  {
    id: 'pred-4',
    title: '월덕 통화 유동성 지수 (Balanced 0.98) 1.0 돌파할까?',
    category: 'economy',
    endDate: 'D-7 (10.03 24:00)',
    totalPoolWld: 640000,
    yesProbability: 49,
    yesOdds: 1.98,
    noOdds: 2.01,
    volume24h: 120000,
  },
];

export default function PredictionPage() {
  const { locale } = useLocale();
  const [markets] = useState<PredictionMarket[]>(INITIAL_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket>(INITIAL_MARKETS[0]!);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [stakeAmount, setStakeAmount] = useState<number>(10000);
  const [isSuccessModal, setIsSuccessModal] = useState<boolean>(false);

  const feeRate = 0.02; // 2% platform transaction fee
  const feeAmount = Math.round(stakeAmount * feeRate);
  const netStake = stakeAmount - feeAmount;
  const currentOdds = selectedSide === 'yes' ? selectedMarket.yesOdds : selectedMarket.noOdds;
  const expectedPayout = Math.round(netStake * currentOdds);

  const handleTrade = () => {
    setIsSuccessModal(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 pt-4 px-3 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-background p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-black text-primary">
              <Flame className="size-4 animate-pulse text-amber-500" />
              <span>Polymarket 스타일 실시간 경제 예측 시장</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              월덕 가상 예측 마켓 (Prediction Market)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              운에 의존하지 않고 실제 경제 지표, 상장 기업 실적, AI 위원회 결정을 분석하여 Yes/No 지분을 거래하세요.
              체결 시 2%의 거래 수수료는 가상 경제 펀드로 자동 소각됩니다.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-border/80 bg-surface/80 p-3.5 text-right font-mono">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase">총 예측 마켓 풀</span>
              <span className="text-lg font-black text-amber-500">5,080,000 WLD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Market List & Trading Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Market Cards (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-500" />
              진행 중인 핫 예측 마켓
            </h2>
            <span className="text-xs text-muted-foreground font-mono">실시간 배당률 갱신 중</span>
          </div>

          <div className="grid gap-4">
            {markets.map((m) => {
              const isSelected = selectedMarket.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMarket(m)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5 ring-1 ring-primary/30'
                      : 'border-border/80 bg-card hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                      {m.category === 'stocks' ? '주식 시장' : m.category === 'council' ? 'AI 위원회' : '통화 거시경제'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500">
                      <Clock className="size-3.5" /> {m.endDate}
                    </span>
                  </div>

                  <div className="py-3">
                    <h3 className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors">
                      {m.title}
                    </h3>
                  </div>

                  {/* Probability Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono font-black">
                      <span className="text-emerald-500">YES {m.yesProbability}% ({m.yesOdds}x)</span>
                      <span className="text-rose-500">NO {100 - m.yesProbability}% ({m.noOdds}x)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-rose-500/20 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${m.yesProbability}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40 font-mono">
                    <span>풀 규모: {m.totalPoolWld.toLocaleString()} WLD</span>
                    <span>24h 거래량: {m.volume24h.toLocaleString()} WLD</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trading Console (1 Col) */}
        <div className="sticky top-20 rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
          <div className="space-y-1 pb-3 border-b border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground">선택된 예측 마켓</span>
            <h3 className="text-sm font-bold text-foreground line-clamp-2">
              {selectedMarket.title}
            </h3>
          </div>

          {/* Side Selector */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={selectedSide === 'yes' ? 'default' : 'outline'}
              onClick={() => setSelectedSide('yes')}
              className={`h-12 rounded-xl font-black text-sm gap-2 ${
                selectedSide === 'yes' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
              }`}
            >
              <CheckCircle2 className="size-4" />
              <span>YES ({selectedMarket.yesOdds}x)</span>
            </Button>
            <Button
              type="button"
              variant={selectedSide === 'no' ? 'default' : 'outline'}
              onClick={() => setSelectedSide('no')}
              className={`h-12 rounded-xl font-black text-sm gap-2 ${
                selectedSide === 'no' ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''
              }`}
            >
              <XCircle className="size-4" />
              <span>NO ({selectedMarket.noOdds}x)</span>
            </Button>
          </div>

          {/* Amount Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
              <span>투자 수량 (WLD)</span>
              <span className="font-mono text-primary">보유 잔액 연동</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Math.max(1000, Number(e.target.value) || 0))}
                className="w-full h-11 rounded-xl border border-border bg-background px-3 font-mono text-sm font-bold focus:border-primary focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">WLD</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[5000, 10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStakeAmount(amt)}
                  className="rounded-lg border border-border/80 bg-muted/40 py-1.5 text-[11px] font-mono font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  +{amt >= 10000 ? `${amt / 10000}만` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Receipt Breakdown */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>투입 원금</span>
              <span>{stakeAmount.toLocaleString()} WLD</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>플랫폼 거래 수수료 (2%)</span>
              <span className="text-rose-500">-{feeAmount.toLocaleString()} WLD (소각)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>적용 배당률</span>
              <span className="font-bold text-foreground">{currentOdds}x</span>
            </div>
            <div className="pt-2 border-t border-border/40 flex justify-between text-sm font-black">
              <span className="text-foreground">적중 시 예상 환급금</span>
              <span className="text-emerald-500 font-bold">{expectedPayout.toLocaleString()} WLD</span>
            </div>
          </div>

          <Button
            onClick={handleTrade}
            className="w-full h-12 rounded-2xl font-black text-sm shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="size-4 mr-1.5" />
            {selectedSide.toUpperCase()} 지분 매수하기 ({stakeAmount.toLocaleString()} WLD)
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-card p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-lg font-black text-foreground">예측 지분 체결 완료!</h3>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">{selectedMarket.title}</strong>에 대한{' '}
              <span className="text-emerald-500 font-bold">{selectedSide.toUpperCase()}</span> 지분{' '}
              <strong className="font-mono text-foreground">{stakeAmount.toLocaleString()} WLD</strong>가 정상 매수되었습니다.
            </p>
            <Button onClick={() => setIsSuccessModal(false)} className="w-full h-11 rounded-xl font-bold">
              확인 및 닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
