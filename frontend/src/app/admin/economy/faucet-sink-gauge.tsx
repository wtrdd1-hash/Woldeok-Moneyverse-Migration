'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Flame, Droplets, Coins, Percent } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FaucetSinkStats {
  readonly summary: {
    readonly total_minted?: string | number;
    readonly total_burned?: string | number;
    readonly total_circulating?: string | number;
    readonly today_minted?: string | number;
    readonly today_burned?: string | number;
  };
  readonly daily: Array<{
    readonly stat_date: string;
    readonly faucet_amount: string | number;
    readonly sink_amount: string | number;
    readonly tax_amount: string | number;
    readonly net_change: string | number;
    readonly sink_ratio_percent: string | number;
  }>;
}

interface FaucetSinkGaugeProps {
  readonly stats: FaucetSinkStats | null;
}

export function FaucetSinkGauge({ stats }: FaucetSinkGaugeProps) {
  if (!stats) return null;

  const summary = stats.summary || {};
  const totalCirculating = Number(summary.total_circulating || 0);
  const todayMinted = Number(summary.today_minted || 0);
  const todayBurned = Number(summary.today_burned || 0);
  const totalMinted = Number(summary.total_minted || 0);
  const totalBurned = Number(summary.total_burned || 0);

  const todayNet = todayMinted - todayBurned;
  const todayRatio = todayMinted > 0 ? ((todayBurned / todayMinted) * 100).toFixed(1) : '0.0';

  // Calculate percentage of bar (clamped 0-100)
  const totalFlow = todayMinted + todayBurned;
  const mintedPercent = totalFlow > 0 ? (todayMinted / totalFlow) * 100 : 50;
  const burnedPercent = totalFlow > 0 ? (todayBurned / totalFlow) * 100 : 50;

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-card p-6 shadow-lg mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            REALTIME FAUCET · SINK ENGINE
          </span>
          <h3 className="text-lg font-bold text-foreground mt-1">WLD 통화 유통 및 소각(Sink) 실시간 관제</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">소각율(Sink Ratio):</span>
          <span
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-extrabold border flex items-center gap-1',
              Number(todayRatio) >= 50
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40',
            )}
          >
            <Percent className="size-3" />
            {todayRatio}%
          </span>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Circulating */}
        <div className="rounded-2xl border border-border/50 bg-surface/50 p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold">현재 총 유통 통화량</span>
            <Coins className="size-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-foreground">
            {totalCirculating.toLocaleString()}{' '}
            <span className="text-xs text-amber-500 font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            누적 발행: {totalMinted.toLocaleString()} · 소각: {totalBurned.toLocaleString()}
          </p>
        </div>

        {/* Today Minted (Faucet) */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-xs font-semibold">오늘의 배출량 (Faucet)</span>
            <Droplets className="size-4 text-blue-400" />
          </div>
          <p className="text-xl font-extrabold text-blue-400">
            +{todayMinted.toLocaleString()}{' '}
            <span className="text-xs font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">퀘스트/활동 보상/이자 지급</p>
        </div>

        {/* Today Burned (Sink) */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="text-xs font-semibold">오늘의 소각량 (Sink)</span>
            <Flame className="size-4 text-red-400" />
          </div>
          <p className="text-xl font-extrabold text-red-400">
            -{todayBurned.toLocaleString()}{' '}
            <span className="text-xs font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">상점 2.0 구매/수수료 100% 소각</p>
        </div>

        {/* Today Net Change */}
        <div className="rounded-2xl border border-border/50 bg-surface/50 p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold">금일 순증감 (Net Flow)</span>
            {todayNet >= 0 ? (
              <ArrowUpRight className="size-4 text-amber-500" />
            ) : (
              <ArrowDownRight className="size-4 text-emerald-400" />
            )}
          </div>
          <p
            className={cn(
              'text-xl font-extrabold',
              todayNet >= 0 ? 'text-amber-500' : 'text-emerald-400',
            )}
          >
            {todayNet >= 0 ? `+${todayNet.toLocaleString()}` : todayNet.toLocaleString()}{' '}
            <span className="text-xs font-bold">WLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {todayNet >= 0 ? '통화 팽창 중' : '통화 수축 디플레이션 중'}
          </p>
        </div>
      </div>

      {/* Visual Balance Bar */}
      <div className="rounded-2xl bg-surface/60 border border-border/40 p-4 mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-blue-400 flex items-center gap-1">
            <Droplets className="size-3.5" /> 배출(Faucet) {mintedPercent.toFixed(1)}%
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <Flame className="size-3.5" /> 소각(Sink) {burnedPercent.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-black/40 overflow-hidden flex">
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
        <div className="rounded-2xl border border-border/40 overflow-hidden">
          <div className="px-4 py-2 bg-surface/70 border-b border-border/40 text-[11px] font-bold text-muted-foreground">
            최근 일자별 배출(Faucet) vs 소각(Sink) 내역
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/30 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/20">
                <tr>
                  <th className="px-4 py-2">일자 (KST)</th>
                  <th className="px-4 py-2 text-blue-400">배출량 (Faucet)</th>
                  <th className="px-4 py-2 text-red-400">소각량 (Sink)</th>
                  <th className="px-4 py-2">순증감 (Net)</th>
                  <th className="px-4 py-2 text-right">소각률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium">
                {stats.daily.slice(0, 7).map((d) => (
                  <tr key={d.stat_date} className="hover:bg-surface/40">
                    <td className="px-4 py-2 text-muted-foreground font-mono">{d.stat_date}</td>
                    <td className="px-4 py-2 text-blue-400 font-bold">
                      +{Number(d.faucet_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-red-400 font-bold">
                      -{Number(d.sink_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 font-bold text-foreground">
                      {Number(d.net_change) >= 0
                        ? `+${Number(d.net_change).toLocaleString()}`
                        : Number(d.net_change).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-extrabold text-amber-500">
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
