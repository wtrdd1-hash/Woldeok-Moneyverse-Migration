'use client';

import React, { useState, useId } from 'react';
import { Target, TrendingUp, Sparkles, ChevronRight, Award, Calculator, Info } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import type { BankCopyKey } from './copy';
import { useBankCopy } from './use-bank-copy';

interface SavingsGoalProgressRingProps {
  bankBalance?: string;
  cashBalance?: string;
  bondsTotal?: string;
}

const PRESET_GOALS: readonly { readonly label: BankCopyKey; readonly target: number }[] = [
  { label: 'ringPreset100k', target: 100_000 },
  { label: 'ringPreset500k', target: 500_000 },
  { label: 'ringPreset1m', target: 1_000_000 },
  { label: 'ringPreset5m', target: 5_000_000 },
];

export function SavingsGoalProgressRing({
  bankBalance = '0',
  cashBalance = '0',
  bondsTotal = '0',
}: SavingsGoalProgressRingProps) {
  const [selectedGoal, setSelectedGoal] = useState<number>(500_000);
  const [customGoalInput, setCustomGoalInput] = useState<string>('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  // Bond calculator state
  const [calcPrincipal, setCalcPrincipal] = useState<number>(50_000);
  const [calcDays, setCalcDays] = useState<number>(14);
  const [calcRateBps, setCalcRateBps] = useState<number>(180); // 1.8% daily base

  const maskId = useId();
  const { c } = useBankCopy();

  const totalSavings = Number(BigInt(bankBalance) + BigInt(bondsTotal));
  const currentTarget = selectedGoal;
  const progressRatio = Math.min(1, Math.max(0, totalSavings / currentTarget));
  const progressPct = Math.round(progressRatio * 100);

  // SVG ring parameters
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Bond calculator result
  const calculatedReturn = Math.floor(calcPrincipal * ((calcRateBps / 10000) * calcDays));
  const calculatedTotal = calcPrincipal + calculatedReturn;

  const handleCustomGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number.parseInt(customGoalInput.replace(/,/g, ''), 10);
    if (!Number.isNaN(val) && val > 0) {
      setSelectedGoal(val);
      setCustomGoalInput('');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card/95 via-card/85 to-card/60 p-5 sm:p-7 shadow-md backdrop-blur-md">
      {/* 앰비언트 글로우 배경 */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shadow-inner">
            <Target className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-500">
                FINANCIAL GOAL & BONDS
              </span>
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-300">
                {c('ringProgressBadge', { pct: `${progressPct}` })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
              {c('ringTitle')}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCalculatorOpen((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted/70 hover:border-border active:scale-95"
        >
          <Calculator className="size-4 text-sky-500" />
          <span>{isCalculatorOpen ? c('ringCalculatorClose') : c('ringCalculatorOpen')}</span>
          <ChevronRight className={`size-3.5 transition-transform duration-200 ${isCalculatorOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* 본문 그리드: 링 & 목표 선택 */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-center pt-6">
        {/* 원형 프로그레스 SVG 링 */}
        <div className="flex flex-col items-center justify-center p-3">
          <div className="relative flex items-center justify-center">
            <svg
              className="size-40 -rotate-90 transform"
              viewBox="0 0 160 160"
              aria-label={c('ringAria', { pct: `${progressPct}` })}
            >
              {/* 배경 원 */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-muted/40"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* 진행률 그라디언트 정의 */}
              <defs>
                <linearGradient id={`${maskId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {/* 진행 원 */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={`url(#${maskId}-gradient)`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* 중앙 퍼센트 및 라벨 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                {progressPct}%
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {c('ringDone')}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs font-semibold text-muted-foreground">
              {c('ringTotal')}<span className="font-mono font-bold text-foreground">{groupDigits(totalSavings.toString())} WLD</span>
            </p>
          </div>
        </div>

        {/* 우측: 목표 프리셋 버튼 및 진행 바 */}
        <div className="flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">{c('ringPresetLabel')}</span>
              <span className="text-xs font-mono font-bold text-sky-500">
                {c('ringTarget', { amount: groupDigits(currentTarget.toString()) })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_GOALS.map((preset) => {
                const isSelected = selectedGoal === preset.target;
                return (
                  <button
                    key={preset.target}
                    type="button"
                    onClick={() => setSelectedGoal(preset.target)}
                    className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 text-foreground ring-1 ring-sky-500/50 shadow-sm'
                        : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <span className="text-xs font-bold">{c(preset.label)}</span>
                    <span className="text-[11px] font-mono mt-0.5 font-medium">
                      {groupDigits(preset.target.toString())} WLD
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 사용자 직접 입력 폼 */}
            <form onSubmit={handleCustomGoalSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="number"
                placeholder={c('ringCustomPlaceholder')}
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                className="flex-1 rounded-xl border border-border/70 bg-background/80 px-3.5 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="rounded-xl border border-border/80 bg-foreground/10 px-4 py-2 text-xs font-bold text-foreground transition-all hover:bg-foreground/20 active:scale-95"
              >
                {c('ringApply')}
              </button>
            </form>
          </div>

          {/* 달성 상태 카드 */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-foreground">
                  {totalSavings >= currentTarget
                    ? c('ringExceeded')
                    : c('ringRemaining', { amount: groupDigits((currentTarget - totalSavings).toString()) })}
                </span>
              </div>
              <span className="font-mono text-muted-foreground text-[11px]">
                {c('ringBreakdown', { bank: groupDigits(bankBalance), bonds: groupDigits(bondsTotal) })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 가상 채권 복리 계산기 드로어/패널 */}
      {isCalculatorOpen && (
        <div className="mt-6 border-t border-border/60 pt-6 animate-in fade-in-50 duration-300">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-sky-500" />
              <h3 className="text-sm font-bold text-foreground">{c('ringCalcTitle')}</h3>
              <span className="text-[10px] text-muted-foreground font-medium">
                {c('ringCalcSubtitle')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 원금 입력 */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {c('ringPrincipal')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10000"
                    min="10000"
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-mono font-bold text-foreground focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 만기 일수 */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {c('ringDays')}
                </label>
                <select
                  value={calcDays}
                  onChange={(e) => setCalcDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-sky-500 focus:outline-none"
                >
                  <option value={7}>{c('ringOption7')}</option>
                  <option value={14}>{c('ringOption14')}</option>
                  <option value={30}>{c('ringOption30')}</option>
                  <option value={60}>{c('ringOption60')}</option>
                </select>
              </div>

              {/* 일일 금리 */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {c('ringRate')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10"
                    value={calcRateBps}
                    onChange={(e) => setCalcRateBps(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-mono font-bold text-foreground focus:border-sky-500 focus:outline-none"
                  />
                  <span className="text-xs font-mono font-semibold text-muted-foreground shrink-0">
                    {c('ringRatePerDay', { rate: (calcRateBps / 100).toFixed(2) })}
                  </span>
                </div>
              </div>
            </div>

            {/* 계산 결과 서머리 */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-sky-500/15 pt-3">
              <div className="rounded-xl bg-background/60 p-3 border border-border/50">
                <span className="text-[11px] text-muted-foreground font-medium">{c('ringExpectedInterest')}</span>
                <p className="text-base font-black font-mono text-emerald-500 mt-0.5">
                  +{groupDigits(calculatedReturn.toString())} WLD
                </p>
              </div>
              <div className="rounded-xl bg-background/60 p-3 border border-border/50">
                <span className="text-[11px] text-muted-foreground font-medium">{c('ringMaturityTotal')}</span>
                <p className="text-base font-black font-mono text-foreground mt-0.5">
                  {groupDigits(calculatedTotal.toString())} WLD
                </p>
              </div>
              <div className="rounded-xl bg-sky-500/10 p-3 border border-sky-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-sky-600 dark:text-sky-300 font-bold">{c('ringMultiple')}</span>
                  <p className="text-base font-black font-mono text-sky-600 dark:text-sky-400 mt-0.5">
                    {c('ringNetGain', { pct: ((calculatedTotal / (calcPrincipal || 1)) * 100 - 100).toFixed(1) })}
                  </p>
                </div>
                <Sparkles className="size-5 text-sky-500 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
