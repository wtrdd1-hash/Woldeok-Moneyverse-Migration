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
import { DiscordBanner } from '@/components/discord-banner';
import { TranslatedText as T } from '@/components/translated-text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { getServerLocale } from '@/lib/locale-server';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';

export const revalidate = 60;

const HOME_META_BY_LOCALE = {
  en: {
    title: 'Woldeok Moneyverse — Discord Virtual Economy & Game Rewards',
    description: 'Explore real-time virtual economy ledgers, 10 virtual stock exchanges, high-precision compound interest calculators, and daily retention rewards in Woldeok Moneyverse.',
    badge: '2026 Next-Gen FinTech',
    ogTitle: 'Woldeok Moneyverse — Discord Virtual Economy & Game Rewards',
    ogDescription: 'Experience real-time virtual finance, stocks, quests, and mini-games with your Discord community.',
    canonical: '/en',
  },
  ko: {
    title: '월덕 머니버스 — Discord 커뮤니티 가상경제와 게임 보상',
    description: '실시간 금융 원장, 10대 가상 주식 거래소, 고정밀 복리/물타기 계산기 및 일일 리텐션 보상을 제공하는 월덕 머니버스입니다.',
    badge: '2026 Next-Gen FinTech',
    ogTitle: '월덕 머니버스 — Discord 커뮤니티 가상경제와 게임 보상',
    ogDescription: '실시간 금융 원장, 10대 가상 주식 거래소, 고정밀 복리/물타기 계산기 및 일일 리텐션 보상을 제공하는 월덕 머니버스입니다.',
    canonical: '/',
  },
  ja: {
    title: 'ウォルドクマネーバース — Discordコミュニティ仮想経済とゲーム報酬',
    description: 'リアルタイム金融元帳、10大仮想株式取引所、高精度複利/ナンピン計算機および毎日のリテンション報酬を提供するウォルドクマネーバースです。',
    badge: '2026 Next-Gen FinTech',
    ogTitle: 'ウォルドクマネーバース — Discordコミュニティ仮想経済とゲーム報酬',
    ogDescription: 'リアルタイム金融元帳、10大仮想株式取引所、高精度複利計算機およびコミュニティゲームを体験できます。',
    canonical: '/ja',
  },
  zh: {
    title: '沃尔德克金融元宇宙 — Discord社区虚拟经济与游戏奖励',
    description: '提供实时金融账本、十大虚拟股票交易所、高精度复利/补仓计算器及每日留存奖励的沃尔德克金融元宇宙。',
    badge: '2026 Next-Gen FinTech',
    ogTitle: '沃尔德克金融元宇宙 — Discord社区虚拟经济与游戏奖励',
    ogDescription: '提供实时金融账本、十大虚拟股票交易所、高精度复利计算器及社区游戏平台。',
    canonical: '/zh',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = HOME_META_BY_LOCALE[locale] ?? HOME_META_BY_LOCALE.en;

  const ogImage = buildOgImageUrl({
    title: meta.title,
    description: meta.description,
    type: 'default',
    badge: meta.badge,
  });

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/'),
        'en-US': canonicalUrl('/en'),
        'ja-JP': canonicalUrl('/ja'),
        'zh-CN': canonicalUrl('/zh'),
        'x-default': canonicalUrl('/'),
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: canonicalUrl(meta.canonical),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [ogImage],
    },
  };
}

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
          <div className="min-w-0 max-w-full">
            <p id="hero-balance-heading" className="text-xs sm:text-sm font-semibold text-muted-foreground">
              <T korean="내 가상 자산 총액" english="Total Virtual Net Worth" />
            </p>
            <div className="mt-2 font-mono tabular-nums text-[clamp(1.5rem,5vw,3.5rem)] font-black tracking-tight text-foreground flex items-baseline gap-2 min-w-0 max-w-full overflow-hidden">
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
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
            <Link
              href="/wallet"
              className="flex items-center gap-2.5 min-[400px]:gap-3 p-2.5 min-[400px]:p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-amber-500/40 transition-all active:scale-[0.98] group min-h-[52px] sm:min-h-[56px] shadow-xs min-w-0"
            >
              <div className="grid size-8.5 min-[400px]:size-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-primary-foreground transition-colors">
                <Send className="size-4.5 min-[400px]:size-5" />
              </div>
              <div className="min-w-0 flex-1">
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
              className="flex items-center gap-2.5 min-[400px]:gap-3 p-2.5 min-[400px]:p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-blue-500/40 transition-all active:scale-[0.98] group min-h-[52px] sm:min-h-[56px] shadow-xs min-w-0"
            >
              <div className="grid size-8.5 min-[400px]:size-10 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-primary-foreground transition-colors">
                <Briefcase className="size-4.5 min-[400px]:size-5" />
              </div>
              <div className="min-w-0 flex-1">
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
              className="flex items-center gap-2.5 min-[400px]:gap-3 p-2.5 min-[400px]:p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-emerald-500/40 transition-all active:scale-[0.98] group min-h-[52px] sm:min-h-[56px] shadow-xs min-w-0"
            >
              <div className="grid size-8.5 min-[400px]:size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-primary-foreground transition-colors">
                <TrendingUp className="size-4.5 min-[400px]:size-5" />
              </div>
              <div className="min-w-0 flex-1">
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
              className="flex items-center gap-2.5 min-[400px]:gap-3 p-2.5 min-[400px]:p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-purple-500/40 transition-all active:scale-[0.98] group min-h-[52px] sm:min-h-[56px] shadow-xs min-w-0"
            >
              <div className="grid size-8.5 min-[400px]:size-10 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-primary-foreground transition-colors">
                <Landmark className="size-4.5 min-[400px]:size-5" />
              </div>
              <div className="min-w-0 flex-1">
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

      {/* 2. ONBOARDING QUICK BANNER: 3분 머니버스 입문 가이드 & 인터랙티브 허브 */}
      <section aria-labelledby="onboarding-guide-heading">
        <Link
          href="/guide"
          className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-card to-background p-4 sm:p-5 shadow-sm transition-all hover:border-primary/60 hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                  <T korean="3분 만에 마스터하는 머니버스 시작 가이드" english="3-Minute Moneyverse Interactive Guide" />
                </span>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                  NEW
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate [word-break:keep-all]">
                <T
                  korean="5단계 인터랙티브 로드맵 · 1분 자산 시뮬레이터 · 온보딩 퀘스트 & 뱃지 획득하기"
                  english="5-Step Interactive Roadmap · Asset Simulator · Onboarding Quests & Badges"
                />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-primary shrink-0 self-end sm:self-auto">
            <span><T korean="가이드 열기" english="Explore Guide" /></span>
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* 3. 2026 FEATURE STRIP: 3대 금융 계산기 허브 & 일일 리텐션 스테이션 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: 3대 금융 웹 계산기 (pSEO 2만+ 엔진) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-amber-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="금융 웹 도구 허브" english="Financial Tools Hub" />
                </h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-amber-500 border-amber-500/30">
                20,000+ pSEO
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              <T
                korean="복리 예적금 계산기, 코스피/나스닥 2,000+ 종목 물타기 평단가 계산기를 무료로 이용하세요."
                english="Free access to compound interest calculators and dollar-cost averaging tools for 2,000+ stocks."
              />
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Link href="/tools/compound-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                <T korean="복리 이자 계산기" english="Compound Calculator" />
              </Link>
              <Link href="/tools/stock-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                <T korean="물타기 계산기" english="DCA Calculator" />
              </Link>
              <Link href="/tools/farming-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                <T korean="직업 시뮬레이터" english="Career Simulator" />
              </Link>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold min-h-[40px]">
            <Link href="/tools">
              <T korean="전체 계산기 둘러보기" english="Explore All Calculators" /> <ChevronRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Card 2: 7일 연속 출석 & 럭키 룰렛 */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Gift className="size-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="일일 럭키 룰렛" english="Daily Lucky Roulette" />
                </h2>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10">
                <T korean="100% 당첨 보장" english="100% Win" />
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              <T
                korean="매일 1회 무료 룰렛을 돌리고 최대 5,000 WLD 잭팟과 7일 연속 출석 스트릭 보상을 획득하세요."
                english="Spin the free daily wheel for up to 5,000 WLD jackpot and claim 7-day streak rewards."
              />
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Sparkles className="size-3.5" />
              <span><T korean="오늘의 출석 보상: 100 ~ 1,000 WLD 대기 중" english="Daily Streak Reward: 100 ~ 1,000 WLD" /></span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 min-h-[40px]">
            <Link href="/#attendance">
              <T korean="출석 룰렛 돌리기" english="Spin Roulette" /> <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Card 3: 일일 주가 UP/DOWN 예측 배팅 */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-blue-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="주가 예측 배팅" english="Stock Price Prediction" />
                </h2>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold text-blue-500 bg-blue-500/10">
                <T korean="상금 5,000 WLD 풀" english="5,000 WLD Pool" />
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              <T
                korean="매일 15:30 마감! 가상주식 3종 및 코스피/나스닥 종가 상승/하락을 맞추고 균등 배당금을 수령하세요."
                english="Closes 15:30 daily! Forecast up/down closes for top virtual stocks and split the dividend pool."
              />
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-blue-400">
              <Trophy className="size-3.5" />
              <span><T korean="연속 3회 적중 시 '월가의 현자' 칭호 지급" english="Hit 3 in a row to earn 'Sage of Wall Street'" /></span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10 min-h-[40px]">
            <Link href="/stocks">
              <T korean="예측 투표 참여하기" english="Join Prediction" /> <ChevronRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 3.5. DISCORD BOT DEEPLINK & WEB ATTENDANCE BONUS BANNER */}
      <DiscordBanner />

      {/* 4. CASUAL DOPAMINE STATION: 일반 유저 무료 도파민 (피버, 덕이 펫, 여론 잭팟, 1:1 결투) */}
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
                  <b className="text-sm font-bold text-foreground">
                    <T korean="월덕게임즈 (WDG)" english="Woldeok Games (WDG)" />
                  </b>
                  <span className="block text-[11px] text-muted-foreground">
                    <T korean="가상 엔터테인먼트 · 시총 1위" english="Virtual Entertainment · #1 Market Cap" />
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums text-sm font-bold text-foreground">1,450 WLD</span>
                  <span className="block font-mono tabular-nums text-[11px] font-bold text-emerald-500">+4.8% ▲</span>
                </div>
              </Link>

              <Link href="/stocks/WDT" className="py-3 flex items-center justify-between hover:bg-muted/30 px-1 rounded-lg transition-colors">
                <div>
                  <b className="text-sm font-bold text-foreground">
                    <T korean="월덱테크 (WDT)" english="Woldek Tech (WDT)" />
                  </b>
                  <span className="block text-[11px] text-muted-foreground">
                    <T korean="가상 AI & 클라우드 기술주" english="Virtual AI & Cloud Tech" />
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums text-sm font-bold text-foreground">1,714 WLD</span>
                  <span className="block font-mono tabular-nums text-[11px] font-bold text-emerald-500">+3.2% ▲</span>
                </div>
              </Link>

              <Link href="/stocks/CHIMU" className="py-3 flex items-center justify-between hover:bg-muted/30 px-1 rounded-lg transition-colors">
                <div>
                  <b className="text-sm font-bold text-foreground">
                    <T korean="치무테크 (CHIMU)" english="Chimu Tech (CHIMU)" />
                  </b>
                  <span className="block text-[11px] text-muted-foreground">
                    <T korean="메타버스 로보틱스" english="Metaverse Robotics" />
                  </span>
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
                  <span className="text-xs font-bold text-foreground">
                    <T korean="시니어 프로그래머" english="Senior Programmer" />
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <T korean="업무 완료 시 +2,200 WLD 급여" english="+2,200 WLD salary on completion" />
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  Lv.4 <T korean="마스터" english="Master" />
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">
                    <T korean="퀀트 트레이더" english="Quant Trader" />
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <T korean="매매 수수료 15% 감면 혜택" english="15% Trading Fee Discount" />
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  Lv.2 <T korean="전문직" english="Pro" />
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span><T korean="일일 남은 업무: 5회" english="Remaining Daily Tasks: 5" /></span>
            <Link href="/work" className="font-semibold text-primary hover:underline">
              <T korean="업무 루틴 시작하기" english="Start Career Routine" />
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
