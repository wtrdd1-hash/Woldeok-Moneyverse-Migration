import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  Briefcase,
  Landmark,
  ShieldCheck,
  Send,
  Coins,
  ChevronRight,
  ArrowRight,
  Compass,
  CheckCircle2,
  Bell,
  Sparkles,
  Layers,
  Calculator,
  Flame,
  Trophy,
  Gift,
  Share2,
  BarChart3,
  Percent,
} from 'lucide-react';
import { WalletGlance } from '@/components/wallet-glance';
import { LobbyCount } from '@/components/lobby-count';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { CasualDopamineStation } from '@/components/casual-dopamine-station';
import { TranslatedText as T } from '@/components/translated-text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';

export const revalidate = 60;

const homeOgImage = buildOgImageUrl({
  title: '월덕 머니버스 — 2026 차세대 핀테크 가상경제 플랫폼',
  description:
    'Discord 연동 실시간 가상 경제 원장, 10대 가상 주식 거래소, 3대 금융 웹 계산기 및 7일 출석 룰렛.',
  type: 'default',
  badge: '2026 Next-Gen FinTech',
});

export const metadata: Metadata = {
  title: { absolute: '월덕 머니버스 — Discord 커뮤니티 가상경제와 게임 보상' },
  description:
    '실시간 금융 원장, 10대 가상 주식 거래소, 고정밀 복리/물타기 계산기 및 일일 리텐션 보상을 제공하는 월덕 머니버스입니다.',
  alternates: { canonical: canonicalUrl('/') },
  openGraph: {
    title: '월덕 머니버스 — Discord 커뮤니티 가상경제와 게임 보상',
    description:
      '실시간 금융 원장, 10대 가상 주식 거래소, 고정밀 복리/물타기 계산기 및 일일 리텐션 보상을 제공하는 월덕 머니버스입니다.',
    url: canonicalUrl('/'),
    images: [{ url: homeOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '월덕 머니버스',
    description: '2026 차세대 핀테크 가상경제 플랫폼',
    images: [homeOgImage],
  },
};

interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly isPinned?: boolean;
  readonly publishedAt: string | null;
}

export default async function HomePage() {
  const announcements = await publicApi<{ announcements: Announcement[] }>(
    '/api/v1/announcements',
    60,
  );

  const notices = announcements?.announcements.slice(0, 3) ?? [];

  return (
    <div data-page="home" className="mv-page mv-page--community mx-auto w-full max-w-[1440px] space-y-8 sm:space-y-10 pb-20 sm:pb-12">
      {/* 1. TOP HERO: 2026 Asymmetric Bento Grid 2.0 (2x2 메인 자산 히어로 & 4대 퀵 액션) */}
      <section
        aria-labelledby="hero-balance-heading"
        className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md p-5 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              WOLDEOK MONEYVERSE · <T korean="실시간 분산 경제 원장 가동 중" english="Live Distributed Ledger" />
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <T korean="100% 무손실 원장 보호" english="100% Lossless Ledger" />
          </div>
        </div>

        <div className="grid gap-6 pt-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p id="hero-balance-heading" className="text-xs sm:text-sm font-semibold text-muted-foreground">
              <T korean="내 가상 자산 총액" english="Total Virtual Net Worth" />
            </p>
            <div className="mt-2 font-mono tabular-nums text-[clamp(2.25rem,6vw,3.75rem)] font-black tracking-tight text-foreground flex items-baseline gap-2">
              <WalletGlance />
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
              <T
                korean="직업 급여, 예적금 이자, 가상 주식 평가액이 PostgreSQL 원장 기준으로 실시간 통합 관리됩니다."
                english="Your career salary, compound interest, and stock equity are aggregated in real-time."
              />
            </p>
          </div>

          {/* 4 Core Quick Actions (44px+ 터치 타깃 & Inset Border 준수) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 sm:gap-3">
            <Link
              href="/wallet"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-amber-500/40 transition-all active:scale-[0.98] group min-h-[56px] shadow-xs"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-primary-foreground transition-colors">
                <Send className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="돈 보내기" english="Transfer" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="무수수료 멱등 송금" english="Zero Fee" />
                </span>
              </div>
            </Link>

            <Link
              href="/work"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-blue-500/40 transition-all active:scale-[0.98] group min-h-[56px] shadow-xs"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-primary-foreground transition-colors">
                <Briefcase className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="직업 출근" english="Careers" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="일일 급여 수령" english="Daily Salary" />
                </span>
              </div>
            </Link>

            <Link
              href="/stocks"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-emerald-500/40 transition-all active:scale-[0.98] group min-h-[56px] shadow-xs"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-primary-foreground transition-colors">
                <TrendingUp className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="주식 거래" english="Stocks" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="10-Depth 호가 매매" english="Orderbook" />
                </span>
              </div>
            </Link>

            <Link
              href="/bank"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-purple-500/40 transition-all active:scale-[0.98] group min-h-[56px] shadow-xs"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-primary-foreground transition-colors">
                <Landmark className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="가상 은행" english="Bank" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="복리 저축·국채" english="Savings & Bonds" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 2026 FEATURE STRIP: 3대 금융 계산기 허브 & 일일 리텐션 스테이션 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: 3대 금융 웹 계산기 (pSEO 2만+ 엔진) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-amber-500" />
                <h2 className="text-sm font-bold text-foreground">금융 웹 도구 허브</h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-amber-500 border-amber-500/30">
                20,000+ pSEO
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              복리 예적금 계산기, 코스피/나스닥 2,000+ 종목 물타기 평단가 계산기를 무료로 이용하세요.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Link href="/tools/compound-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                복리 이자 계산기
              </Link>
              <Link href="/tools/stock-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                물타기 계산기
              </Link>
              <Link href="/tools/farming-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                직업 시뮬레이터
              </Link>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold min-h-[40px]">
            <Link href="/tools">
              전체 계산기 둘러보기 <ChevronRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Card 2: 7일 연속 출석 & 럭키 룰렛 */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Gift className="size-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-foreground">일일 럭키 룰렛</h2>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10">
                100% 당첨 보장
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              매일 1회 무료 룰렛을 돌리고 최대 1억 WLD 잭팟과 7일 연속 출석 스트릭 보상을 획득하세요.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Sparkles className="size-3.5" />
              <span>오늘의 출석 보상: 10,000,000 WLD 대기 중</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 min-h-[40px]">
            <Link href="/#attendance">
              출석 룰렛 돌리기 <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Card 3: 일일 주가 UP/DOWN 예측 배팅 */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-blue-500" />
                <h2 className="text-sm font-bold text-foreground">주가 예측 배팅</h2>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold text-blue-500 bg-blue-500/10">
                상금 5,000만 WLD
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              매일 15:30 마감! 가상주식 3종 및 코스피/나스닥 종가 상승/하락을 맞추고 균등 배당금을 수령하세요.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-blue-400">
              <Trophy className="size-3.5" />
              <span>연속 3회 적중 시 '월가의 현자' 칭호 지급</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10 min-h-[40px]">
            <Link href="/stocks">
              예측 투표 참여하기 <ChevronRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. CASUAL DOPAMINE STATION: 일반 유저 무료 도파민 (피버, 덕이 펫, 여론 잭팟, 1:1 결투) */}
      <CasualDopamineStation />

      {/* 4. DUAL-COLUMN LIVE DASHBOARD: 주식 시장 핫 종목 & 직업 업무 스테이션 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: 가상 주식 시장 주요 종목 */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="가상 주식 시장 주요 종목" english="Hot Stock Highlights" />
                </h2>
              </div>
              <Link href="/stocks" className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1">
                <T korean="거래소 바로가기" english="View Exchange" /> <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="divide-y divide-border/50 mt-2">
              <Link href="/stocks/WDG" className="py-3 flex items-center justify-between hover:bg-muted/30 px-1 rounded-lg transition-colors">
                <div>
                  <b className="text-sm font-bold text-foreground">월덕게임즈 (WDG)</b>
                  <span className="block text-[11px] text-muted-foreground">가상 엔터테인먼트 · 시총 1위</span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums text-sm font-bold text-foreground">1,450 WLD</span>
                  <span className="block font-mono tabular-nums text-[11px] font-bold text-emerald-500">+4.8% ▲</span>
                </div>
              </Link>

              <Link href="/stocks/WDT" className="py-3 flex items-center justify-between hover:bg-muted/30 px-1 rounded-lg transition-colors">
                <div>
                  <b className="text-sm font-bold text-foreground">월덱테크 (WDT)</b>
                  <span className="block text-[11px] text-muted-foreground">가상 AI &amp; 클라우드 기술주</span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums text-sm font-bold text-foreground">1,714 WLD</span>
                  <span className="block font-mono tabular-nums text-[11px] font-bold text-emerald-500">+3.2% ▲</span>
                </div>
              </Link>

              <Link href="/stocks/CHIMU" className="py-3 flex items-center justify-between hover:bg-muted/30 px-1 rounded-lg transition-colors">
                <div>
                  <b className="text-sm font-bold text-foreground">치무테크 (CHIMU)</b>
                  <span className="block text-[11px] text-muted-foreground">메타버스 로보틱스</span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums text-sm font-bold text-foreground">3,140 WLD</span>
                  <span className="block font-mono tabular-nums text-[11px] font-bold text-rose-500">-1.2% ▼</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span><T korean="호가 체결 틱 주기" english="Order Tick Rate" />: 10s</span>
            <Link href="/stocks/alerts" className="font-semibold text-foreground hover:underline">
              <T korean="목표가 알림 설정" english="Price Alerts" />
            </Link>
          </div>
        </div>

        {/* Right: 직업 업무 스테이션 & 일일 퀘스트 */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-blue-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="직업 업무 스테이션" english="Career Mastery" />
                </h2>
              </div>
              <Link href="/work" className="text-xs font-semibold text-blue-500 hover:underline inline-flex items-center gap-1">
                <T korean="출근하기" english="Start Work" /> <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">시니어 프로그래머</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">업무 완료 시 +5,000,000 WLD 급여</p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  Lv.4 마스터
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">퀀트 트레이더</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">매매 수수료 15% 감면 혜택</p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  Lv.2 전문직
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>일일 남은 업무: 5회</span>
            <Link href="/work" className="font-semibold text-primary hover:underline">
              업무 루틴 시작하기
            </Link>
          </div>
        </div>
      </div>

      {/* 5. NOTICE & ANNOUNCEMENTS */}
      {notices.length > 0 && (
        <section aria-labelledby="notices-heading" className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 sm:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-amber-500" />
              <h2 id="notices-heading" className="text-sm font-bold text-foreground">
                <T korean="공식 공지사항 & 패치노트" english="Announcements & Releases" />
              </h2>
            </div>
            <Link href="/newspaper" className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1">
              <T korean="전체보기" english="View All" /> <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/50 mt-2">
            {notices.map((n) => (
              <div key={n.announcementId} className="py-2.5 flex items-center justify-between hover:bg-muted/30 px-1 rounded-lg transition-colors">
                <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[80%]">
                  {n.title}
                </span>
                {n.publishedAt && (
                  <time dateTime={n.publishedAt} className="text-[11px] text-muted-foreground shrink-0 font-mono">
                    {formatDay(n.publishedAt)}
                  </time>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. BOTTOM ADVERTISEMENT */}
      <HomeAdvertisement />
    </div>
  );
}
