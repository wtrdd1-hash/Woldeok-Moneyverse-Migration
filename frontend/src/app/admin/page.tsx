import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Banknote,
  BarChart3,
  Bell,
  Briefcase,
  Building,
  Building2,
  Coins,
  Cpu,
  Flame,
  Headphones,
  HeartHandshake,
  History,
  Image as ImageIcon,
  Landmark,
  Radio,
  ScrollText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  TrendingUp,
  UserCheck,
  Users,
  Vault,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { getCockpitEvidence } from './admin-cockpit-evidence';
import { adminConsole } from '@/lib/session';
import { ADMIN_AREAS, consoleReturnPath } from './areas';
import { AdminQuickUserSearch } from './admin-quick-search';
import { CloseConsole, OpenConsole } from './console-gate';
import { TelemetryPulse } from './components/telemetry-pulse';
import { AdminTelemetryMetricsTable } from './components/admin-telemetry-metrics-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  AdminBusiness,
  AdminSeasonEvent,
  AdminStock,
  AdminUser,
  FeatureSwitch,
  ReconciliationHealth,
} from './types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '운영 마스터 관제탑 (Admin Cockpit) · Woldeok Admin',
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
      return <Building2 className="size-4 text-sky-400" />;
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
      return <Bell className="size-4 text-amber-400" />;
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
      return <Activity className="size-4 text-zinc-400" />;
  }
}

export default async function AdminPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await adminConsole();
  const params = await searchParams;
  const next = consoleReturnPath(params.next);

  if (admin.consoleSession.state !== 'open') {
    return <Gate next={next} />;
  }

  if (next) redirect(next);

  const [controls, users, stocks, , , health] = await Promise.all([
    apiOrNull<{ featureSwitches: FeatureSwitch[] }>('/api/v1/admin/controls'),
    apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ stocks: AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<{ businessTypes: AdminBusiness[] }>('/api/v1/admin/business-types'),
    apiOrNull<{ events: AdminSeasonEvent[] }>('/api/v1/admin/season-events'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliations/latest'),
  ]);

  const evidence = getCockpitEvidence({ controls, stocks, users, health });
  const allUsers = evidence.members.state === 'verified' ? users!.users : [];
  const topUsers = evidence.members.state === 'verified' ? evidence.members.top : [];

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 pb-20">
      {/* 1. Precision Monochrome 관제탑 헤더 */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/95 p-5 sm:p-7 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="size-12 shrink-0 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Cpu className="size-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                  운영 마스터 관제탑
                </h1>
                <Badge
                  className={`${
                    evidence.allVerified
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/35'
                  } text-[10px] font-bold px-2.5 py-0.5`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full mr-1.5 inline-block ${
                      evidence.allVerified ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {evidence.allVerified ? '핵심 지표 조회 완료' : '일부 지표 확인 불가'}
                </Badge>
                <Badge variant="outline" className="font-mono tabular-nums text-[10px] border-zinc-700 text-zinc-400">
                  API 전체 가동률 미측정
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                실제 관리자 API에서 조회한 관제 지표입니다. Precision Monochrome Bento Grid로 핵심 거버넌스 상태를 즉각 판독합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button asChild variant="stepup" size="sm" className="rounded-xl text-xs font-extrabold gap-1.5">
              <Link href="/admin/central-bank">
                <Landmark className="size-3.5" />
                <span>중앙은행 발의·승인</span>
              </Link>
            </Button>
            <Button asChild variant="surface" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
              <Link href="/admin/controls">
                <Sliders className="size-3.5 text-rose-400" />
                <span>킬스위치 제어</span>
              </Link>
            </Button>
            <Button asChild variant="surface" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
              <Link href="/admin/money-flow">
                <Coins className="size-3.5 text-emerald-400" />
                <span>자금 흐름</span>
              </Link>
            </Button>
            <CloseConsole />
          </div>
        </div>

        {/* 빠른 유저 검색창 & 원장 스냅샷 상태 */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md min-w-0">
            <AdminQuickUserSearch />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono tabular-nums shrink-0">
            <span role="status" className="flex items-center gap-1.5 font-semibold">
              <span className="size-2 rounded-full bg-emerald-400/80" />
              {evidence.ledger.state === 'verified'
                ? `원장 정합성 보고 ${formatMoment(evidence.ledger.calculatedAt)} (체인 해시 별도)`
                : evidence.ledger.state === 'mismatch'
                  ? `원장 정합성 이상 ${formatMoment(evidence.ledger.calculatedAt)} — 조사 필요`
                  : '원장 정합성 확인 불가 — 재조회 필요'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 비대칭 Bento Grid 핵심 거버넌스 매트릭스 (12-Column Asymmetric) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Hero Bento Card (5/12): 복식부기 원장 & 국고 5대 금고 환원 비율 */}
        <Link
          href="/admin/treasury"
          className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                TREASURY & LEDGER GOVERNANCE
              </span>
              <h2 className="text-lg font-black text-zinc-100 mt-1 flex items-center gap-2">
                <span>복식부기 원장 · 5대 금고</span>
                <ArrowRight className="size-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </h2>
            </div>
            <div className="size-9 shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
          </div>

          <div>
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-tight ${
                evidence.ledger.state === 'verified' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {evidence.ledger.state === 'verified'
                ? '100% LEDGER SYNCED'
                : evidence.ledger.state === 'mismatch'
                  ? 'LEDGER MISMATCH'
                  : 'UNVERIFIED'}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              세수 및 카지노 피구세(10%) 자동 분할 환원 정책 가동 중 (안전비축 30% 불변 가드)
            </p>
          </div>

          {/* 40/30/20/10 국고 5대 금고 환원 비율 스택 바 */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/70">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
              <div className="w-[40%] bg-emerald-500" title="복지 40%" />
              <div className="w-[30%] bg-zinc-500" title="국고 30%" />
              <div className="w-[20%] bg-sky-500" title="긴급구호 20%" />
              <div className="w-[10%] bg-amber-500" title="안전비축 10%" />
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono tabular-nums text-zinc-400">
              <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-emerald-500" />복지 40%</span>
              <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-zinc-400" />국고 30%</span>
              <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-sky-500" />구호 20%</span>
              <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-amber-500" />안전 10%</span>
            </div>
          </div>
        </Link>

        {/* Secondary Telemetry Bento Cards (7/12) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* KPI 2: 비상 킬스위치 */}
          <Link
            href="/admin/controls"
            className="rounded-2xl border border-rose-500/25 bg-zinc-950/90 p-5 flex flex-col justify-between gap-3 hover:border-rose-500/60 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">비상 킬스위치</span>
              <div className="size-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Sliders className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono tabular-nums text-zinc-100">
                {evidence.controls.state !== 'verified'
                  ? '확인 불가'
                  : evidence.controls.total === 0
                    ? '0 ACTIVE'
                    : evidence.controls.held > 0
                      ? `${evidence.controls.held} HELD`
                      : 'ALL CLEAR'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono tabular-nums">
                {evidence.controls.state === 'verified'
                  ? `총 ${evidence.controls.total}개 플래그 관제`
                  : '서버 응답 미확인'}
              </p>
            </div>
          </Link>

          {/* KPI 3: 가상 주식 거래소 */}
          <Link
            href="/admin/market"
            className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 flex flex-col justify-between gap-3 hover:border-sky-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">가상 주식 시장</span>
              <div className="size-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono tabular-nums text-sky-400">
                {evidence.stocks.state === 'verified' ? `${evidence.stocks.active} LISTED` : '확인 불가'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono tabular-nums">
                {evidence.stocks.state === 'verified'
                  ? `거래 정지 ${evidence.stocks.halted}종목`
                  : '서버 응답 미확인'}
              </p>
            </div>
          </Link>

          {/* KPI 4: 조회된 회원 */}
          <Link
            href="/admin/users"
            className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 flex flex-col justify-between gap-3 hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">조회된 회원</span>
              <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Users className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono tabular-nums text-amber-400">
                {evidence.members.state === 'verified'
                  ? `${evidence.members.sampledCount.toLocaleString()}명`
                  : '조회 불가'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                샘플링 상위 100명 · R2 승격 보호
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. 3대 탭 UI: [원클릭 퀵 런처 & 고래 순위], [27대 서피스 맵], [텔레메트리 펄스] */}
      <Tabs defaultValue="launcher" className="space-y-5">
        <TabsList className="grid grid-cols-3 max-w-md w-full h-11 p-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
          <TabsTrigger value="launcher" className="rounded-lg text-xs sm:text-sm font-bold">
            핵심 퀵 런처
          </TabsTrigger>
          <TabsTrigger value="surfaces" className="rounded-lg text-xs sm:text-sm font-bold">
            27대 서피스 맵
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="rounded-lg text-xs sm:text-sm font-bold">
            텔레메트리 펄스
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: 핵심 퀵 런처 및 고래 순위 */}
        <TabsContent value="launcher" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 퀵 런처 9선 */}
            <div className="lg:col-span-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-zinc-100">핵심 운영 관제 바로가기</h2>
                </div>
                <span className="text-xs font-mono text-zinc-400">9 CORE STATIONS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { href: '/admin/money-flow', icon: Coins, title: '유저 자금 흐름', desc: '입출금 전수 추적', color: 'text-emerald-400' },
                  { href: '/admin/treasury', icon: Vault, title: '국고 & 비축금', desc: '원스톱 충전 · 5대 금고', color: 'text-amber-400' },
                  { href: '/admin/security', icon: ShieldAlert, title: '보안 · IP 차단', desc: '2FA OTP · 이상 거래', color: 'text-rose-400' },
                  { href: '/admin/market/ai-news', icon: Radio, title: '주식 속보 제어', desc: '1시간 자동 시나리오', color: 'text-sky-400' },
                  { href: '/admin/blog', icon: ScrollText, title: 'AI 블로그 관리', desc: '에디토리얼 자동 발행', color: 'text-emerald-400' },
                  { href: '/admin/discord', icon: Bell, title: '디스코드 관제', desc: '관리자 1:1 DM 알림', color: 'text-amber-400' },
                  { href: '/admin/bonds', icon: ScrollText, title: 'KTB 국채 발행', desc: '이자 쿠폰 자동 정산', color: 'text-blue-400' },
                  { href: '/admin/pension', icon: HeartHandshake, title: '국민연금 기금', desc: '1시간 정기 지급 스윕', color: 'text-rose-400' },
                  { href: '/admin/kdic', icon: Shield, title: '예금보험공사', desc: '보호 한도 및 대위변제', color: 'text-sky-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="min-h-[60px] p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        <Icon className={`size-3.5 shrink-0 ${item.color}`} />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 truncate">{item.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 우측: 상위 5대 고래 유저 순위 */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Flame className="size-4 text-rose-400" />
                  <h2 className="text-sm font-bold text-zinc-100">조회된 회원 자산 순위</h2>
                </div>
                <span className="text-xs text-zinc-400 font-mono">TOP 5</span>
              </div>

              <div className="space-y-2">
                {evidence.members.state === 'unavailable' ? (
                  <p role="status" className="text-sm text-zinc-400">회원 자산 순위를 확인할 수 없습니다.</p>
                ) : topUsers.length === 0 ? (
                  <p className="text-sm text-zinc-400">조회 범위에 표시할 회원이 없습니다.</p>
                ) : null}
                {topUsers.map((u, idx) => (
                  <Link
                    key={u.user_id}
                    href={`/admin/users/${u.user_id}`}
                    className="flex min-h-[44px] items-center justify-between px-3 py-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-zinc-500 w-5 shrink-0">#{idx + 1}</span>
                      <span className="font-semibold text-zinc-100 truncate">{u.display_name}</span>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-emerald-400 shrink-0 ml-2">
                      {groupDigits(u.total_net_worth ?? '0')} WLD
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 탭 2: 27대 전체 서피스 맵 */}
        <TabsContent value="surfaces" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AREA_GROUPS.map((group) => {
              const areas = ADMIN_AREAS.filter((a) => a.group === group.key);
              return (
                <div key={group.key} className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 sm:p-6 space-y-4">
                  <div className="space-y-1 pb-3 border-b border-zinc-800/80">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      {group.eyebrow}
                    </span>
                    <h3 className={`text-base font-bold ${group.color}`}>{group.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{group.description}</p>
                  </div>

                  <div className="space-y-1.5">
                    {areas.map((area) => (
                      <Link
                        key={area.href}
                        href={area.href}
                        className="flex min-h-[44px] items-center justify-between px-3 py-2 rounded-xl border border-transparent hover:border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-all group"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 group-hover:text-emerald-400">
                          {getAreaIcon(area.href)}
                          <span>{area.title}</span>
                        </div>
                        <ArrowRight className="size-3.5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* 탭 3: 텔레메트리 펄스 및 메트릭스 매트릭스 */}
        <TabsContent value="telemetry" className="space-y-6 focus-visible:outline-none">
          <TelemetryPulse />
          {evidence.members.state === 'verified'
            ? <AdminTelemetryMetricsTable users={allUsers} sampled />
            : <p role="status" className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">회원 텔레메트리를 확인할 수 없습니다. 서버 조회를 다시 시도하세요.</p>}
          <div role="status" className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400">
            전수 경제·회원 통계는 이 화면에서 검증되지 않았습니다. 한정된 회원 목록을 전체 인구·총자산으로 표시하지 않습니다.
            <Link href="/admin/analytics" className="ml-2 inline-flex min-h-11 items-center font-semibold text-emerald-400 underline underline-offset-2">별도 통계 화면 확인</Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Gate({
  next,
}: {
  readonly next: string | null;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/95 max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
        <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/25">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-100">운영 콘솔 게이트</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            관리자 관제탑에 접근하려면 관리자 비밀번호 세션 잠금 해제가 필요합니다.
          </p>
        </div>
        <OpenConsole next={next} />
      </div>
    </div>
  );
}
