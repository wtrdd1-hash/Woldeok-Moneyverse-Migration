'use client';

import React, { useState, useEffect, useActionState, useTransition } from 'react';
import { Sparkles, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';
import { playCoinCollectSound, playStockTickSound } from '@/lib/audio-effects';
import { claimInterestAction, depositAction, withdrawAction } from './actions';
import { IDLE } from '@/lib/action-state';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { useBankCopy } from './use-bank-copy';

interface TossBankHeroCardProps {
  readonly bankBalance: string;
  readonly cashBalance: string;
  readonly unclaimedInterest: string;
  readonly dailyRatePct: number;
  readonly annualYieldPct: number;
}

export function TossBankHeroCard({
  bankBalance,
  cashBalance,
  unclaimedInterest,
  dailyRatePct,
  annualYieldPct,
}: TossBankHeroCardProps) {
  const { c, locale } = useBankCopy();
  // Korean keeps its carried-over ten-thousand/thousand shorthand; other locales show the grouped amount itself.
  const presetLabel = (preset: string) =>
    locale === 'ko'
      ? `+${Number(preset) >= 10000 ? `${Number(preset) / 10000}만` : `${Number(preset) / 1000}천`}`
      : `+${groupDigits(preset)}`;
  // 실시간 라이브 이자 카운팅 애니메이션 상태
  const baseUnclaimed = Number.parseFloat(unclaimedInterest) || 0;
  const bankNum = Number.parseFloat(bankBalance) || 0;
  const [liveInterest, setLiveInterest] = useState<number>(baseUnclaimed);
  const [interestPopped, setInterestPopped] = useState(false);

  // 이자 수령 폼 액션
  const [claimState, doClaim, isClaimPending] = useActionState(claimInterestAction, IDLE);

  // 입출금 다이얼로그 모달 상태
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [depositState, doDeposit] = useActionState(depositAction, IDLE);
  const [withdrawState, doWithdraw] = useActionState(withdrawAction, IDLE);

  // 매 1초마다 실시간으로 누적 이자 수치 시각적 인크리먼트
  useEffect(() => {
    if (bankNum <= 0) return;
    // 초당 이자 = 잔액 * (일일이율% / 100) / 86400
    const perSecond = (bankNum * (dailyRatePct / 100)) / 86400;
    const interval = setInterval(() => {
      setLiveInterest((prev) => prev + perSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [bankNum, dailyRatePct]);

  // 이자 수령 성공 시 사운드 및 피드백 애니메이션
  useEffect(() => {
    if (claimState.status === 'ok') {
      playCoinCollectSound();
      setInterestPopped(true);
      setLiveInterest(0);
      const timer = setTimeout(() => setInterestPopped(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [claimState.status]);

  const canClaim = bankNum > 0 && liveInterest >= 1;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-b from-[#131d33] via-[#0e1526] to-[#090d18] p-6 sm:p-8 shadow-2xl space-y-6 text-white">
      {/* 배경 은은한 블루 글로우 */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 size-64 rounded-full bg-blue-600/10 blur-3xl" />

      {/* 상단: 통장 브랜드 및 복리 이자율 뱃지 */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Zap className="size-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>{c('heroTitle')}</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-sky-300">
                WLD-805
              </span>
            </h2>
            <p className="text-xs text-sky-200/60 font-mono">
              {c('heroSubtitle')}
            </p>
          </div>
        </div>

        <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 font-bold px-3 py-1 text-xs">
          {c('heroRateBadge', { daily: `${dailyRatePct}`, annual: `${annualYieldPct}` })}
        </Badge>
      </div>

      {/* 중앙: 압도적으로 큼직한 내 통장 잔액 */}
      <div className="relative z-10 space-y-1.5 pt-2">
        <span className="text-xs sm:text-sm font-medium text-sky-200/70">
          {c('heroBalance')}
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-fintech text-4xl sm:text-5xl font-black tracking-tight text-white">
            {groupDigits(bankBalance)}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-sky-300/80">WLD</span>
        </div>
      </div>

      {/* 실시간 라이브 이자 바 및 '지금 이자 받기' 원클릭 액션 */}
      <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>{c('heroAccruing')}</span>
          </div>
          <div className="font-fintech text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums">
            +{liveInterest.toFixed(2)}{' '}
            <span className="text-sm font-semibold text-emerald-300/70">WLD</span>
          </div>
          <p className="text-[11px] text-white/50">
            {c('heroMinimum')}
          </p>
        </div>

        <form action={doClaim} className="shrink-0">
          <Button
            type="submit"
            disabled={!canClaim || isClaimPending}
            className={`w-full sm:w-auto h-12 px-6 rounded-2xl font-extrabold text-sm shadow-lg transition-all active:scale-95 ${
              canClaim
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25'
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <Sparkles className="size-4 mr-1.5" />
            {isClaimPending ? c('heroClaiming') : c('heroClaim')}
          </Button>
        </form>
      </div>

      {/* 이자 수령 성공 토스트 배너 */}
      {interestPopped && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="size-4" />
          <span>{c('heroClaimed')}</span>
        </div>
      )}

      {claimState.status === 'error' && (
        <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {claimState.message}
        </div>
      )}

      {/* 하단 2대 큼직한 원터치 액션 버튼 (채우기 / 보내기) */}
      <div className="relative z-10 grid grid-cols-2 gap-3 pt-2">
        <Button
          type="button"
          onClick={() => {
            playStockTickSound();
            setIsDepositOpen(true);
          }}
          className="h-14 rounded-2xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-sm sm:text-base shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ArrowDownToLine className="size-4 sm:size-5" />
          <span>{c('heroDepositButton')}</span>
        </Button>

        <Button
          type="button"
          onClick={() => {
            playStockTickSound();
            setIsWithdrawOpen(true);
          }}
          className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm sm:text-base border border-white/15 backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ArrowUpFromLine className="size-4 sm:size-5" />
          <span>{c('heroWithdrawButton')}</span>
        </Button>
      </div>

      {/* 입금(채우기) 다이얼로그 모달 */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {c('heroDepositTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {c('heroDepositCash', { amount: groupDigits(cashBalance) })}
            </DialogDescription>
          </DialogHeader>

          <form action={doDeposit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="deposit-input" className="text-xs font-semibold text-muted-foreground block">
                {c('heroDepositAmount')}
              </label>
              <AmountInput
                id="deposit-input"
                name="amount"
                placeholder="0"
                defaultValue={depositAmount}
                required
                className="h-13 text-xl font-fintech font-bold"
              />
            </div>

            {/* 빠른 금액 프리셋 4선 */}
            <div className="grid grid-cols-4 gap-2">
              {['1000', '10000', '50000'].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playStockTickSound();
                    setDepositAmount(preset);
                  }}
                  className="h-9 text-xs font-mono font-bold"
                >
                  {presetLabel(preset)}
                </Button>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  playStockTickSound();
                  setDepositAmount(cashBalance);
                }}
                className="h-9 text-xs font-bold"
              >
                {c('heroMax')}
              </Button>
            </div>

            <SubmitButton className="w-full h-12 rounded-2xl btn-toss font-bold text-sm mt-4">
              {c('heroDepositSubmit')}
            </SubmitButton>
            <ActionAlert state={depositState} />
          </form>
        </DialogContent>
      </Dialog>

      {/* 출금(보내기) 다이얼로그 모달 */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {c('heroWithdrawTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {c('heroWithdrawBalance', { amount: groupDigits(bankBalance) })}
            </DialogDescription>
          </DialogHeader>

          <form action={doWithdraw} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="withdraw-input" className="text-xs font-semibold text-muted-foreground block">
                {c('heroWithdrawAmount')}
              </label>
              <AmountInput
                id="withdraw-input"
                name="amount"
                placeholder="0"
                defaultValue={withdrawAmount}
                required
                className="h-13 text-xl font-fintech font-bold"
              />
            </div>

            {/* 빠른 금액 프리셋 4선 */}
            <div className="grid grid-cols-4 gap-2">
              {['1000', '10000', '50000'].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playStockTickSound();
                    setWithdrawAmount(preset);
                  }}
                  className="h-9 text-xs font-mono font-bold"
                >
                  {presetLabel(preset)}
                </Button>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  playStockTickSound();
                  setWithdrawAmount(bankBalance);
                }}
                className="h-9 text-xs font-bold"
              >
                {c('heroMax')}
              </Button>
            </div>

            <SubmitButton variant="outline" className="w-full h-12 rounded-2xl font-bold text-sm mt-4">
              {c('heroWithdrawSubmit')}
            </SubmitButton>
            <ActionAlert state={withdrawState} />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
