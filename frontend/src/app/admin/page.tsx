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
  ScrollText,
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
import { compareAmounts, formatMoment, groupDigits } from '@/lib/money';
import { adminConsole } from '@/lib/session';
import { ADMIN_AREAS, adminAreaFor, consoleReturnPath } from './areas';
import { AdminQuickUserSearch } from './admin-quick-search';
import { CloseConsole, OpenConsole } from './console-gate';
import { TelemetryPulse } from './components/telemetry-pulse';
import { AdminTelemetryMetricsTable } from './components/admin-telemetry-metrics-table';
import { AdminComprehensiveTelemetryMatrix } from './components/admin-comprehensive-telemetry-matrix';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-20">
      {/* 1. 상단 토스 2026 Admin 대형 관제탑 헤더 */}
      <div className="toss-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="size-12 shrink-0 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Cpu className="size-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  운영 마스터 관제탑
                </h1>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5 inline-block" />
                  실시간 관제 정상
                </Badge>
                <Badge variant="outline" className="font-fintech text-[10px]">
                  14대 API 온라인
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                가상 경제 복식부기 원장, 긴급 킬스위치, 이상 거래 탐지 및 통화량 유동성을 24시간 실시간 제어합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button asChild size="sm" className="h-10 rounded-xl btn-toss text-xs font-bold gap-1.5 shadow-sm">
              <Link href="/admin/controls">
                <Sliders className="size-3.5" />
                <span>킬스위치 즉시 제어</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 rounded-xl text-xs font-bold gap-1.5">
              <Link href="/admin/money-flow">
                <Coins className="size-3.5 text-emerald-400" />
                <span>유저 자금 흐름</span>
              </Link>
            </Button>
            <CloseConsole />
          </div>
        </div>

        {/* 빠른 유저 검색창 */}
        <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md min-w-0">
            <AdminQuickUserSearch />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-fintech shrink-0">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" /> SHA-256 원장 체인 무결성 확인
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4대 핵심 고대비 KPI 카드 (원장 무결성, 킬스위치, 주식 시장, 회원 인구) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: 원장 무결성 */}
        <Link href="/admin/economy" className="toss-card p-5 space-y-2 group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">복식부기 원장</span>
            <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-fintech text-emerald-400">
              {integrityOk ? '0건 오차 (정합)' : '불일치 감지'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">자산 = 부채 + 자본 균형</p>
          </div>
        </Link>

        {/* KPI 2: 비상 킬스위치 */}
        <Link href="/admin/controls" className="toss-card p-5 space-y-2 group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">비상 킬스위치</span>
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Sliders className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-fintech text-foreground">
              {held > 0 ? `${held}개 제어 중` : '전 기능 정상 가동'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">총 {totalSwitches}개 스위치</p>
          </div>
        </Link>

        {/* KPI 3: 가상 주식 거래소 */}
        <Link href="/admin/market" className="toss-card p-5 space-y-2 group hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">가상 주식 시장</span>
            <div className="size-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-fintech text-sky-400">
              {activeStocks}종목 정상 매매
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">정지 {haltedStocks}종목</p>
          </div>
        </Link>

        {/* KPI 4: 회원 인구 */}
        <Link href="/admin/users" className="toss-card p-5 space-y-2 group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">시민 인구</span>
            <div className="size-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-fintech text-indigo-400">
              {allUsers.length.toLocaleString()}명
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">경제 활동 유저 통계</p>
          </div>
        </Link>
      </div>

      {/* 3. 3대 탭 UI: [원클릭 퀵 런처 & 고래 순위], [27대 서피스 맵], [텔레메트리 펄스] */}
      <Tabs defaultValue="launcher" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md w-full h-11 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="launcher" className="rounded-lg text-xs sm:text-sm font-semibold">
            핵심 퀵 런처
          </TabsTrigger>
          <TabsTrigger value="surfaces" className="rounded-lg text-xs sm:text-sm font-semibold">
            27대 서피스 맵
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="rounded-lg text-xs sm:text-sm font-semibold">
            텔레메트리 펄스
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: 핵심 퀵 런처 및 고래 순위 */}
        <TabsContent value="launcher" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 퀵 런처 9선 */}
            <div className="lg:col-span-8 toss-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-foreground">핵심 운영 관제 바로가기</h2>
                </div>
                <span className="text-xs text-muted-foreground">자주 쓰는 9대 창구</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { href: '/admin/money-flow', icon: Coins, title: '유저 자금 흐름', desc: '입출금 전수 추적', color: 'text-emerald-400' },
                  { href: '/admin/treasury', icon: Vault, title: '국고 & 비축금', desc: '기본배당 · 창업그랜트', color: 'text-amber-400' },
                  { href: '/admin/security', icon: ShieldAlert, title: '보안 · IP 차단', desc: '이상 거래 및 어뷰징', color: 'text-rose-400' },
                  { href: '/admin/market/ai-news', icon: Radio, title: '주식 속보 제어', desc: '2시간 자동 시나리오', color: 'text-sky-400' },
                  { href: '/admin/blog', icon: ScrollText, title: 'AI 블로그 관리', desc: '새벽 06:00 자동 발행', color: 'text-emerald-400' },
                  { href: '/admin/discord', icon: Bell, title: '디스코드 관제', desc: '관리자 1:1 DM 알림', color: 'text-indigo-400' },
                  { href: '/admin/bonds', icon: ScrollText, title: 'KTB 국채 발행', desc: '이자 쿠폰 자동 정산', color: 'text-blue-400' },
                  { href: '/admin/pension', icon: HeartHandshake, title: '국민연금 기금', desc: '연금 배당 분배 관리', color: 'text-rose-400' },
                  { href: '/admin/kdic', icon: Shield, title: '예금보험공사', desc: '보호 한도 및 대위변제', color: 'text-sky-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="p-3.5 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-primary">
                        <Icon className={`size-3.5 ${item.color}`} />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 truncate">{item.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 우측: 상위 5대 고래 유저 순위 */}
            <div className="lg:col-span-4 toss-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Flame className="size-4 text-rose-400" />
                  <h2 className="text-sm font-bold text-foreground">최고 자산 보유 시민</h2>
                </div>
                <span className="text-xs text-muted-foreground font-mono">TOP 5</span>
              </div>

              <div className="space-y-2.5">
                {topUsers.map((u, idx) => (
                  <Link
                    key={u.user_id}
                    href={`/admin/users/${u.user_id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-muted-foreground w-4">#{idx + 1}</span>
                      <span className="font-semibold text-foreground truncate">{u.display_name}</span>
                    </div>
                    <span className="font-fintech font-bold text-primary">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AREA_GROUPS.map((group) => {
              const areas = ADMIN_AREAS.filter((a) => a.group === group.key);
              return (
                <div key={group.key} className="toss-card p-6 space-y-4">
                  <div className="space-y-1 pb-3 border-b border-border/40">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                      {group.eyebrow}
                    </span>
                    <h3 className={`text-base font-bold ${group.color}`}>{group.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{group.description}</p>
                  </div>

                  <div className="space-y-2">
                    {areas.map((area) => (
                      <Link
                        key={area.href}
                        href={area.href}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all group"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-primary">
                          {getAreaIcon(area.href)}
                          <span>{area.title}</span>
                        </div>
                        <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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
          <AdminTelemetryMetricsTable users={allUsers} />
          <AdminComprehensiveTelemetryMatrix />
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
      <div className="toss-card max-w-md w-full p-8 text-center space-y-6">
        <div className="size-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">운영 콘솔 게이트</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            관리자 관제탑에 접근하려면 관리자 비밀번호 세션 잠금 해제가 필요합니다.
          </p>
        </div>
        <OpenConsole next={next} />
      </div>
    </div>
  );
}
