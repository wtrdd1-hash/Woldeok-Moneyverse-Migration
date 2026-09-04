'use client';

import React, { useState, useTransition } from 'react';
import type { MacroEconomyV2, UserAssetInspectV2 } from './macro-v2-types';
import {
  toggleKillswitchAction,
  updateKnobsV2Action,
  inspectUserAction,
  overrideUserAssetAction,
} from './actions';

interface AdminControlCenterV2Props {
  readonly initialData: MacroEconomyV2;
}

export function AdminControlCenterV2({ initialData }: AdminControlCenterV2Props) {
  const [data, setData] = useState<MacroEconomyV2>(initialData);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Policy form state
  const policy = data.policy;
  const [depositRateBps, setDepositRateBps] = useState(policy.daily_deposit_interest_bps);
  const [bond7dBps, setBond7dBps] = useState(policy.bond_7d_yield_bps);
  const [bond30dBps, setBond30dBps] = useState(policy.bond_30d_yield_bps);
  const [loanRateBps, setLoanRateBps] = useState(policy.loan_daily_interest_bps);

  // User inspector state
  const [searchUserId, setSearchUserId] = useState('');
  const [inspectedUser, setInspectedUser] = useState<UserAssetInspectV2 | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // User override state
  const [overrideAsset, setOverrideAsset] = useState<'wallet' | 'deposit' | 'loan'>('wallet');
  const [overrideDirection, setOverrideDirection] = useState<'grant' | 'revoke'>('grant');
  const [overrideAmount, setOverrideAmount] = useState<number>(100);
  const [overrideReason, setOverrideReason] = useState<string>('운영팀 정기 밸런스 조정');
  const [overrideLoading, setOverrideLoading] = useState(false);

  const formatNumber = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('ko-KR');
  };

  const handleToggleKillswitch = (scope: string, current: boolean) => {
    const next = !current;
    if (scope === 'master' && next) {
      if (!confirm('⚠️ 경고: 마스터 킬스위치를 켜면 전체 가상경제 시스템의 화폐 발행 및 거래가 즉시 정지됩니다. 진행하시겠습니까?')) {
        return;
      }
    }
    startTransition(async () => {
      const res = await toggleKillswitchAction(scope, next);
      if (res.status === 'ok') {
        setStatusMessage({ type: 'ok', text: res.message || '성공적으로 처리되었습니다.' });
        setData(prev => {
          const nextPolicy = { ...prev.policy };
          if (scope === 'master') nextPolicy.master_killswitch_active = next;
          if (scope === 'financial') nextPolicy.banking_circuit_broken = next;
          if (scope === 'business') nextPolicy.businesses_circuit_broken = next;
          if (scope === 'exchange') nextPolicy.market_circuit_broken = next;
          if (scope === 'auto_balancing') nextPolicy.auto_balancing_active = next;
          return { ...prev, policy: nextPolicy };
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message || '오류가 발생했습니다.' });
      }
    });
  };

  const handleUpdateKnobs = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateKnobsV2Action(depositRateBps, bond7dBps, bond30dBps, loanRateBps);
      if (res.status === 'ok') {
        setStatusMessage({ type: 'ok', text: res.message || '성공적으로 처리되었습니다.' });
        setData(prev => ({
          ...prev,
          policy: {
            ...prev.policy,
            daily_deposit_interest_bps: depositRateBps,
            bond_7d_yield_bps: bond7dBps,
            bond_30d_yield_bps: bond30dBps,
            loan_daily_interest_bps: loanRateBps,
          },
        }));
      } else {
        setStatusMessage({ type: 'error', text: res.message || '오류가 발생했습니다.' });
      }
    });
  };

  const handleInspectUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchUserId.trim()) return;
    setInspectLoading(true);
    setInspectError(null);
    try {
      const res = await inspectUserAction(searchUserId.trim());
      if (res.ok && res.data) {
        setInspectedUser(res.data as unknown as UserAssetInspectV2);
      } else {
        setInspectError(res.error || '유저 정보를 찾을 수 없습니다.');
        setInspectedUser(null);
      }
    } catch {
      setInspectError('유저 조회 중 오류가 발생했습니다.');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleOverrideUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedUser) return;
    if (overrideAmount <= 0) {
      alert('금액은 1 WLD 이상이어야 합니다.');
      return;
    }
    if (overrideReason.trim().length < 5) {
      alert('사유를 5자 이상 입력해 주세요.');
      return;
    }
    const confirmMsg = `[유저: ${inspectedUser.display_name || inspectedUser.user_id}]\n대상: ${overrideAsset}\n방향: ${overrideDirection === 'grant' ? '지급(+)' : '회수(-)'}\n금액: ${formatNumber(overrideAmount)} WLD\n\n정말 원장에 즉시 집행하시겠습니까?`;
    if (!confirm(confirmMsg)) return;

    setOverrideLoading(true);
    try {
      const res = await overrideUserAssetAction(
        inspectedUser.user_id,
        overrideAsset,
        overrideAmount,
        overrideDirection,
        overrideReason,
      );
      if (res.status === 'ok') {
        setStatusMessage({ type: 'ok', text: res.message || '성공적으로 처리되었습니다.' });
        // Refresh inspected user
        handleInspectUser();
      } else {
        setStatusMessage({ type: 'error', text: res.message || '오류가 발생했습니다.' });
      }
    } finally {
      setOverrideLoading(false);
    }
  };

  const faucetToday = data.faucet_today || 0;
  const sinkToday = data.sink_today || 0;
  const netFlow = data.net_flow_today || 0;
  const maxFlow = Math.max(faucetToday, sinkToday, 1);
  const faucetPercent = Math.min(100, Math.round((faucetToday / maxFlow) * 100));
  const sinkPercent = Math.min(100, Math.round((sinkToday / maxFlow) * 100));

  return (
    <div className="space-y-8">
      {/* 1. Global Emergency & Circuit Breaker Banner */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-xl ${
        policy.master_killswitch_active
          ? 'bg-rose-950/40 border-rose-600/80 shadow-rose-950/50 text-rose-100'
          : 'bg-slate-900/80 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className={`inline-block w-3.5 h-3.5 rounded-full ${
                policy.master_killswitch_active ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
              }`} />
              <h2 className="text-xl font-bold tracking-tight">
                {policy.master_killswitch_active
                  ? '🚨 경제 마스터 킬스위치 가동 중 (전체 시스템 비상 정지)'
                  : '🛡️ 가상경제 통합 관제 센터 2.0 (정상 가동)'}
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              비상 시 통화 인플레이션 차단 및 모듈별(금융·사업·거래소) 서킷 브레이커를 즉각 발동할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Master Killswitch Button */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggleKillswitch('master', policy.master_killswitch_active)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                policy.master_killswitch_active
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              }`}
            >
              {policy.master_killswitch_active ? '시스템 정상 가동으로 복구' : '비상 마스터 킬스위치 발동'}
            </button>
          </div>
        </div>

        {/* Sub Circuit Breakers */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs">
              <div className="font-semibold text-slate-200">🏦 금융 서킷브레이커</div>
              <div className="text-slate-400 mt-0.5">예금·대출·국채 발행</div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggleKillswitch('financial', policy.banking_circuit_broken)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                policy.banking_circuit_broken ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {policy.banking_circuit_broken ? '차단됨' : '정상'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs">
              <div className="font-semibold text-slate-200">🏢 사업체 서킷브레이커</div>
              <div className="text-slate-400 mt-0.5">지분 거래·배당 집행</div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggleKillswitch('business', policy.businesses_circuit_broken)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                policy.businesses_circuit_broken ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {policy.businesses_circuit_broken ? '차단됨' : '정상'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs">
              <div className="font-semibold text-slate-200">📈 거래소 서킷브레이커</div>
              <div className="text-slate-400 mt-0.5">가상 주식 매매</div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggleKillswitch('exchange', policy.market_circuit_broken)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                policy.market_circuit_broken ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {policy.market_circuit_broken ? '차단됨' : '정상'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs">
              <div className="font-semibold text-slate-200">🤖 스마트 자동 밸런싱</div>
              <div className="text-slate-400 mt-0.5">AI 통화량 자율 제어</div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggleKillswitch('auto_balancing', policy.auto_balancing_active)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                policy.auto_balancing_active ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {policy.auto_balancing_active ? '자동 ON' : '수동 OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Status feedback message */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between ${
          statusMessage.type === 'ok' ? 'bg-emerald-950/50 border border-emerald-800/80 text-emerald-200' : 'bg-rose-950/50 border border-rose-800/80 text-rose-200'
        }`}>
          <span>{statusMessage.text}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-xs opacity-75 hover:opacity-100">✕</button>
        </div>
      )}

      {/* 2. Macro Indicators & Glassmorphism Flow Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-xl space-y-3">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">M2 총 유효 통화량</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{formatNumber(data.m2_supply)}</span>
            <span className="text-sm font-bold text-amber-400">WLD</span>
          </div>
          <div className="pt-2 text-xs text-slate-400 flex justify-between border-t border-slate-800">
            <span>시중 현금: {formatNumber(data.cash_total)} WLD</span>
            <span>은행 예금: {formatNumber(data.bank_total)} WLD</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">24시간 넷 플로우</span>
            {data.inflation_alert && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                인플레이션 위험
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netFlow > 0 ? `+${formatNumber(netFlow)}` : formatNumber(netFlow)}
            </span>
            <span className="text-sm font-bold text-slate-400">WLD / 24h</span>
          </div>
          <div className="pt-2 text-xs text-slate-400 flex justify-between border-t border-slate-800">
            <span className="text-cyan-400">발행: +{formatNumber(faucetToday)} WLD</span>
            <span className="text-amber-400">소모: -{formatNumber(sinkToday)} WLD</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-xl space-y-3">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">금융 포털 수신고 현황</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-400">{formatNumber(data.bonds_stats.holding_principal)}</span>
            <span className="text-sm font-bold text-slate-400">WLD 국채 잔존</span>
          </div>
          <div className="pt-2 text-xs text-slate-400 flex justify-between border-t border-slate-800">
            <span>국채 {data.bonds_stats.holding_count}건 보유</span>
            <span className="text-rose-400">대출 잔존: {formatNumber(data.loans_stats.active_outstanding)} WLD</span>
          </div>
        </div>
      </div>

      {/* Glassmorphism SVG Faucet vs Sink Flow Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              🌊 실시간 유입(Faucet) vs 회수(Sink) 다이내믹 플로우 차트
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              직업/보상/퀘스트 유입량 대비 상점/수수료/카지노/세금의 소모율을 비교합니다.
            </p>
          </div>
          <div className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            비율: {sinkToday > 0 ? (faucetToday / sinkToday).toFixed(2) : '∞'} : 1
          </div>
        </div>

        {/* Dynamic Comparison Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-cyan-400 font-semibold">💧 유입 통화 (Faucet): +{formatNumber(faucetToday)} WLD</span>
              <span className="text-slate-400">{faucetPercent}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${faucetPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-amber-400 font-semibold">🔥 소모/회수 통화 (Sink): -{formatNumber(sinkToday)} WLD</span>
              <span className="text-slate-400">{sinkPercent}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${sinkPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Smart Auto-Balancing & Economic Knobs Tuning (A4) */}
      <div className="p-6 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              ⚙️ 스마트 자동 밸런싱 & 경제 정책 금리 튜닝 (A4)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              자동 모드가 켜져 있으면 인플레이션 발생 시 시스템이 자율적으로 금리를 인상합니다. 관리자가 즉시 수동 오버라이드할 수도 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">자동 제어 모드:</span>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
              policy.auto_balancing_active ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {policy.auto_balancing_active ? '자율 조절 ON' : '수동 조절만 허용'}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateKnobs} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Daily Deposit Interest */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">일일 복리 예금 금리</span>
                <span className="font-mono text-cyan-400 font-bold">{(depositRateBps / 100).toFixed(2)}% / 일</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="1"
                value={depositRateBps}
                onChange={e => setDepositRateBps(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0.0%</span>
                <span>{depositRateBps} bps</span>
                <span>5.0%</span>
              </div>
            </div>

            {/* 7-day Bond Yield */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">7일 국채 만기 수익률</span>
                <span className="font-mono text-sky-400 font-bold">{(bond7dBps / 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={bond7dBps}
                onChange={e => setBond7dBps(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0.0%</span>
                <span>{bond7dBps} bps</span>
                <span>10.0%</span>
              </div>
            </div>

            {/* 30-day Bond Yield */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">30일 국채 만기 수익률</span>
                <span className="font-mono text-indigo-400 font-bold">{(bond30dBps / 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={bond30dBps}
                onChange={e => setBond30dBps(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0.0%</span>
                <span>{bond30dBps} bps</span>
                <span>20.0%</span>
              </div>
            </div>

            {/* Loan Daily Rate */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">대출 일일 이자율</span>
                <span className="font-mono text-amber-400 font-bold">{(loanRateBps / 100).toFixed(2)}% / 일</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="5"
                value={loanRateBps}
                onChange={e => setLoanRateBps(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0.0%</span>
                <span>{loanRateBps} bps</span>
                <span>10.0%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-950/50 active:scale-95 disabled:opacity-50"
            >
              {isPending ? '정책 파라미터 적용 중...' : '경제 정책 파라미터 즉시 적용'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. User Asset Inspector & Manual Override Console (A4: Max Intervention) */}
      <div className="p-6 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            🔍 유저 자산 정밀 인스펙터 & 1 WLD 단위 강제 개입 콘솔 (A4)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            관리자가 특정 사용자의 지갑, 예금, 대출, 직업, 사업체를 원스톱 조회하고 1 WLD 단위로 강제 회수/지급을 원장에 복식부기로 집행합니다.
          </p>
        </div>

        {/* User Search Bar */}
        <form onSubmit={handleInspectUser} className="flex gap-3">
          <input
            type="text"
            placeholder="유저 UUID (예: 39fd17cf-8325-427d-a0c9-39688fa0a748)"
            value={searchUserId}
            onChange={e => setSearchUserId(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={inspectLoading || !searchUserId.trim()}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {inspectLoading ? '조회 중...' : '유저 자산 조회'}
          </button>
        </form>

        {inspectError && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
            {inspectError}
          </div>
        )}

        {/* Inspected User Profile & Intervention Card */}
        {inspectedUser && (
          <div className="space-y-6 p-6 rounded-xl bg-slate-950/80 border border-slate-800">
            {/* User Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-mono">{inspectedUser.user_id}</span>
                <h4 className="text-lg font-bold text-white">
                  {inspectedUser.display_name || '(닉네임 미설정)'}
                </h4>
              </div>
              <div className="text-xs text-slate-400">
                {inspectedUser.job ? (
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {inspectedUser.job.job_type} (Lv.{inspectedUser.job.level} / Exp.{inspectedUser.job.experience})
                  </span>
                ) : (
                  <span className="text-slate-500">직업 없음</span>
                )}
              </div>
            </div>

            {/* Asset Breakdown Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">지갑 잔액 (Wallet)</span>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {formatNumber(inspectedUser.wallet_balance)} <span className="text-xs font-normal">WLD</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">은행 정기예금 (Deposit)</span>
                <div className="text-xl font-black text-cyan-400 mt-1">
                  {formatNumber(inspectedUser.bank_deposit_balance)} <span className="text-xs font-normal">WLD</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">대출 잔존 채무 (Loan)</span>
                <div className="text-xl font-black text-rose-400 mt-1">
                  {formatNumber(inspectedUser.loan_debt_balance)} <span className="text-xs font-normal">WLD</span>
                </div>
              </div>
            </div>

            {/* Business Holdings if any */}
            {inspectedUser.businesses && inspectedUser.businesses.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">보유 사업체 지분: </span>
                {inspectedUser.businesses.map(b => (
                  <span key={b.symbol} className="inline-block mr-3 text-slate-300">
                    {b.name} ({b.symbol}): {b.share_count}주
                  </span>
                ))}
              </div>
            )}

            {/* Manual Intervention Form */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                ⚡ 1 WLD 단위 강제 원장 개입 (회수 / 지급)
              </h5>

              <form onSubmit={handleOverrideUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">대상 자산</label>
                    <select
                      value={overrideAsset}
                      onChange={e => setOverrideAsset(e.target.value as 'wallet' | 'deposit' | 'loan')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="wallet">지갑 잔액 (Wallet)</option>
                      <option value="deposit">은행 예금 (Deposit)</option>
                      <option value="loan">대출 채무 (Loan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">개입 방향</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOverrideDirection('grant')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                          overrideDirection === 'grant'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        + 강제 지급
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverrideDirection('revoke')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                          overrideDirection === 'revoke'
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        - 강제 회수
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">조정 금액 (WLD)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={overrideAmount}
                      onChange={e => setOverrideAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Amount presets */}
                <div className="flex gap-2 text-xs">
                  <span className="text-slate-500 self-center">빠른 금액:</span>
                  {[10, 100, 1000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setOverrideAmount(amt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    >
                      +{formatNumber(amt)}
                    </button>
                  ))}
                  {overrideDirection === 'revoke' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (overrideAsset === 'wallet') setOverrideAmount(inspectedUser.wallet_balance);
                        if (overrideAsset === 'deposit') setOverrideAmount(inspectedUser.bank_deposit_balance);
                        if (overrideAsset === 'loan') setOverrideAmount(inspectedUser.loan_debt_balance);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
                    >
                      전액 회수
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">개입 사유 (감사 로그 보존)</label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    placeholder="조정 사유를 구체적으로 입력하세요 (최소 5자)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={overrideLoading}
                    className={`px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                      overrideDirection === 'grant'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                    }`}
                  >
                    {overrideLoading
                      ? '원장 집행 중...'
                      : `${overrideDirection === 'grant' ? '강제 지급 (+)' : '강제 회수 (-)'} 집행`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
