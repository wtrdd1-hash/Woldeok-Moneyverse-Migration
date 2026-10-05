'use client';

import React, { useMemo, useState } from 'react';
import type { AdminUser, AdminStock, ReconciliationHealth, FeatureSwitch } from '../types';

export interface AdminComprehensiveTelemetryMatrixProps {
  users?: readonly AdminUser[];
  stocks?: readonly AdminStock[];
  health?: ReconciliationHealth | null;
  controls?: readonly FeatureSwitch[];
}

type MatrixTab = 'retention' | 'monetary' | 'market' | 'wealth';

export function AdminComprehensiveTelemetryMatrix({
  users = [],
  stocks = [],
  health = null,
  controls = [],
}: AdminComprehensiveTelemetryMatrixProps) {
  const [activeTab, setActiveTab] = useState<MatrixTab>('retention');
  const [excludeAdmin, setExcludeAdmin] = useState(true);

  // 관리자 계정 필터링 (관리자 역할 보유자 또는 관리자 접속 이력 유저)
  const effectiveUsers = useMemo(() => {
    if (!excludeAdmin) return users;
    return users.filter((u) => !u.is_admin && !u.last_admin_at);
  }, [users, excludeAdmin]);

  const excludedAdminCount = useMemo(() => {
    return users.filter((u) => !!u.is_admin || !!u.last_admin_at).length;
  }, [users]);

  // 1. 코호트 & 유저 리텐션 계산 (HAU, DAU, WAU, MAU, 신규가입률, 활동고착도)
  const retentionStats = useMemo(() => {
    const now = Date.now();
    const h1 = 60 * 60 * 1000;
    const d1 = 24 * 60 * 60 * 1000;
    const d7 = 7 * d1;
    const d30 = 30 * d1;

    let hau = 0;
    let dau = 0;
    let wau = 0;
    let mau = 0;
    let newUsersToday = 0;
    let newUsersThisWeek = 0;
    let dormant = 0;

    effectiveUsers.forEach((u) => {
      const lastActiveTime = u.last_seen_at
        ? new Date(u.last_seen_at).getTime()
        : u.last_login_at
          ? new Date(u.last_login_at).getTime()
          : 0;
      const createdTime = u.created_at ? new Date(u.created_at).getTime() : 0;

      const diffActive = now - lastActiveTime;
      const diffCreated = now - createdTime;

      if (lastActiveTime > 0) {
        if (diffActive <= h1) hau++;
        if (diffActive <= d1) dau++;
        if (diffActive <= d7) wau++;
        if (diffActive <= d30) mau++;
        else dormant++;
      } else {
        dormant++;
      }

      if (createdTime > 0) {
        if (diffCreated <= d1) newUsersToday++;
        if (diffCreated <= d7) newUsersThisWeek++;
      }
    });

    const totalUsers = effectiveUsers.length;
    const stickiness = mau > 0 ? ((dau / mau) * 100).toFixed(1) : '0.0';
    const dormantRate = totalUsers > 0 ? ((dormant / totalUsers) * 100).toFixed(1) : '0.0';

    return {
      totalUsers,
      hau,
      dau,
      wau,
      mau,
      stickiness,
      newUsersToday,
      newUsersThisWeek,
      dormant,
      dormantRate,
    };
  }, [effectiveUsers]);

  // 2. 가상 경제 통화량 & 유동성 지표 (M0, M1, M2, 복식부기 건전성, 24h 유동성)
  const monetaryStats = useMemo(() => {
    let m0Cash = 0;
    let m1Bank = 0;
    let bondTotal = 0;
    let stockEvalTotal = 0;
    let m2Total = 0;

    effectiveUsers.forEach((u) => {
      const cash = Number(u.cash_balance) || 0;
      const bank = Number(u.bank_balance) || 0;
      const bond = Number(u.bond_balance) || 0;
      const stockEval = Number(u.stock_eval) || 0;
      const netWorth = Number(u.total_net_worth) || cash + bank + bond + stockEval;

      m0Cash += cash;
      m1Bank += bank;
      bondTotal += bond;
      stockEvalTotal += stockEval;
      m2Total += netWorth;
    });

    const m1Sum = m0Cash + m1Bank;
    const isBalanced = health?.integrity ? health.integrity.ok : true;
    const moneySupplyHealth = health?.available ? (isBalanced ? '정상 일치' : '불일치 감지') : '실측 산출';
    const deltaAmount = health?.integrity ? Number(health.integrity.balanceTotalDeltaAmount) || 0 : 0;
    const treasuryBalance = health?.supply ? Number(health.supply.treasuryBalanceAmount) || 0 : 0;

    return {
      m0Cash,
      m1Bank,
      m1Sum,
      bondTotal,
      stockEvalTotal,
      m2Total,
      moneySupplyHealth,
      ledgerDiff: deltaAmount,
      systemReserve: treasuryBalance,
    };
  }, [effectiveUsers, health]);

  // 3. 가상 주식 시장 마켓 심도 & 거래 지표
  const marketStats = useMemo(() => {
    let totalMarketCap = 0;
    let totalTrades = 0;
    let activeStockCount = 0;
    let haltedStockCount = 0;

    stocks.forEach((s) => {
      const price = Number(s.current_price) || 0;
      const shares = Number(s.shares_outstanding) || 0;
      const trades = Number(s.trades) || 0;

      const marketCap = price * shares;
      totalMarketCap += marketCap;
      totalTrades += trades;

      if (s.active && !s.halt_status) {
        activeStockCount++;
      } else {
        haltedStockCount++;
      }
    });

    const stockCount = stocks.length;
    const avgTradesPerStock = stockCount > 0 ? (totalTrades / stockCount).toFixed(1) : '0.0';

    return {
      totalStocks: stockCount,
      activeStockCount,
      haltedStockCount,
      totalMarketCap,
      totalTrades,
      avgTradesPerStock,
    };
  }, [stocks]);

  // 4. 자산 계층별 5분위 분배율 & 경제 집중도 (Quintile Analysis)
  const wealthQuintiles = useMemo(() => {
    if (effectiveUsers.length === 0) return [];

    const sortedUsers = [...effectiveUsers].sort(
      (a, b) => (Number(b.total_net_worth) || 0) - (Number(a.total_net_worth) || 0)
    );

    const totalNetWorthAll = sortedUsers.reduce(
      (acc, u) => acc + (Number(u.total_net_worth) || 0),
      0
    );

    const quintileSize = Math.max(1, Math.floor(sortedUsers.length / 5));
    const quintiles = [];

    const labels = [
      '5분위 (상위 20% 최상위층)',
      '4분위 (상위 20~40% 상위층)',
      '3분위 (중위 40~60% 중산층)',
      '2분위 (하위 20~40% 차상위층)',
      '1분위 (하위 20% 저소득층)',
    ];

    for (let i = 0; i < 5; i++) {
      const start = i * quintileSize;
      const end = i === 4 ? sortedUsers.length : (i + 1) * quintileSize;
      const group = sortedUsers.slice(start, end);
      const groupCount = group.length;

      const groupWealth = group.reduce(
        (acc, u) => acc + (Number(u.total_net_worth) || 0),
        0
      );
      const avgWealth = groupCount > 0 ? groupWealth / groupCount : 0;
      const shareRatio = totalNetWorthAll > 0 ? (groupWealth / totalNetWorthAll) * 100 : 0;

      quintiles.push({
        label: labels[i],
        count: groupCount,
        groupWealth,
        avgWealth,
        shareRatio: shareRatio.toFixed(2),
      });
    }

    return quintiles;
  }, [effectiveUsers]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-tight">
              실시간 종합 운영 텔레메트리 매트릭스 (Telemetry Operations Matrix)
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Datadog, Stripe, Toss Admin 규격의 실시간 유저 활동 코호트, 통화 유동성, 주식 시장 심도, 5분위 자산 분배율
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 관리자 트래픽 제외 필터 토글 버튼 (44px 터치 타깃) */}
          <button
            type="button"
            onClick={() => setExcludeAdmin((prev) => !prev)}
            title={excludeAdmin ? '현재 관리자 트래픽이 제외되어 순수 유저 데이터만 표시 중입니다. 클릭 시 관리자 포함' : '현재 관리자 트래픽이 포함되어 있습니다. 클릭 시 관리자 제외'}
            className={`min-h-[44px] sm:min-h-9 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              excludeAdmin
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${excludeAdmin ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {excludeAdmin ? `관리자 트래픽 제외됨 (${excludedAdminCount}명)` : '관리자 트래픽 포함됨'}
          </button>

          {/* 탭 전환 버튼 바 (44px 모바일 터치 타깃 준수) */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('retention')}
            className={`min-h-[44px] sm:min-h-9 px-3.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'retention'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            유저 코호트
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monetary')}
            className={`min-h-[44px] sm:min-h-9 px-3.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'monetary'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            통화 유동성 (M0/M1/M2)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className={`min-h-[44px] sm:min-h-9 px-3.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'market'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            주식 시장 심도
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wealth')}
            className={`min-h-[44px] sm:min-h-9 px-3.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'wealth'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5분위 자산 분배율
          </button>
        </div>
      </div>
    </div>

      {/* 탭 1: 유저 코호트 & 리텐션 테이블 */}
      {activeTab === 'retention' && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">지표 구분</th>
                <th className="py-2.5 px-3 font-semibold text-right">집계 수치</th>
                <th className="py-2.5 px-3 font-semibold text-right">비율 / 상태</th>
                <th className="py-2.5 px-3 font-semibold">집계 기준 및 의미</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">HAU (1시간 활성 사용자)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-400 font-bold">
                  {retentionStats.hau.toLocaleString()} 명
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {retentionStats.totalUsers > 0
                    ? ((retentionStats.hau / retentionStats.totalUsers) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">최근 60분 이내 세션 활동 기록 보유 회원</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">DAU (24시간 활성 사용자)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-400 font-bold">
                  {retentionStats.dau.toLocaleString()} 명
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {retentionStats.totalUsers > 0
                    ? ((retentionStats.dau / retentionStats.totalUsers) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">최근 24시간 이내 로그인 또는 거래 활동 회원</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">WAU (7일 주간 활성 사용자)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-400 font-bold">
                  {retentionStats.wau.toLocaleString()} 명
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {retentionStats.totalUsers > 0
                    ? ((retentionStats.wau / retentionStats.totalUsers) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">최근 7일(1주) 이내 접속 이력 회원</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">MAU (30일 월간 활성 사용자)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-blue-400 font-bold">
                  {retentionStats.mau.toLocaleString()} 명
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {retentionStats.totalUsers > 0
                    ? ((retentionStats.mau / retentionStats.totalUsers) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">최근 30일 이내 플랫폼 방문 및 활동 회원</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors bg-blue-950/20">
                <td className="py-2.5 px-3 font-medium text-blue-300">Stickiness (활동 고착도)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-300 font-bold">
                  {retentionStats.stickiness}%
                </td>
                <td className="py-2.5 px-3 text-right text-xs text-amber-400 font-medium">
                  {Number(retentionStats.stickiness) >= 20 ? '건전한 활성도' : '보통 고착도'}
                </td>
                <td className="py-2.5 px-3 text-slate-400">DAU / MAU 비율 (글로벌 핀테크 표준 20% 이상 우수)</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">금일 신규 가입자 (24h)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-teal-400 font-bold">
                  +{retentionStats.newUsersToday.toLocaleString()} 명
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {retentionStats.totalUsers > 0
                    ? ((retentionStats.newUsersToday / retentionStats.totalUsers) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">최근 24시간 내 신규 가입한 가계정/실계정</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">휴면 계정 (30일 이상 미활동)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-400 font-bold">
                  {retentionStats.dormant.toLocaleString()} 명
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-400">
                  {retentionStats.dormantRate}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">마지막 활동 기록이 30일 초과된 유휴 계정</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 탭 2: 통화 유동성 & 복식부기 건전성 */}
      {activeTab === 'monetary' && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">통화 분류</th>
                <th className="py-2.5 px-3 font-semibold text-right">총 발행/보유 잔액</th>
                <th className="py-2.5 px-3 font-semibold text-right">M2 대비 점유율</th>
                <th className="py-2.5 px-3 font-semibold">경제적 정의 및 건전성 검증</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">M0 (협의 통화 / 유동 현금)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-400 font-bold">
                  ₩{monetaryStats.m0Cash.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {monetaryStats.m2Total > 0
                    ? ((monetaryStats.m0Cash / monetaryStats.m2Total) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">유저들의 지갑 내 즉시 사용 가능한 현금 잔고 총합</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">M1 (요구불 예금 포함 통화)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-400 font-bold">
                  ₩{monetaryStats.m1Sum.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {monetaryStats.m2Total > 0
                    ? ((monetaryStats.m1Sum / monetaryStats.m2Total) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">현금(M0) + 중앙은행 수시입출식 예금(₩{monetaryStats.m1Bank.toLocaleString()})</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">국채 및 확정형 채권 발행고</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-400 font-bold">
                  ₩{monetaryStats.bondTotal.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {monetaryStats.m2Total > 0
                    ? ((monetaryStats.bondTotal / monetaryStats.m2Total) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">유저 보유 만기 약정형 국채 채권 잔고</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">가상 주식 평가액 총계</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-400 font-bold">
                  ₩{monetaryStats.stockEvalTotal.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {monetaryStats.m2Total > 0
                    ? ((monetaryStats.stockEvalTotal / monetaryStats.m2Total) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">전체 유저 보유 주식 잔고의 실시간 평가액</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors bg-blue-950/20">
                <td className="py-2.5 px-3 font-medium text-blue-300">M2 (광의 통화 / 총 순자산)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-purple-300 font-bold">
                  ₩{monetaryStats.m2Total.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-purple-300 font-bold">
                  100.0%
                </td>
                <td className="py-2.5 px-3 text-slate-400">가상 세계관 전체 유통 자산의 총 유동성 규모</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">복식부기 원장 무결성 상태</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-400 font-bold">
                  {monetaryStats.moneySupplyHealth}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  차액: ₩{monetaryStats.ledgerDiff.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-slate-400">발행 통화량과 계정 총액 간 대사 일치 여부</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 탭 3: 가상 주식 시장 심도 */}
      {activeTab === 'market' && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">시장 지표</th>
                <th className="py-2.5 px-3 font-semibold text-right">집계치</th>
                <th className="py-2.5 px-3 font-semibold text-right">비율 / 상태</th>
                <th className="py-2.5 px-3 font-semibold">운영 의미 및 규제 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">총 상장 시가총액 (Market Cap)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-400 font-bold">
                  ₩{marketStats.totalMarketCap.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {marketStats.totalStocks}개 종목
                </td>
                <td className="py-2.5 px-3 text-slate-400">상장 주식 총 발행주수 × 현재가 평가 합계</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">총 누적 체결 건수 (Trades)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-400 font-bold">
                  {marketStats.totalTrades.toLocaleString()} 건
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  종목당 평균: {marketStats.avgTradesPerStock} 건
                </td>
                <td className="py-2.5 px-3 text-slate-400">호가창 및 체결 엔진을 통해 발생한 체결 거래 누적치</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">거래 활성 종목 수</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-400 font-bold">
                  {marketStats.activeStockCount} 개
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                  {marketStats.totalStocks > 0
                    ? ((marketStats.activeStockCount / marketStats.totalStocks) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">거래정지 또는 비활성화되지 않은 정상 주문 가능 종목</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-white">거래정지 종목 (Circuit / Halt)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-400 font-bold">
                  {marketStats.haltedStockCount} 개
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-400">
                  {marketStats.totalStocks > 0
                    ? ((marketStats.haltedStockCount / marketStats.totalStocks) * 100).toFixed(1)
                    : 0}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">관리자 킬스위치 또는 서킷브레이커 발동 종목</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 탭 4: 5분위 자산 분배율 (Quintile Distribution) */}
      {activeTab === 'wealth' && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">소득/자산 분위</th>
                <th className="py-2.5 px-3 font-semibold text-right">인원 수</th>
                <th className="py-2.5 px-3 font-semibold text-right">분위 자산 총합</th>
                <th className="py-2.5 px-3 font-semibold text-right">인당 평균 자산</th>
                <th className="py-2.5 px-3 font-semibold text-right">전체 자산 점유율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {wealthQuintiles.length > 0 ? (
                wealthQuintiles.map((q, idx) => (
                  <tr
                    key={q.label}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      idx === 0 ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-white">{q.label}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {q.count.toLocaleString()} 명
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-400 font-bold">
                      ₩{Math.round(q.groupWealth).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                      ₩{Math.round(q.avgWealth).toLocaleString()}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                        idx === 0
                          ? 'text-amber-400'
                          : idx === 4
                            ? 'text-rose-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {q.shareRatio}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    분석 가능한 유저 자산 데이터가 존재하지 않습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>* 5분위 배율 (상위 20% / 하위 20%): {
              wealthQuintiles.length === 5 && wealthQuintiles[4] && wealthQuintiles[0] && Number(wealthQuintiles[4].avgWealth) > 0
                ? (Number(wealthQuintiles[0].avgWealth) / Number(wealthQuintiles[4].avgWealth)).toFixed(2)
                : '1.00'
            }배</span>
            <span>피처 스위치 연동: {controls.length}개 통제 기능 감시 중</span>
          </div>
        </div>
      )}
    </div>
  );
}
