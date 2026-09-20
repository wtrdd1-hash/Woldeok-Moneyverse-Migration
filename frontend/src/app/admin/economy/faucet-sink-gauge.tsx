'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Flame, Droplets, Coins, Percent } from 'lucide-react';
import { cn } from '@/lib/cn';
import { groupDigits } from '@/lib/money';

export interface FaucetSinkStats {
  readonly summary: {
    readonly total_minted?: string;
    readonly total_burned?: string;
    readonly total_circulating?: string;
    readonly today_minted?: string;
    readonly today_burned?: string;
  };
  readonly daily: Array<{
    readonly stat_date: string;
    readonly faucet_amount: string;
    readonly sink_amount: string;
    readonly tax_amount: string;
    readonly net_change: string;
    readonly sink_ratio_percent: string;
  }>;
}

interface FaucetSinkGaugeProps {
  readonly stats: FaucetSinkStats | null;
}

export function FaucetSinkGauge({ stats }: FaucetSinkGaugeProps) {
  if (!stats) return null;

  const summary = stats.summary || {};
  const totalCirculating = summary.total_circulating ?? '0';
  const todayMinted = summary.today_minted ?? '0';
  const todayBurned = summary.today_burned ?? '0';
  const totalMinted = summary.total_minted ?? '0';
  const totalBurned = summary.total_burned ?? '0';

  const minted = BigInt(todayMinted);
  const burned = BigInt(todayBurned);
  const todayNet = (minted - burned).toString();
  const ratioTenths = minted > 0n ? (burned * 1_000n + minted / 2n) / minted : 0n;
  const todayRatio = `${ratioTenths / 10n}.${ratioTenths % 10n}`;
  const ratioAtLeastHalf = ratioTenths >= 500n;

  const totalFlow = minted + burned;
  const percent = (value: bigint): number =>
    totalFlow > 0n ? Number((value * 100n + totalFlow / 2n) / totalFlow) : 50;
  const mintedPercent = percent(minted);
  const burnedPercent = percent(burned);

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/30 bg-card p-4 sm:p-6 shadow-md mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 inline-block">
            REALTIME FAUCET · SINK ENGINE
          </span>
          <h3 className="text-base sm:text-lg font-bold text-foreground mt-1 tracking-tight">WLD 통화 유통 및 소각(Sink) 실시간 관제</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground font-semibold">소각율(Sink Ratio):</span>
          <span
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-extrabold border flex items-center gap-1',
              ratioAtLeastHalf
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                : 'bg-primary/20 text-primary border-primary/40',
            )}
          >
            <Percent className="size-3" />
            {todayRatio}%
          </span>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6 min-w-0">
        {/* Total Circulating */}
        <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-surface/50 p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold truncate">현재 총 유통 통화량</span>
            <Coins className="size-4 text-primary shrink-0" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-foreground truncate">
            {groupDigits(totalCirculating)}{' '}
            <span className="text-xs text-primary font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            누적 발행: {groupDigits(totalMinted)} · 소각: {groupDigits(totalBurned)}
          </p>
        </div>

        {/* Today Minted (Faucet) */}
        <div className="rounded-xl sm:rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 mb-1">
            <span className="text-xs font-semibold truncate">오늘의 배출량 (Faucet)</span>
            <Droplets className="size-4 text-blue-700 dark:text-blue-300 shrink-0" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-blue-700 dark:text-blue-300 truncate">
            +{groupDigits(todayMinted)}{' '}
            <span className="text-xs font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">퀘스트/활동 보상/이자 지급</p>
        </div>

        {/* Today Burned (Sink) */}
        <div className="rounded-xl sm:rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between text-red-700 dark:text-red-300 mb-1">
            <span className="text-xs font-semibold truncate">오늘의 소각량 (Sink)</span>
            <Flame className="size-4 text-red-700 dark:text-red-300 shrink-0" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-red-700 dark:text-red-300 truncate">
            -{groupDigits(todayBurned)}{' '}
            <span className="text-xs font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">상점 2.0 구매/수수료 100% 소각</p>
        </div>

        {/* Today Net Change */}
        <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-surface/50 p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold truncate">금일 순증감 (Net Flow)</span>
            {!todayNet.startsWith('-') ? (
              <ArrowUpRight className="size-4 text-primary shrink-0" />
            ) : (
              <ArrowDownRight className="size-4 text-emerald-700 dark:text-emerald-300 shrink-0" />
            )}
          </div>
          <p
            className={cn(
              'text-lg sm:text-xl font-extrabold truncate',
              !todayNet.startsWith('-') ? 'text-primary' : 'text-emerald-700 dark:text-emerald-300',
            )}
          >
            {todayNet.startsWith('-') ? groupDigits(todayNet) : `+${groupDigits(todayNet)}`}{' '}
            <span className="text-xs font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {!todayNet.startsWith('-') ? '통화 팽창 중' : '통화 수축 디플레이션 중'}
          </p>
        </div>
      </div>

      {/* Visual Balance Bar */}
      <div className="rounded-xl sm:rounded-2xl bg-surface/60 border border-border/40 p-3.5 sm:p-4 mb-5 sm:mb-6 min-w-0">
        <div className="flex items-center justify-between text-xs font-bold mb-2 min-w-0">
          <span className="text-blue-700 dark:text-blue-300 flex items-center gap-1 truncate">
            <Droplets className="size-3.5 shrink-0" /> 배출 {mintedPercent.toFixed(1)}%
          </span>
          <span className="text-red-700 dark:text-red-300 flex items-center gap-1 truncate">
            <Flame className="size-3.5 shrink-0" /> 소각 {burnedPercent.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
          <div
            style={{ width: `${mintedPercent}%` }}
            className="bg-blue-500 transition-all duration-500"
          />
          <div
            style={{ width: `${burnedPercent}%` }}
            className="bg-red-500 transition-all duration-500"
          />
        </div>
      </div>

      {/* Recent 7 Days Mini Table */}
      {stats.daily.length > 0 && (
        <div className="rounded-xl sm:rounded-2xl border border-border/40 overflow-hidden min-w-0">
          <div className="px-3 sm:px-4 py-2 bg-surface/70 border-b border-border/40 text-[11px] font-bold text-muted-foreground">
            최근 일자별 배출(Faucet) vs 소각(Sink) 내역
          </div>
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/30 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/20">
                <tr>
                  <th className="px-3 sm:px-4 py-2 whitespace-nowrap">일자 (KST)</th>
                  <th className="px-3 sm:px-4 py-2 text-blue-700 dark:text-blue-300 whitespace-nowrap">배출량</th>
                  <th className="px-3 sm:px-4 py-2 text-red-700 dark:text-red-300 whitespace-nowrap">소각량</th>
                  <th className="px-3 sm:px-4 py-2 whitespace-nowrap">순증감</th>
                  <th className="px-3 sm:px-4 py-2 text-right whitespace-nowrap">소각률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium">
                {stats.daily.slice(0, 7).map((d) => (
                  <tr key={d.stat_date} className="hover:bg-surface/40">
                    <td className="px-3 sm:px-4 py-2 text-muted-foreground font-mono whitespace-nowrap">{d.stat_date}</td>
                    <td className="px-3 sm:px-4 py-2 text-blue-700 dark:text-blue-300 font-bold whitespace-nowrap">
                      +{groupDigits(d.faucet_amount)}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-red-700 dark:text-red-300 font-bold whitespace-nowrap">
                      -{groupDigits(d.sink_amount)}
                    </td>
                    <td className="px-3 sm:px-4 py-2 font-bold text-foreground whitespace-nowrap">
                      {d.net_change.startsWith('-') ? groupDigits(d.net_change) : `+${groupDigits(d.net_change)}`}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right font-extrabold text-primary whitespace-nowrap">
                      {d.sink_ratio_percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
