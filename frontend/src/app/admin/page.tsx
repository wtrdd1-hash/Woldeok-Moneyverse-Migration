import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Bell,
  Briefcase,
  Building,
  Building2,
  CheckCircle2,
  CircleAlert,
  Coins,
  Cpu,
  Flame,
  Globe,
  Headphones,
  HeartHandshake,
  History,
  Image as ImageIcon,
  Landmark,
  Radio,
  RefreshCw,
  ScrollText,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Vault,
  Wallet,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiOrNull } from '@/lib/api';
import { cn } from '@/lib/cn';
import { compareAmounts, formatMoment, groupDigits } from '@/lib/money';
import { adminConsole } from '@/lib/session';
import { ADMIN_AREAS, adminAreaFor, consoleReturnPath } from './areas';
import { AdminQuickUserSearch } from './admin-quick-search';
import { CloseConsole, OpenConsole } from './console-gate';
import { TelemetryPulse } from './components/telemetry-pulse';
import { AdminTelemetryMetricsTable } from './components/admin-telemetry-metrics-table';
import { AdminComprehensiveTelemetryMatrix } from './components/admin-comprehensive-telemetry-matrix';
import type {
  AdminBusiness,
  AdminConsole,
  AdminSeasonEvent,
  AdminStock,
  AdminUser,
  FeatureSwitch,
  ReconciliationHealth,
} from './types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '운영 마스터 관제탑 (Datadog Cockpit) · Woldeok Admin',
  robots: { index: false, follow: false },
};

const AREA_GROUPS = [
  {
    key: 'safety',
    eyebrow: 'SECURITY & MEMBERS',
    title: '회원 보안 · 이상 거래 탐지',
    description: '사용자 권한, 이상 거래 차단, IP 보안 및 대외 공개 소식을 통제합니다.',
    badge: '안전 통제',
    color: 'text-amber-400',
  },
  {
    key: 'economy',
    eyebrow: 'FINTECH & SIMULATION',
    title: '가상 경제 · 핀테크 코어',
    description: '가상 주식 시장, 국고 비축금, 금융 서비스, 직업/사업 카탈로그를 운영합니다.',
    badge: '경제 엔진',
    color: 'text-emerald-400',
  },
  {
    key: 'records',
    eyebrow: 'AUDIT & TELEMETRY',
    title: '감사 추적 · 텔레메트리 펄스',
    description: 'SHA-256 체인 무결성, 접속/체류 텔레메트리, 발송 기록을 실시간 추적합니다.',
    badge: '무결성 감사',
    color: 'text-sky-400',
  },
] as const;

function getAreaIcon(href: string) {
  switch (href) {
    case '/admin/analytics':
      return <BarChart3 className="size-4 text-cyan-400" />;
    case '/admin/controls':
      return <Sliders className="size-4 text-emerald-400" />;
    case '/admin/security':
      return <ShieldAlert className="size-4 text-rose-500" />;
    case '/admin/users':
      return <UserCheck className="size-4 text-blue-400" />;
    case '/admin/support':
      return <Headphones className="size-4 text-emerald-400" />;
    case '/admin/market':
      return <TrendingUp className="size-4 text-emerald-400" />;
    case '/admin/catalog':
      return <Building2 className="size-4 text-indigo-400" />;
    case '/admin/work':
      return <Briefcase className="size-4 text-blue-400" />;
    case '/admin/bank':
      return <Landmark className="size-4 text-amber-400" />;
    case '/admin/economy':
      return <Coins className="size-4 text-yellow-400" />;
    case '/admin/treasury':
      return <Banknote className="size-4 text-emerald-400" />;
    case '/admin/money-flow':
      return <Coins className="size-4 text-emerald-400" />;
    case '/admin/shop':
      return <ShoppingBag className="size-4 text-rose-400" />;
    case '/admin/logs':
      return <History className="size-4 text-sky-400" />;
    case '/admin/discord':
      return <Bell className="size-4 text-indigo-400" />;
    case '/admin/content':
      return <ImageIcon className="size-4 text-rose-400" />;
    case '/admin/safety':
      return <ShieldCheck className="size-4 text-rose-400" />;
    case '/admin/enterprises':
      return <Building className="size-4 text-amber-400" />;
    case '/admin/bonds':
      return <ScrollText className="size-4 text-blue-400" />;
    case '/admin/pension':
      return <HeartHandshake className="size-4 text-rose-400" />;
    case '/admin/kdic':
      return <Shield className="size-4 text-sky-400" />;
    default:
      return <Activity className="size-4 text-slate-400" />;
  }
}

/**
 * Datadog & AWS Cockpit Inspired Enterprise Master Control Tower for Woldeok Moneyverse
 */
export default async function AdminPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await adminConsole();
  const params = await searchParams;
  const next = consoleReturnPath(params.next);

  if (admin.consoleSession.state !== 'open') {
    return <Gate admin={admin} next={next} />;
  }

  if (next) redirect(next);

  // Parallel Telemetry & Operations Snapshot Fetching
  const [controls, users, stocks, businesses, events, health] = await Promise.all([
    apiOrNull<{ featureSwitches: FeatureSwitch[] }>('/api/v1/admin/controls'),
    apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ stocks: AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<{ businessTypes: AdminBusiness[] }>('/api/v1/admin/business-types'),
    apiOrNull<{ events: AdminSeasonEvent[] }>('/api/v1/admin/season-events'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliations/latest'),
  ]);

  const allUsers = users?.users ?? [];
  const topUsers = allUsers
    .filter((u) => !u.is_admin && !u.last_admin_at)
    .slice()
    .sort((a, b) => compareAmounts(b.total_net_worth ?? '0', a.total_net_worth ?? '0'))
    .slice(0, 5);

  const held =
    controls?.featureSwitches.filter((feature) => feature.state !== 'enabled').length ?? 0;
  const totalSwitches = controls?.featureSwitches.length ?? 0;
  const integrityOk = health?.integrity?.ok;
  const stocksList = stocks?.stocks ?? [];
  const activeStocks = stocksList.filter((s) => s.active && s.halt_status !== 'halted').length;
  const haltedStocks = stocksList.filter((s) => !s.active || s.halt_status === 'halted').length;

  const counts: Readonly<Record<string, string | null>> = {
    '/admin/controls': controls
      ? `전체 ${totalSwitches}개 · 활성 ${totalSwitches - held}개${held > 0 ? ` · 제어 ${held}개` : ''}`
      : null,
    '/admin/users': users ? `전체 ${users.users.length.toLocaleString()}명` : null,
    '/admin/market': stocks ? `정상 ${activeStocks}종목 · 정지 ${haltedStocks}종목` : null,
    '/admin/catalog': businesses ? `업종 ${businesses.businessTypes.length}종` : null,
    '/admin/content': events ? `진행 이벤트 ${events.events.length}건` : null,
    '/admin/economy': health?.available === true ? (integrityOk ? '원장 정합성 완벽' : '원장 불일치 감지') : null,
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 pb-16 zero-overflow-shield">
      {/* 1. Datadog Cockpit Header: System Health Status & Quick Search */}
      <div className="fintech-card p-4 sm:p-6 border-slate-800/80 bg-slate-900/40 dark:bg-[#0b0f17]/90 backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="grid size-11 sm:size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shadow-xs">
              <Cpu className="size-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                  운영 마스터 관제탑
                </h1>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5 inline-block" />
                  실시간 관제 정상
                </Badge>
                <Badge variant="outline" className="border-slate-700/80 text-slate-400 font-fintech text-[10px]">
                  PID 336890 · 14대 API 온라인
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 [word-break:keep-all]">
                가상 경제 복식부기 원장, 긴급 킬스위치, 이상 거래 탐지 및 통화량 유동성을 24시간 실시간 제어합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/admin/api-health"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 min-h-[44px] sm:min-h-9 text-xs font-bold text-sky-400 hover:bg-sky-500/20 btn-interactive"
            >
              <Activity className="size-3.5 text-sky-400 animate-pulse" />
              <span>14대 API 관제 타워</span>
            </Link>
            <Link
              href="/admin/money-flow"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 min-h-[44px] sm:min-h-9 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 btn-interactive"
            >
              <Coins className="size-3.5 text-emerald-400" />
              <span>유저 자금 흐름 관제</span>
            </Link>
            <Link
              href="/admin/controls"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 min-h-[44px] sm:min-h-9 text-xs font-bold text-amber-400 hover:bg-amber-500/20 btn-interactive"
            >
              <Sliders className="size-3.5 text-amber-400" />
              <span>킬스위치 즉시 제어</span>
            </Link>
          </div>
        </div>

        {/* Global Quick User & Action Jumper */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md min-w-0">
            <AdminQuickUserSearch />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-fintech shrink-0">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" /> SHA-256 원장 체인 무결성 확인
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Core Cockpit KPI Cards (Datadog High-Density Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: 원장 무결성 */}
        <Link
          href="/admin/economy"
          className="fintech-card p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 btn-interactive group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">복식부기 원장 무결성</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-black font-fintech text-emerald-400">
              {integrityOk ? '0건 오차 (정합)' : '불일치 감지'}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              자산 = 부채 + 자본 균형 100% 일치
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-semibold text-emerald-400">
            <span>원장 정합성 상세 점검</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* KPI 2: 비상 킬스위치 */}
        <Link
          href="/admin/controls"
          className="fintech-card p-4 sm:p-5 flex flex-col justify-between hover:border-amber-500/50 btn-interactive group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">긴급 킬스위치 상태</span>
            <div className={cn(
              "flex size-8 items-center justify-center rounded-xl",
              held > 0 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
            )}>
              {held > 0 ? <AlertTriangle className="size-4" /> : <Sliders className="size-4" />}
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-black font-fintech text-slate-100">
              {held > 0 ? `${held}개 제어 중` : '전 기능 정상 가동'}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              전체 {totalSwitches}개 중 {totalSwitches - held}개 활성
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-semibold text-amber-400">
            <span>시스템 스위치 제어</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* KPI 3: 가상 주식 거래소 */}
        <Link
          href="/admin/market"
          className="fintech-card p-4 sm:p-5 flex flex-col justify-between hover:border-sky-500/50 btn-interactive group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">가상 주식 10대 상장사</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-black font-fintech text-sky-400">
              {activeStocks}종목 정상 매매
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              정지 {haltedStocks}종목 · 실시간 호가/속보 가동
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-semibold text-sky-400">
            <span>거래소 서킷브레이커 제어</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* KPI 4: 회원 인구 및 자금 흐름 */}
        <Link
          href="/admin/users"
          className="fintech-card p-4 sm:p-5 flex flex-col justify-between hover:border-indigo-500/50 btn-interactive group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">등록 시민 인구</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <Users className="size-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-black font-fintech text-indigo-400">
              {allUsers.length.toLocaleString()}명
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              실시간 경제 활동 시민 통계
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-semibold text-indigo-400">
            <span>회원 디렉토리 및 권한 관리</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* 3. Central Dual Cockpit: Quick Emergency Matrix & Top Whales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Emergency Operations Matrix (8 Columns) */}
        <div className="lg:col-span-8 fintech-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-400" />
              <h2 className="text-sm font-extrabold text-slate-100">
                핵심 관제 서피스 원클릭 퀵 런처
              </h2>
            </div>
            <span className="text-xs font-fintech text-slate-400">27대 운영 관제 서피스</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Link
              href="/admin/money-flow"
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-emerald-500/40 transition-all btn-interactive group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                <Coins className="size-3.5 text-emerald-400" />
                <span>유저 자금 흐름</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                입출금 · 매매 · 상점 전수 추적
              </p>
            </Link>

            <Link
              href="/admin/treasury"
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-amber-500/40 transition-all btn-interactive group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-amber-400">
                <Vault className="size-3.5 text-amber-400" />
                <span>국고 포털 & 비축금</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                기본배당 · 창업그랜트 심사
              </p>
            </Link>

            <Link
              href="/admin/security"
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-rose-500/40 transition-all btn-interactive group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-rose-400">
                <ShieldAlert className="size-3.5 text-rose-400" />
                <span>보안 · IP 차단</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                어뷰징 탐지 및 세션 강제 만료
              </p>
            </Link>

            <Link
              href="/admin/market/ai-news"
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-sky-500/40 transition-all btn-interactive group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-sky-400">
                <Radio className="size-3.5 text-sky-400" />
                <span>주식 속보 제어</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                2시간 자동 속보 및 수동 발행
              </p>
            </Link>

            <Link
              href="/admin/blog"
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-emerald-500/40 transition-all btn-interactive group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                <ScrollText className="size-3.5 text-emerald-400" />
                <span>AI 블로그 관리</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                새벽 06:00 자동 발행 & IndexNow
              </p>
            </Link>

            <Link
              href="/admin/seo"
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-indigo-500/40 transition-all btn-interactive group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-indigo-400">
                <Globe className="size-3.5 text-indigo-400" />
                <span>SEO & 검색엔진 색인</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                구글/네이버 색인 핑 전송 타워
              </p>
            </Link>
          </div>
        </div>

        {/* Right: Top 5 Whale Accounts (4 Columns) */}
        <div className="lg:col-span-4 fintech-card p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-rose-400" />
              <h2 className="text-sm font-extrabold text-slate-100">상위 5대 고래(Whale) 계정</h2>
            </div>
            <Link href="/admin/users" className="text-xs text-emerald-400 hover:underline">
              전체 보기
            </Link>
          </div>

          <div className="space-y-2">
            {topUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">회원 정보가 없습니다.</p>
            ) : (
              topUsers.map((user, idx) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/60 bg-slate-900/30 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-fintech font-bold text-slate-400 size-5 grid place-items-center rounded bg-slate-800/80 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[100px]">
                      {user.display_name}
                    </span>
                  </div>
                  <div className="font-fintech font-bold text-emerald-400 tabular-nums">
                    {groupDigits(user.total_net_worth ?? '0')} WLD
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Complete Domain Management Bento Hub (3 Categories) */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Server className="size-4 text-emerald-400" />
          <span>엔터프라이즈 도메인 관제 허브</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AREA_GROUPS.map((group) => {
            const areas = ADMIN_AREAS.filter((a) => a.group === group.key);
            return (
              <div
                key={group.key}
                className="fintech-card p-4 sm:p-5 flex flex-col justify-between space-y-4 border-slate-800/80"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-fintech font-bold tracking-widest text-slate-400">
                      {group.eyebrow}
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] border-slate-700/80 font-bold", group.color)}>
                      {group.badge}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-100 mt-1">{group.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed [word-break:keep-all]">
                    {group.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  {areas.map((area) => {
                    const count = counts[area.href];
                    return (
                      <Link
                        key={area.href}
                        href={area.href}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors btn-interactive group text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getAreaIcon(area.href)}
                          <span className="font-semibold text-slate-300 group-hover:text-slate-100 truncate">
                            {area.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 font-fintech text-[11px] text-slate-400">
                          {count && <span className="truncate max-w-[140px]">{count}</span>}
                          <ChevronRight className="size-3 text-slate-500 group-hover:text-slate-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Comprehensive Telemetry Matrix & Telemetry Table */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-sky-400" />
            <h2 className="text-base font-extrabold text-slate-100">
              실시간 텔레메트리 펄스 & 인프라 건전성
            </h2>
          </div>
          <Badge variant="outline" className="text-[10px] font-fintech text-slate-400 border-slate-800">
            RTT P99 & 무결성 전수 검증
          </Badge>
        </div>

        <AdminComprehensiveTelemetryMatrix />
        <AdminTelemetryMetricsTable users={allUsers} />
      </div>

      {/* 6. Console Session Footer */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 text-xs text-slate-400 font-fintech">
        <span>세션 상태: {admin.consoleSession.state}</span>
        <CloseConsole />
      </div>
    </div>
  );
}

function Gate({
  admin,
  next,
}: {
  readonly admin: AdminConsole;
  readonly next: string | null;
}) {
  return (
    <div className="mx-auto max-w-lg p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0b0f17] shadow-2xl text-center space-y-4 my-12">
      <div className="size-12 rounded-2xl bg-amber-500/15 text-amber-400 grid place-items-center mx-auto ring-1 ring-amber-500/30">
        <Lock className="size-6" />
      </div>
      <h1 className="text-xl font-black text-slate-100 tracking-tight">관리자 콘솔 인증 잠금</h1>
      <p className="text-xs text-slate-400 leading-relaxed [word-break:keep-all]">
        운영 마스터 관제탑에 접근하려면 관리자 보안 세션 인증이 필요합니다.
      </p>
      <div className="pt-2">
        <OpenConsole next={next} />
      </div>
    </div>
  );
}

function ChevronRight({ className }: { readonly className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function Lock({ className }: { readonly className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
