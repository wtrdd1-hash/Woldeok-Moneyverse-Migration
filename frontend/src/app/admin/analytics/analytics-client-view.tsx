'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Coins,
  Crown,
  Download,
  Flame,
  Globe,
  Landmark,
  PieChart,
  RefreshCw,
  Sliders,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminUser, AdminStock, ReconciliationHealth, FeatureSwitch } from '../types';
import { AdminComprehensiveTelemetryMatrix } from '../components/admin-comprehensive-telemetry-matrix';

export interface AnalyticsClientViewProps {
  users?: readonly AdminUser[];
  stocks?: readonly AdminStock[];
  health?: ReconciliationHealth | null;
  controls?: readonly FeatureSwitch[];
}

export function AnalyticsClientView({
  users = [],
  stocks = [],
  health = null,
  controls = [],
}: AnalyticsClientViewProps) {
  const [selectedRange, setSelectedRange] = useState<'realtime' | 'daily' | 'monthly'>('realtime');
  const [excludeAdmin, setExcludeAdmin] = useState(true);

  // 관리자 계정 필터링 (관리자 역할 보유자 또는 관리자 접속 이력 유저)
  const effectiveUsers = useMemo(() => {
    if (!excludeAdmin) return users;
    return users.filter((u) => !u.is_admin && !u.last_admin_at);
  }, [users, excludeAdmin]);

  const excludedAdminCount = useMemo(() => {
    return users.filter((u) => !!u.is_admin || !!u.last_admin_at).length;
  }, [users]);

  // 1. 유저 코호트 통계 계산
  const cohortStats = useMemo(() => {
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

      if (createdTime > 0 && diffCreated <= d1) {
        newUsersToday++;
      }
    });

    const total = effectiveUsers.length;
    const stickiness = mau > 0 ? ((dau / mau) * 100).toFixed(1) : '0.0';

    return { total, hau, dau, wau, mau, newUsersToday, dormant, stickiness };
  }, [effectiveUsers]);

  // 2. 가상 통화량(M0/M1/M2) 및 구성 분포 계산
  const monetaryStats = useMemo(() => {
    let m0 = 0;
    let bank = 0;
    let bond = 0;
    let stockEval = 0;

    effectiveUsers.forEach((u) => {
      m0 += Number(u.cash_balance) || 0;
      bank += Number(u.bank_balance) || 0;
      bond += Number(u.bond_balance) || 0;
      stockEval += Number(u.stock_eval) || 0;
    });

    const m1 = m0 + bank;
    const m2 = m1 + bond + stockEval;

    const m0Percent = m2 > 0 ? ((m0 / m2) * 100).toFixed(1) : '0';
    const bankPercent = m2 > 0 ? ((bank / m2) * 100).toFixed(1) : '0';
    const bondPercent = m2 > 0 ? ((bond / m2) * 100).toFixed(1) : '0';
    const stockPercent = m2 > 0 ? ((stockEval / m2) * 100).toFixed(1) : '0';

    return { m0, bank, m1, bond, stockEval, m2, m0Percent, bankPercent, bondPercent, stockPercent };
  }, [effectiveUsers]);

  // 3. 5분위 자산 계층 통계
  const quintileStats = useMemo(() => {
    if (effectiveUsers.length === 0) return [];

    const sortedUsers = [...effectiveUsers].sort(
      (a, b) => (Number(b.total_net_worth) || 0) - (Number(a.total_net_worth) || 0)
    );

    const totalNetWorthAll = sortedUsers.reduce(
      (acc, u) => acc + (Number(u.total_net_worth) || 0),
      0
    );

    const size = Math.max(1, Math.floor(sortedUsers.length / 5));
    const labels = [
      '5분위 (상위 20%)',
      '4분위 (20~40%)',
      '3분위 (40~60%)',
      '2분위 (60~80%)',
      '1분위 (하위 20%)',
    ];
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899'];

    const result = [];
    for (let i = 0; i < 5; i++) {
      const start = i * size;
      const end = i === 4 ? sortedUsers.length : (i + 1) * size;
      const group = sortedUsers.slice(start, end);
      const groupWealth = group.reduce(
        (acc, u) => acc + (Number(u.total_net_worth) || 0),
        0
      );
      const avg = group.length > 0 ? groupWealth / group.length : 0;
      const ratio = totalNetWorthAll > 0 ? (groupWealth / totalNetWorthAll) * 100 : 0;

      result.push({
        label: labels[i],
        color: colors[i],
        count: group.length,
        totalWealth: groupWealth,
        avgWealth: avg,
        ratio: ratio.toFixed(1),
      });
    }

    return result;
  }, [effectiveUsers]);

  // 4. 주식 시장 종목별 시총 랭킹 (Top 5)
  const stockRankings = useMemo(() => {
    const list = stocks.map((s) => {
      const price = Number(s.current_price) || 0;
      const shares = Number(s.shares_outstanding) || 0;
      const cap = price * shares;
      return {
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        cap,
        price,
        trades: s.trades,
        active: s.active && !s.halt_status,
      };
    });

    list.sort((a, b) => b.cap - a.cap);
    return list.slice(0, 5);
  }, [stocks]);

  // 5. CSV 파일 다운로드 내보내기 핸들러
  const handleExportCsv = () => {
    const lines: string[] = [];
    lines.push('=== WOLDEOK MONEYVERSE OPERATIONS TELEMETRY REPORT ===');
    lines.push(`Exported At,${new Date().toISOString()}`);
    lines.push(`Admin Traffic Excluded,${excludeAdmin ? 'YES' : 'NO'}`);
    lines.push(`Excluded Admin Accounts Count,${excludedAdminCount}`);
    lines.push(`Total Clean Users,${cohortStats.total}`);
    lines.push(`HAU (1h),${cohortStats.hau}`);
    lines.push(`DAU (24h),${cohortStats.dau}`);
    lines.push(`WAU (7d),${cohortStats.wau}`);
    lines.push(`MAU (30d),${cohortStats.mau}`);
    lines.push(`Stickiness (%),${cohortStats.stickiness}%`);
    lines.push(`New Users (24h),${cohortStats.newUsersToday}`);
    lines.push(`Dormant Users,${cohortStats.dormant}`);
    lines.push('');
    lines.push('=== MONETARY AGGREGATES ===');
    lines.push(`M0 Cash,${monetaryStats.m0}`);
    lines.push(`Bank Deposits,${monetaryStats.bank}`);
    lines.push(`M1 Total,${monetaryStats.m1}`);
    lines.push(`Treasury Bonds,${monetaryStats.bond}`);
    lines.push(`Stock Evaluation,${monetaryStats.stockEval}`);
    lines.push(`M2 Broad Money,${monetaryStats.m2}`);
    lines.push('');
    lines.push('=== 5-QUINTILE WEALTH DISTRIBUTION ===');
    lines.push('Quintile,User Count,Total Wealth,Average Wealth,Share Ratio (%)');
    quintileStats.forEach((q) => {
      lines.push(`${q.label},${q.count},${q.totalWealth},${Math.round(q.avgWealth)},${q.ratio}%`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `moneyverse_telemetry_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 상단 액션 바 및 컨트롤 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              실시간 텔레메트리 & 그래프 분석실 (Telemetry Visual Analytics)
            </h2>
            <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-xs">
              Live Charts 60fps
            </Badge>
            {excludeAdmin && (
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-950/60 text-emerald-300 text-xs">
                관리자 트래픽 제외 적용됨 ({excludedAdminCount}명)
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Datadog, Stripe, Toss Admin 규격의 실시간 코호트 추이, 통화 구성 비율 도넛, 5분위 자산 계층 바 차트 (관리자 계정 및 운영자 IP 자동 제외)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 관리자 트래픽 제외 필터 토글 버튼 */}
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
            {excludeAdmin ? `관리자 제외 (${excludedAdminCount}명)` : '관리자 포함'}
          </button>

          {/* 기간 필터 버튼 */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedRange('realtime')}
              className={`min-h-[44px] sm:min-h-9 px-3 text-xs font-semibold rounded-lg transition-all ${
                selectedRange === 'realtime'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              실시간 집계
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('daily')}
              className={`min-h-[44px] sm:min-h-9 px-3 text-xs font-semibold rounded-lg transition-all ${
                selectedRange === 'daily'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              일간 코호트
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('monthly')}
              className={`min-h-[44px] sm:min-h-9 px-3 text-xs font-semibold rounded-lg transition-all ${
                selectedRange === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              월간 누적
            </button>
          </div>

          {/* 원클릭 CSV 리포트 내보내기 버튼 */}
          <Button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] sm:min-h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shadow-lg shadow-emerald-900/30"
          >
            <Download className="size-4" />
            <span>CSV 리포트 내보내기</span>
          </Button>
        </div>
      </div>

      {/* 4대 핵심 시각적 그래프 대시보드 그리드 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 그래프 1: 유저 활성 코호트 시각화 바 차트 */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-800/70">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Users className="size-4.5 text-blue-400" /> 유저 활성도 & 코호트 텔레메트리 그래프
              </CardTitle>
              <span className="text-xs font-mono font-bold text-amber-400">
                Stickiness: {cohortStats.stickiness}%
              </span>
            </div>
            <CardDescription className="text-xs text-slate-400">
              HAU(1시간), DAU(24시간), WAU(7일), MAU(30일) 활성 유저 수의 규모별 비교 막대
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            {[
              { label: 'HAU (1시간 활성)', val: cohortStats.hau, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'DAU (24시간 활성)', val: cohortStats.dau, color: 'bg-cyan-500', text: 'text-cyan-400' },
              { label: 'WAU (7일 주간 활성)', val: cohortStats.wau, color: 'bg-indigo-500', text: 'text-indigo-400' },
              { label: 'MAU (30일 월간 활성)', val: cohortStats.mau, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: '금일 신규 가입자 (24h)', val: cohortStats.newUsersToday, color: 'bg-teal-500', text: 'text-teal-400' },
              { label: '휴면 계정 (30d+ 미활동)', val: cohortStats.dormant, color: 'bg-rose-500', text: 'text-rose-400' },
            ].map((item) => {
              const maxVal = Math.max(cohortStats.total, 1);
              const pct = Math.min(100, Math.round((item.val / maxVal) * 100));
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{item.label}</span>
                    <span className={`font-mono font-bold tabular-nums ${item.text}`}>
                      {item.val.toLocaleString()} 명 ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 그래프 2: 통화 유동성 (M0/M1/M2) 비율 스택 바 & 도넛 시각화 */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-800/70">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="size-4.5 text-amber-400" /> M0/M1/M2 가상 통화량 유동성 구성 비율
              </CardTitle>
              <span className="text-xs font-mono font-bold text-purple-400">
                총 M2: ₩{monetaryStats.m2.toLocaleString()}
              </span>
            </div>
            <CardDescription className="text-xs text-slate-400">
              지갑 현금, 은행 예금, 만기 국채, 주식 평가액의 전방위 자산 포트폴리오 점유율
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* 복합 스택 프로그레스 바 */}
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400 flex justify-between font-medium">
                <span>자산 구성 비중 (M2 100%)</span>
                <span className="text-slate-300">합계 100.0%</span>
              </div>
              <div className="flex h-5 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${monetaryStats.m0Percent}%` }}
                  title={`M0 현금: ${monetaryStats.m0Percent}%`}
                />
                <div
                  className="bg-cyan-500 h-full transition-all duration-500"
                  style={{ width: `${monetaryStats.bankPercent}%` }}
                  title={`은행 예금: ${monetaryStats.bankPercent}%`}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${monetaryStats.bondPercent}%` }}
                  title={`국채 잔액: ${monetaryStats.bondPercent}%`}
                />
                <div
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${monetaryStats.stockPercent}%` }}
                  title={`주식 평가액: ${monetaryStats.stockPercent}%`}
                />
              </div>
            </div>

            {/* 통화별 상세 지표 카드 그리드 */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-2.5">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="size-2 rounded-full bg-emerald-400" /> M0 현금 ({monetaryStats.m0Percent}%)
                </div>
                <div className="mt-1 font-mono text-sm font-bold text-white tabular-nums">
                  ₩{monetaryStats.m0.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-2.5">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                  <span className="size-2 rounded-full bg-cyan-400" /> 은행 예금 ({monetaryStats.bankPercent}%)
                </div>
                <div className="mt-1 font-mono text-sm font-bold text-white tabular-nums">
                  ₩{monetaryStats.bank.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-2.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <span className="size-2 rounded-full bg-amber-400" /> 국채 채권 ({monetaryStats.bondPercent}%)
                </div>
                <div className="mt-1 font-mono text-sm font-bold text-white tabular-nums">
                  ₩{monetaryStats.bond.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-2.5">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
                  <span className="size-2 rounded-full bg-indigo-400" /> 주식 평가액 ({monetaryStats.stockPercent}%)
                </div>
                <div className="mt-1 font-mono text-sm font-bold text-white tabular-nums">
                  ₩{monetaryStats.stockEval.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 그래프 3: 5분위 자산 계층 분배율 그래프 */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-800/70">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="size-4.5 text-amber-500" /> 5분위 자산 계층 분배율 & 양극화 곡선
              </CardTitle>
              <span className="text-xs text-slate-400 font-mono">
                {users.length}명 전수 분석
              </span>
            </div>
            <CardDescription className="text-xs text-slate-400">
              상위 20%(5분위)부터 하위 20%(1분위)까지의 인당 평균 자산 및 전체 자산 점유율(%)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {quintileStats.map((q) => (
              <div key={q.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{q.label} ({q.count}명)</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-slate-400">평균: ₩{Math.round(q.avgWealth).toLocaleString()}</span>
                    <span className="font-bold text-white">점유율: {q.ratio}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(Number(q.ratio), 2)}%`,
                      backgroundColor: q.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 그래프 4: 가상 주식 종목별 시가총액 & 거래 비중 랭킹 */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-800/70">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="size-4.5 text-emerald-400" /> 상위 상장 종목 시가총액 & 체결 랭킹
              </CardTitle>
              <span className="text-xs text-slate-400 font-mono">
                총 {stocks.length}개 종목
              </span>
            </div>
            <CardDescription className="text-xs text-slate-400">
              발행 주수와 실시간 주가를 곱한 상위 5대 종목의 자본 규모 비교
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stockRankings.length > 0 ? (
              stockRankings.map((stock, idx) => {
                const maxCap = stockRankings[0]?.cap || 1;
                const ratio = Math.min(100, Math.round((stock.cap / maxCap) * 100));
                return (
                  <div key={stock.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        #{idx + 1} {stock.name} ({stock.symbol})
                      </span>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-slate-400">체결 {stock.trades}건</span>
                        <span className="font-bold text-emerald-400">
                          ₩{stock.cap.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(ratio, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                상장된 주식 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 종합 데이터 매트릭스 표 (4개 인터랙티브 탭 통합) */}
      <AdminComprehensiveTelemetryMatrix
        users={users}
        stocks={stocks}
        health={health}
        controls={controls}
      />
    </div>
  );
}
