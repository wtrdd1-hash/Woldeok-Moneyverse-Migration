import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Banknote,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Coins,
  Cpu,
  Eye,
  Flame,
  Globe,
  Headphones,
  History,
  Image as ImageIcon,
  Key,
  Landmark,
  Lock,
  MessageSquare,
  Radio,
  RefreshCw,
  Search,
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
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { cn } from '@/lib/cn';
import { compareAmounts, formatMoment, groupDigits } from '@/lib/money';
import { adminConsole } from '@/lib/session';
import { ADMIN_AREAS, adminAreaFor, consoleReturnPath } from './areas';
import { AdminQuickUserSearch } from './admin-quick-search';
import { CloseConsole, OpenConsole } from './console-gate';
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
  title: '운영 마스터 관제탑 · Woldeok Admin',
  robots: { index: false, follow: false },
};

const AREA_GROUPS = [
  {
    key: 'safety',
    eyebrow: 'SECURITY & MEMBERS',
    title: '회원 보안 · 공개 콘텐츠 관제',
    description: '사용자 권한, 이상 거래 탐지, IP 차단 및 대외 공개 소식을 실시간 통제합니다.',
    badge: '안전 통제',
    color: 'text-amber-500',
  },
  {
    key: 'economy',
    eyebrow: 'FINTECH & SIMULATION',
    title: '가상 경제 · 핀테크 코어 관제',
    description: '가상 주식 시장, 국고 비축금, 금융 서비스, 직업/사업 카탈로그를 총괄 운영합니다.',
    badge: '경제 엔진',
    color: 'text-primary',
  },
  {
    key: 'records',
    eyebrow: 'AUDIT & TELEMETRY',
    title: '감사 추적 · 텔레메트리 · 배송 로그',
    description: 'SHA-256 체인 무결성, 접속/체류 텔레메트리, Discord 알림 발송 기록을 추적합니다.',
    badge: '무결성 감사',
    color: 'text-emerald-500',
  },
] as const;

function getAreaIcon(href: string) {
  switch (href) {
    case '/admin/controls':
      return <Sliders className="size-4.5 text-primary" />;
    case '/admin/security':
      return <ShieldAlert className="size-4.5 text-rose-500" />;
    case '/admin/users':
      return <UserCheck className="size-4.5 text-blue-500" />;
    case '/admin/support':
      return <Headphones className="size-4.5 text-emerald-500" />;
    case '/admin/market':
      return <TrendingUp className="size-4.5 text-emerald-500" />;
    case '/admin/catalog':
      return <Building2 className="size-4.5 text-indigo-500" />;
    case '/admin/work':
      return <Briefcase className="size-4.5 text-blue-500" />;
    case '/admin/bank':
      return <Landmark className="size-4.5 text-amber-500" />;
    case '/admin/economy':
      return <Coins className="size-4.5 text-yellow-500" />;
    case '/admin/treasury':
      return <Banknote className="size-4.5 text-primary" />;
    case '/admin/shop':
      return <ShoppingBag className="size-4.5 text-rose-500" />;
    case '/admin/logs':
      return <History className="size-4.5 text-sky-500" />;
    case '/admin/logs/activity':
      return <Activity className="size-4.5 text-cyan-500" />;
    case '/admin/logs/delivery':
      return <Radio className="size-4.5 text-purple-500" />;
    case '/admin/logs/integrity':
      return <ShieldCheck className="size-4.5 text-emerald-500" />;
    case '/admin/discord':
      return <Bell className="size-4.5 text-indigo-400" />;
    case '/admin/content':
      return <ImageIcon className="size-4.5 text-pink-500" />;
    default:
      return <Wrench className="size-4.5 text-muted-foreground" />;
  }
}

/**
 * Stripe & Toss Admin Inspired Master Control Tower for Woldeok Moneyverse
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
    '/admin/users': users ? `등록 회원 ${allUsers.length}명` : null,
    '/admin/market': stocks
      ? `상장 종목 ${stocksList.length}개${haltedStocks > 0 ? ` · 정지 ${haltedStocks}개` : ' · 전 종목 거래중'}`
      : null,
    '/admin/catalog':
      businesses && events
        ? `사업체 ${businesses.businessTypes.length}종 · 시즌 ${events.events.length}개`
        : null,
    '/admin/economy': health?.available ? '원장 최신 스냅샷 정상' : '스냅샷 생성 대기',
    '/admin/treasury': '중앙 국고 잔고 및 Faucet/Sink 관제',
    '/admin/security': '이상 패턴 감지 및 IP 차단 필터',
    '/admin/logs/activity': '실시간 유저 접속·체류·클릭 텔레메트리',
    '/admin/logs/integrity': integrityOk ? 'SHA-256 체인 무결성 검증 완료' : '무결성 점검 권장',
    '/admin/work': '작업 카탈로그 및 직업 숙련도 정책',
    '/admin/bank': '예금·대출 여신 및 신용 리스크 관리',
    '/admin/shop': '덕마켓 상품 재고 및 판매 상태',
    '/admin/support': '1:1 고객 문의 및 답변 티켓',
    '/admin/discord': 'Discord 웹훅 전달 채널 라우팅',
    '/admin/content': '공지사항 및 월덕 갤러리 공개 승인',
    '/admin/logs': '운영자 작업 감사 추적 로그',
    '/admin/logs/delivery': '외장 시스템 알림 발송 기록',
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 sm:gap-8 px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 min-w-0 overflow-hidden">
      {/* Top Stripe-style System Master Health Telemetry Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-amber-500/10 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Cpu className="size-5 sm:size-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground">
                  운영 마스터 관제탑
                </h1>
                <Badge className="h-5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                  실시간 관제 가동 중
                </Badge>
                <Badge variant="outline" className="h-5 text-[10px] font-mono text-muted-foreground">
                  139 REST Endpoints OK
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 [word-break:keep-all]">
                실시간 가상경제 지표, 회원 안전 조치, 감사 로그 및 핀테크 인프라를 총괄 제어합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/admin/economy"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-bold text-foreground shadow-xs hover:bg-muted transition-colors"
            >
              <RefreshCw className="size-3.5 text-primary" />
              <span>원장 상태 점검</span>
            </Link>
            <Link
              href="/admin/treasury"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-xs hover:bg-amber-500/20 transition-colors"
            >
              <Banknote className="size-3.5 text-amber-500" />
              <span>국고 관리</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Status Grid (Toss & Stripe Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Feature Switches & Safety Lock */}
        <Link
          href="/admin/controls"
          className="group relative flex flex-col justify-between rounded-2xl border bg-card p-4 sm:p-5 shadow-plate hover:border-primary/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">기능 스위치 통제</span>
            <div className={cn(
              "flex size-8 items-center justify-center rounded-xl",
              held > 0 ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"
            )}>
              {held > 0 ? <AlertTriangle className="size-4" /> : <Sliders className="size-4" />}
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold tracking-tight">
              {controls === null ? '확인 불가' : `${held}개 제어 중`}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              전체 {totalSwitches}개 중 {totalSwitches - held}개 정상 가동
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold text-primary">
            <span>스위치 정책 조정</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* KPI 2: Ledger Integrity */}
        <Link
          href="/admin/economy"
          className="group relative flex flex-col justify-between rounded-2xl border bg-card p-4 sm:p-5 shadow-plate hover:border-primary/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">원장 및 복식부기 무결성</span>
            <div className={cn(
              "flex size-8 items-center justify-center rounded-xl",
              integrityOk === false ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/15 text-emerald-500"
            )}>
              {integrityOk === false ? <CircleAlert className="size-4" /> : <ShieldCheck className="size-4" />}
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold tracking-tight">
              {health?.available !== true ? '스냅샷 없음' : integrityOk ? '정합성 완벽' : '불일치 감지'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              복식부기 원장 잔액 오차 0건 검증
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold text-primary">
            <span>경제 통화량 정합성</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* KPI 3: Registered Users & Active Population */}
        <Link
          href="/admin/users"
          className="group relative flex flex-col justify-between rounded-2xl border bg-card p-4 sm:p-5 shadow-plate hover:border-primary/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">등록 회원 인구</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
              <Users className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold tracking-tight">
              {allUsers.length > 0 ? `${allUsers.length}명` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              실시간 세션 및 보안 모니터링
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold text-primary">
            <span>회원 안전 및 권한 관리</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* KPI 4: Virtual Equity Market */}
        <Link
          href="/admin/market"
          className="group relative flex flex-col justify-between rounded-2xl border bg-card p-4 sm:p-5 shadow-plate hover:border-primary/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">가상 주식 시장</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold tracking-tight">
              {stocksList.length > 0 ? `${stocksList.length}개 종목` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              정상 {activeStocks}개{haltedStocks > 0 ? ` · 거래정지 ${haltedStocks}개` : ''}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold text-primary">
            <span>종목 관리 및 시장 뉴스</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Operator Session Info & Quick Member Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Quick Member Telemetry Search */}
        <Card className="lg:col-span-2 rounded-2xl border-border/80 shadow-plate">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Search className="size-4 text-primary" />
                  <span>회원 즉시 검색 및 이상 거래 탐지</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  회원 닉네임, ID 또는 식별자로 계정 상태와 자산 내역을 즉시 조회합니다.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminQuickUserSearch />

            {/* Quick Top Wealth Snapshot */}
            {topUsers.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Flame className="size-3.5 text-amber-500" />
                  <span>상위 순자산 랭킹 TOP 5</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                  {topUsers.map((u, idx) => (
                    <Link
                      key={u.user_id}
                      href={`/admin/users?id=${u.user_id}`}
                      className="flex items-center justify-between p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">
                          #{idx + 1} {u.display_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {groupDigits(u.total_net_worth ?? '0')} DUK
                        </span>
                      </div>
                      <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 1 Col: Operator Console Session Security Card */}
        <Card className="rounded-2xl border-border/80 shadow-plate flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span>운영 세션 보안 상태</span>
              </CardTitle>
              <Badge variant="default" className="text-[10px] font-bold">
                보안 격리 세션
              </Badge>
            </div>
            <CardDescription className="text-xs">
              매 요청마다 데이터베이스 RBAC 보안 정책이 검증됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {admin.roles.map((role) => (
                <Badge
                  key={role}
                  variant={role === 'superadmin' ? 'default' : 'secondary'}
                  className="text-xs font-bold px-2 py-0.5 rounded-lg"
                >
                  👑 {role}
                </Badge>
              ))}
            </div>

            <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" /> 콘솔 세션 만료
                </span>
                <span className="font-mono font-bold text-foreground">
                  {admin.consoleSession.expiresAt
                    ? formatMoment(admin.consoleSession.expiresAt)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5" /> 유휴 자동 잠금
                </span>
                <span className="font-mono font-bold text-foreground">
                  {admin.consoleSession.idleExpiresAt
                    ? formatMoment(admin.consoleSession.idleExpiresAt)
                    : '—'}
                </span>
              </div>
            </div>

            <CloseConsole />
          </CardContent>
        </Card>
      </div>

      {/* Main Operations Domain Areas Grid */}
      <section aria-labelledby="admin-areas-title" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
          <div>
            <span className="eyebrow text-primary">OPERATIONS DIRECTORY</span>
            <h2 id="admin-areas-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
              도메인별 관제 콘솔 메뉴
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            총 {ADMIN_AREAS.length}개 운영 하위 모듈 실시간 연동
          </p>
        </div>

        {AREA_GROUPS.map((group) => {
          const areas = ADMIN_AREAS.filter((area) => area.group === group.key);
          return (
            <div key={group.key} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {group.eyebrow}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {group.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground mt-0.5">{group.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground [word-break:keep-all]">
                  {group.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                {areas.map((area) => (
                  <Link
                    key={area.href}
                    href={area.href}
                    className="group relative flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-plate transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {getAreaIcon(area.href)}
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                          {area.eyebrow}
                        </span>
                      </div>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <div className="space-y-1 mt-1">
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {area.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 [word-break:keep-all] leading-relaxed">
                        {area.summary}
                      </p>
                    </div>

                    {counts[area.href] && (
                      <div className="pt-2 border-t border-border/50 text-[11px] font-bold text-primary flex items-center gap-1.5 truncate">
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        <span className="truncate">{counts[area.href]}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

/**
 * Gate Screen for Unauthenticated or Idle Operators
 */
function Gate({ admin, next }: { readonly admin: AdminConsole; readonly next: string | null }) {
  const locked = admin.consoleSession.state === 'idle_locked';
  const expired = admin.consoleSession.state === 'expired';
  const waiting = next ? (adminAreaFor(next)?.title ?? next) : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8 sm:py-12 min-w-0">
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 mb-3 shadow-md">
          <Lock className="size-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">운영 콘솔 잠금</h1>
        <p className="text-xs sm:text-sm text-muted-foreground [word-break:keep-all]">
          운영자 권한 및 안전한 2차 인증 세션이 확인된 후 콘솔이 개방됩니다.
        </p>
      </div>

      {waiting && (
        <Card className="border-primary/40 bg-primary/5 rounded-2xl">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <ShieldAlert className="size-4" />
              <span>‘{waiting}’ 화면 접근 대기 중</span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              아래에서 운영 콘솔을 열면 요청하신 화면으로 즉시 안전하게 이동합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {(locked || expired) && (
        <Card className="border-amber-500/40 bg-amber-500/5 rounded-2xl">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
              <span>{locked ? '일정 시간 조작이 없어 보안 잠금되었습니다.' : '운영 콘솔 세션이 만료되었습니다.'}</span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              안전한 운영을 위해 아래에서 콘솔을 다시 열어주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="rounded-2xl border-border/80 shadow-plate">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">운영 콘솔 활성화</CardTitle>
          <CardDescription className="text-xs">
            현재 계정의 관리자 권한을 재검증하고 30분간 유효한 보안 콘솔 세션을 시작합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <OpenConsole next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
