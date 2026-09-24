'use client';

import React, { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Coins,
  Gauge,
  Layers,
  PieChart,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import type { MonetaryVelocityTelemetry, MonetaryVelocityWindow } from './macro-v2-types';

interface MonetaryVelocityCardProps {
  readonly telemetry: MonetaryVelocityTelemetry | null;
}

export function MonetaryVelocityCard({ telemetry }: MonetaryVelocityCardProps) {
  const [selectedWindow, setSelectedWindow] = useState<'24h' | '7d' | '30d'>('24h');

  if (!telemetry) return null;

  const currentWindow: MonetaryVelocityWindow = telemetry.windows[selectedWindow];
  const isNetPositive = !currentWindow.net_expansion_wld.startsWith('-');

  return (
    <Card className="border border-border/80 bg-card shadow-sm mb-6 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                AUTHORITATIVE MONETARY VELOCITY ENGINE
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {telemetry.policy_version}
              </Badge>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-1.5 flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              통화 유통속도 및 코호트 실질 구매력 다구간 관제 (Velocity & Cohort Purchasing Power)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              단위시간당 화폐 발행·소각 속도, 유동 잔액 분위수(P50~P99), 부의 집중도 및 코호트별 구매력 텔레메트리 (기획서 §4 준용)
            </CardDescription>
          </div>

          {/* 24h / 7d / 30d Window Selector Tabs */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
            {(['24h', '7d', '30d'] as const).map((win) => (
              <Button
                key={win}
                size="sm"
                variant={selectedWindow === win ? 'default' : 'ghost'}
                onClick={() => setSelectedWindow(win)}
                className={`h-7 px-3 text-xs font-semibold rounded-lg ${
                  selectedWindow === win ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {win === '24h' ? '24시간' : win === '7d' ? '7일 누적' : '30일 거시'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-2 grid gap-6">
        {/* 1. Multi-window Velocity & Net Flow Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Velocity Proxy */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-medium text-[11px]">화폐 유통속도 (Velocity Proxy)</span>
              <Gauge className="size-3.5 text-primary" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-foreground flex items-baseline gap-1">
              {currentWindow.velocity_proxy}{' '}
              <span className="text-xs font-normal text-muted-foreground">회전/기간</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              총 거래대금 / 활성 유통통화량 비율
            </p>
          </div>

          {/* Gross Faucet */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
              <span className="font-medium text-[11px]">{selectedWindow} 총 발행량 (Faucet)</span>
              <ArrowDownRight className="size-3.5" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-blue-700 dark:text-blue-300">
              +{groupDigits(currentWindow.gross_faucet_wld)}{' '}
              <span className="text-xs font-normal">WLD</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              노동, 이자, 이벤트 신규 화폐 유입
            </p>
          </div>

          {/* Hard Sink */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
              <span className="font-medium text-[11px]">{selectedWindow} 총 소각량 (Hard Sink)</span>
              <ArrowUpRight className="size-3.5" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
              -{groupDigits(currentWindow.hard_sink_wld)}{' '}
              <span className="text-xs font-normal">WLD</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              세금, 수수료, 명예 소비 영구 제거
            </p>
          </div>

          {/* Net Expansion */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-medium text-[11px]">{selectedWindow} 순통화 증감 (Net)</span>
              {isNetPositive ? (
                <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="size-3.5 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div
              className={`mt-2 text-xl font-bold font-mono ${
                isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isNetPositive ? `+${groupDigits(currentWindow.net_expansion_wld)}` : groupDigits(currentWindow.net_expansion_wld)}{' '}
              <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              발행 - 소각 순통화 팽창/수축률
            </p>
          </div>
        </div>

        {/* 2. Wealth Distribution Percentiles & Circulating Supply */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Circulation Breakdown & Percentiles */}
          <div className="rounded-xl border border-border/70 bg-surface/30 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <BarChart3 className="size-3.5 text-primary" />
                유동 잔액 백분위수 및 통화 구성 (Liquid Balances Distribution)
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                M2: {groupDigits(telemetry.supply_distribution.m2_total_wld)} WLD
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center">
              <div className="rounded-lg bg-background border p-2">
                <span className="block text-[10px] text-muted-foreground">P50 (중위값)</span>
                <span className="font-mono font-bold text-xs text-foreground">
                  {groupDigits(telemetry.supply_distribution.percentiles.p50_wld)} WLD
                </span>
              </div>
              <div className="rounded-lg bg-background border p-2">
                <span className="block text-[10px] text-muted-foreground">P90 (상위 10%)</span>
                <span className="font-mono font-bold text-xs text-foreground">
                  {groupDigits(telemetry.supply_distribution.percentiles.p90_wld)} WLD
                </span>
              </div>
              <div className="rounded-lg bg-background border p-2">
                <span className="block text-[10px] text-muted-foreground">P95 (상위 5%)</span>
                <span className="font-mono font-bold text-xs text-foreground">
                  {groupDigits(telemetry.supply_distribution.percentiles.p95_wld)} WLD
                </span>
              </div>
              <div className="rounded-lg bg-background border p-2">
                <span className="block text-[10px] text-muted-foreground">P99 (상위 1%)</span>
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                  {groupDigits(telemetry.supply_distribution.percentiles.p99_wld)} WLD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              <span>활성 유통: <strong className="text-foreground font-mono">{groupDigits(telemetry.supply_distribution.active_circulating_wld)} WLD</strong></span>
              <span>휴면 잔액: <strong className="text-foreground font-mono">{groupDigits(telemetry.supply_distribution.dormant_balances_wld)} WLD</strong></span>
            </div>
          </div>

          {/* Cohort Purchasing Power & Concentration */}
          <div className="rounded-xl border border-border/70 bg-surface/30 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-emerald-600" />
                계층별 실질 구매력 지수 및 집중도 (Cohort Purchasing Power)
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                정상 보호중
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="rounded-lg bg-background border p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">신규 유저 바스켓</span>
                  <ShieldCheck className="size-3 text-emerald-600" />
                </div>
                <div className="mt-1 font-mono font-extrabold text-sm text-foreground">
                  {telemetry.cohort_purchasing_power.new_user_core_basket_index.toFixed(1)}{' '}
                  <span className="text-[10px] text-muted-foreground font-normal">pts</span>
                </div>
                <span className="text-[9px] text-muted-foreground block mt-0.5">기초 자원 구매력 보존</span>
              </div>

              <div className="rounded-lg bg-background border p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">중간 소득층 구매력</span>
                  <ShieldCheck className="size-3 text-emerald-600" />
                </div>
                <div className="mt-1 font-mono font-extrabold text-sm text-foreground">
                  {telemetry.cohort_purchasing_power.middle_income_purchasing_index.toFixed(1)}{' '}
                  <span className="text-[10px] text-muted-foreground font-normal">pts</span>
                </div>
                <span className="text-[9px] text-muted-foreground block mt-0.5">일반 생활재 물가 안정</span>
              </div>

              <div className="rounded-lg bg-background border p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">고자산 싱크 흡수율</span>
                  <PieChart className="size-3 text-primary" />
                </div>
                <div className="mt-1 font-mono font-extrabold text-sm text-primary">
                  {telemetry.cohort_purchasing_power.high_wealth_sink_absorption_index.toFixed(1)}{' '}
                  <span className="text-[10px] text-muted-foreground font-normal">%</span>
                </div>
                <span className="text-[9px] text-muted-foreground block mt-0.5">명예/사치재 소각 소화율</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              <span>상위 1% 부의 집중도: <strong className="text-foreground font-mono">{telemetry.supply_distribution.concentration.top_1_percent_share_pct}%</strong></span>
              <span>상위 10% 집중도: <strong className="text-foreground font-mono">{telemetry.supply_distribution.concentration.top_10_percent_share_pct}%</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
