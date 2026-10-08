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
import { DailyLuckyWheel } from '@/components/daily-lucky-wheel';
import { DailyFinancialQuizStation } from '@/components/daily-financial-quiz';
import { InvestmentProfileQuiz } from '@/components/investment-profile-quiz';
import { PortfolioBattleArena } from '@/components/portfolio-battle-arena';
import { LiveMarketPulseTicker } from '@/components/live-market-pulse-ticker';
import { LiveHallOfFameTicker } from '@/components/live-hall-of-fame-ticker';
import { DailyEconomicQuestStation } from '@/components/daily-economic-quest-station';
import { MacroLiquidityDashboard } from '@/components/macro-liquidity-dashboard';
import { DiscordBanner } from '@/components/discord-banner';
import { LiveHotTimeBanner } from '@/components/live-hot-time-banner';
import { DailyAttendanceRoulette } from '@/components/daily-attendance-roulette';
import { AntiInflationBurnEventCard } from '@/components/anti-inflation-burn-event-card';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { PvpArenaLaunchCard } from '@/components/pvp-arena-launch-card';
import { BlackMarketLaunchCard } from '@/components/black-market-launch-card';
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
        className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-md p-5 sm:p-8 hover:border-primary/30 transition-all duration-200 zero-overflow-shield"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              WOLDEOK MONEYVERSE · <T korean="실시간 분산 경제 원장 가동 중" english="Live Distributed Ledger" japanese="リアルタイム分散型経済元帳稼働中" chinese="实时分布式经济账本运行中" />
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <T korean="100% 무손실 원장 보호" english="100% Lossless Ledger" japanese="100%無損失元帳保護" chinese="100%无损账本保障" />
          </div>
        </div>

        <div className="grid gap-6 pt-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="min-w-0 max-w-full">
            <p id="hero-balance-heading" className="text-xs sm:text-sm font-semibold text-muted-foreground">
              <T korean="내 가상 자산 총액" english="Total Virtual Net Worth" japanese="私の仮想資産総額" chinese="我的虚拟总资产" />
            </p>
            <div className="mt-2 font-mono tabular-nums text-[clamp(1.5rem,5vw,3.5rem)] font-black tracking-tight text-foreground flex items-baseline gap-2 min-w-0 max-w-full overflow-hidden">
              <WalletGlance />
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
              <T
                korean="직업 급여, 예적금 이자, 가상 주식 평가액이 PostgreSQL 원장 기준으로 실시간 통합 관리됩니다."
                english="Your career salary, compound interest, and stock equity are aggregated in real-time."
                japanese="職業給与、複利利息、株式評価額がPostgreSQL元帳ベースでリアルタイム統合管理されます。"
                chinese="职业薪酬、复利利息及股票估值基于PostgreSQL分布式账本实时合并管理。"
              />
            </p>
          </div>

          {/* Wallet and core quick actions (responsive, touch-friendly) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-2.5">
            <Link
              href="/wallet"
              className="flex min-h-[56px] min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-muted/40 p-3 shadow-xs transition-all hover:border-primary/40 hover:bg-muted active:scale-[0.98]"
            >
              <Coins aria-hidden="true" className="size-5 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block text-xs font-bold text-foreground"><T korean="덕지갑" english="Wallet" japanese="ウォレット" chinese="钱包" /></span>
                <span className="block text-[10px] text-muted-foreground"><T korean="잔액 및 내역" english="Balance & activity" japanese="残高と履歴" chinese="余额与记录" /></span>
              </span>
            </Link>
            <div className="flex flex-col justify-center min-w-0">
              <P2PTransferModal triggerText="1:1 P2P 안심 송금" />
            </div>

            <Link
              href="/work"
              className="flex items-center gap-2 min-[360px]:gap-2.5 min-[400px]:gap-3 p-2 min-[360px]:p-2.5 min-[400px]:p-3 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-blue-500/40 transition-all active:scale-[0.98] group min-h-[50px] sm:min-h-[56px] shadow-xs min-w-0"
            >
              <div className="grid size-7.5 min-[360px]:size-8.5 min-[400px]:size-9.5 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-primary-foreground transition-colors">
                <Briefcase className="size-4 min-[400px]:size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-foreground truncate leading-tight">
                  <T korean="직업 출근" english="Careers" japanese="職業出勤" chinese="职业上班" />
                </span>
                <span className="block text-[9px] min-[360px]:text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  <T korean="일일 급여 수령" english="Daily Salary" japanese="日次給与受取" chinese="领取每日薪资" />
                </span>
              </div>
            </Link>

            <Link
              href="/stocks"
              className="flex items-center gap-2 min-[360px]:gap-2.5 min-[400px]:gap-3 p-2 min-[360px]:p-2.5 min-[400px]:p-3 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-emerald-500/40 transition-all active:scale-[0.98] group min-h-[50px] sm:min-h-[56px] shadow-xs min-w-0"
            >
              <div className="grid size-7.5 min-[360px]:size-8.5 min-[400px]:size-9.5 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-primary-foreground transition-colors">
                <TrendingUp className="size-4 min-[400px]:size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-foreground truncate leading-tight">
                  <T korean="주식 거래" english="Stocks" japanese="株式取引" chinese="股票交易" />
                </span>
                <span className="block text-[9px] min-[360px]:text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  <T korean="10-Depth 호가 매매" english="Orderbook" japanese="10-Depth気配値取引" chinese="10档深度盘口交易" />
                </span>
              </div>
            </Link>

            <Link
              href="/bank"
              className="flex items-center gap-2 min-[360px]:gap-2.5 min-[400px]:gap-3 p-2 min-[360px]:p-2.5 min-[400px]:p-3 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-purple-500/40 transition-all active:scale-[0.98] group min-h-[50px] sm:min-h-[56px] shadow-xs min-w-0"
            >
              <div className="grid size-7.5 min-[360px]:size-8.5 min-[400px]:size-9.5 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-primary-foreground transition-colors">
                <Landmark className="size-4 min-[400px]:size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-foreground truncate leading-tight">
                  <T korean="가상 은행" english="Bank" japanese="仮想銀行" chinese="虚拟银行" />
                </span>
                <span className="block text-[9px] min-[360px]:text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  <T korean="복리 저축·국채" english="Savings & Bonds" japanese="複利貯蓄・国債" chinese="复利储蓄·国债" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 1.35 LIVE HOT-TIME BUFF & ECONOMIC BOOSTER BANNER */}
      <div className="w-full max-w-full min-w-0">
        <LiveHotTimeBanner />
      </div>

      {/* 1.36 7-DAY ATTENDANCE & DOPAMINE LUCKY ROULETTE */}
      <div className="w-full max-w-full min-w-0">
        <DailyAttendanceRoulette />
      </div>

      {/* 1.37 ANTI-INFLATION WLD BURN FESTIVAL & SPECIAL EVENTS */}
      <div className="w-full max-w-full min-w-0">
        <AntiInflationBurnEventCard />
      </div>

      {/* 1.38 1:1 LIVE PVP ARENA & MIDNIGHT BLACK MARKET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full min-w-0">
        <PvpArenaLaunchCard />
        <BlackMarketLaunchCard />
      </div>

      {/* 1.4 LIVE HALL OF FAME & REAL-TIME ACTIVITY TICKER */}
      <LiveHallOfFameTicker />

      {/* 1.5 REAL-TIME MARKET PULSE TICKER */}
      <LiveMarketPulseTicker />

      {/* 2. ONBOARDING & RETENTION HERO: 3단계 실전 로드맵 & 6대 기능 설명 센터 */}
      <section aria-labelledby="onboarding-guide-heading" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: 초·중·후반 3단계 실전 로드맵 */}
        <Link
          href="/roadmap"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-card to-background p-5 shadow-sm transition-all hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-950/30 active:scale-[0.99]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <Sparkles className="size-3.5" />
                <span><T korean="3단계 실전 로드맵" english="3-Stage Roadmap" japanese="3段階実践ロードマップ" chinese="三阶段实战路线图" /></span>
              </div>
              <Badge className="bg-emerald-500 text-black text-[10px] font-black">
                HOT
              </Badge>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground group-hover:text-emerald-400 transition-colors">
                <T korean="초반 · 중반 · 후반 실전 플레이 가이드" english="Getting Started 3-Stage Master Guide" japanese="序盤・中盤・終盤の実践プレイガイド" chinese="前期·中期·后期实战游戏指南" />
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                <T
                  korean="1일차 시드 10만 WLD부터 7일차 복리·주식 1,000만, 30일차 건물주까지 60fps 비디오 시뮬레이터로 3분 만에 마스터하세요."
                  english="From 100k WLD seed to 10M compound & stocks to mega-city real estate landlord in 3 minutes."
                  japanese="1日目のシード10万WLDから7日目の複利・株式1,000万、30日目のビルオーナーまで60fpsシミュレーターで3分でマスターできます。"
                  chinese="从第1天10万WLD初始本金到第7天复利·股票1,000万，再到第30天房产大亨，通过60fps视频模拟器3分钟轻松掌握。"
                />
              </p>
            </div>

            {/* 3단계 미니 칩 */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <T korean="🌱 1단계: 시드 10만" english="🌱 Stage 1: 100k Seed" japanese="🌱 ステージ1: シード10万" chinese="🌱 阶段一: 初始10万" />
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <T korean="📈 2단계: 복리/주식 1,000만" english="📈 Stage 2: 10M Stocks" japanese="📈 ステージ2: 複利/株式1000万" chinese="📈 阶段二: 复利/股票1000万" />
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <T korean="👑 3단계: 건물주 1억" english="👑 Stage 3: 100M Landlord" japanese="👑 ステージ3: 不動産1億" chinese="👑 阶段三: 亿级大亨" />
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span><T korean="60fps 영상 시뮬레이터로 보기" english="Watch 60fps Video Simulator" japanese="60fps動画シミュレーターで見る" chinese="观看60fps视频模拟演示" /></span>
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Banner 2: 6대 핀테크 기능 조작법 & 30초 AI 투자성향 진단 */}
        <Link
          href="/features"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-background p-5 shadow-sm transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.99]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                <Layers className="size-3.5" />
                <span><T korean="실제 화면 6대 기능 설명서" english="Visual 6 Core Features" japanese="実画面6大機能マニュアル" chinese="实操界面六大核心功能指南" /></span>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                🎁 +170,000 WLD
              </Badge>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                <T korean="6대 핀테크 기능 조작법 & AI 투자 진단" english="6 Core Features Guide & AI Profile Quiz" japanese="6大フィンテック機能操作ガイド＆AI投資診断" chinese="六大金融科技功能操作指南与AI投资诊断" />
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                <T
                  korean="주식 10-Depth 호가창, 복리 포켓, 직업 파밍, 메가시티 랜드의 실제 화면 스크린샷과 30초 맞춤형 포트폴리오 진단을 확인하세요."
                  english="Explore live orderbooks, compound savings, career shifts, real estate with 30s personalized allocation."
                  japanese="株式10-Depth気配値、複利ポケット、職業ファーミング、メガシティランドの実画面スクリーンショットと30秒のカスタム診断をご確認ください。"
                  chinese="查看股票10档深度盘口、复利口袋、职业打工、元宇宙地产的实际界面截图及30秒定制化投资组合诊断。"
                />
              </p>
            </div>

            {/* 6대 기능 미니 뱃지 */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-zinc-300">
                <T korean="📊 주식 거래소" english="📊 Stock Exchange" japanese="📊 株式取引所" chinese="📊 股票交易所" />
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-zinc-300">
                <T korean="🏦 복리 은행" english="🏦 Compound Bank" japanese="🏦 複利銀行" chinese="🏦 复利银行" />
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-zinc-300">
                <T korean="🏢 메가시티 랜드" english="🏢 Megacity Land" japanese="🏢 メガシティランド" chinese="🏢 元宇宙地产" />
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-zinc-300">
                <T korean="🎯 투자 성향 진단" english="🎯 AI Profile Quiz" japanese="🎯 投資タイプ診断" chinese="🎯 投资偏好诊断" />
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
            <span><T korean="기능 조작법 및 AI 진단 열기" english="Explore Features & AI Quiz" japanese="機能ガイドとAI診断を開く" chinese="开启功能指南与AI诊断" /></span>
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* 2.5 INTERACTIVE 30-SEC AI INVESTMENT PROFILE & ALLOCATION QUIZ */}
      <InvestmentProfileQuiz />

      {/* 2.8 DAILY ECONOMIC QUEST & CHALLENGE PASS */}
      <DailyEconomicQuestStation />

      {/* 3. 2026 FEATURE STRIP: 3대 금융 계산기 허브 & 일일 리텐션 스테이션 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: 3대 금융 웹 계산기 (pSEO 2만+ 엔진) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-amber-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="금융 웹 도구 허브" english="Financial Tools Hub" japanese="金融Webツールハブ" chinese="金融工具中心" />
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
                japanese="複利預貯金計算機、KOSPI/NASDAQ 2,000+銘柄のナンピン平均単価計算機を無料でご利用いただけます。"
                chinese="免费使用复利储蓄计算器以及全球2,000+标的加仓补仓均价计算器。"
              />
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Link href="/tools/compound-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                <T korean="복리 이자 계산기" english="Compound Calculator" japanese="複利利息計算機" chinese="复利计算器" />
              </Link>
              <Link href="/tools/stock-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                <T korean="물타기 계산기" english="DCA Calculator" japanese="ナンピン計算機" chinese="补仓均价计算器" />
              </Link>
              <Link href="/tools/farming-calculator" className="text-[11px] font-semibold px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground">
                <T korean="직업 시뮬레이터" english="Career Simulator" japanese="職業シミュレーター" chinese="职业模拟器" />
              </Link>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold min-h-[40px]">
            <Link href="/tools">
              <T korean="전체 계산기 둘러보기" english="Explore All Calculators" japanese="すべての計算機を見る" chinese="浏览全部计算器" /> <ChevronRight className="ml-1 size-3.5" />
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
                  <T korean="일일 럭키 룰렛" english="Daily Lucky Roulette" japanese="デイリーラッキールーレット" chinese="每日幸运转盘" />
                </h2>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10">
                <T korean="100% 당첨 보장" english="100% Win" japanese="100%当選保証" chinese="100%必中保障" />
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              <T
                korean="매일 1회 무료 룰렛을 돌리고 최대 5,000 WLD 잭팟과 7일 연속 출석 스트릭 보상을 획득하세요."
                english="Spin the free daily wheel for up to 5,000 WLD jackpot and claim 7-day streak rewards."
                japanese="毎日1回無料のルーレットを回して最大5,000 WLDジャックポットと7日連続出席報酬を獲得しましょう。"
                chinese="每日免费抽取幸运转盘，赢取最高5,000 WLD大奖及7日连续签到连胜奖励。"
              />
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Sparkles className="size-3.5" />
              <span><T korean="오늘의 출석 보상: 100 ~ 1,000 WLD 대기 중" english="Daily Streak Reward: 100 ~ 1,000 WLD" japanese="本日の出席報酬: 100 ~ 1,000 WLD" chinese="今日签到奖励: 100 ~ 1,000 WLD" /></span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 min-h-[40px]">
            <Link href="/#attendance">
              <T korean="출석 룰렛 돌리기" english="Spin Roulette" japanese="出席ルーレットを回す" chinese="启动签到转盘" /> <ArrowRight className="ml-1 size-3.5" />
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
                  <T korean="주가 예측 배팅" english="Stock Price Prediction" japanese="株価予測ベッティング" chinese="股价涨跌预测" />
                </h2>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold text-blue-500 bg-blue-500/10">
                <T korean="상금 5,000 WLD 풀" english="5,000 WLD Pool" japanese="賞金 5,000 WLD プール" chinese="5,000 WLD 奖金池" />
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              <T
                korean="매일 15:30 마감! 가상주식 3종 및 코스피/나스닥 종가 상승/하락을 맞추고 균등 배당금을 수령하세요."
                english="Closes 15:30 daily! Forecast up/down closes for top virtual stocks and split the dividend pool."
                japanese="毎日15:30締切！仮想株式3種およびKOSPI/NASDAQ終値の上昇/下落を予測し、配当金を山分けしましょう。"
                chinese="每日15:30截止！预测3大虚拟股票及大盘涨跌走势，瓜分丰厚红利奖金池。"
              />
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-blue-400">
              <Trophy className="size-3.5" />
              <span><T korean="연속 3회 적중 시 '월가의 현자' 칭호 지급" english="Hit 3 in a row to earn 'Sage of Wall Street'" japanese="3回連続的中で「ウォール街の賢者」称号付与" chinese="连续命中3次即可获得“华尔街智者”荣誉称号" /></span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="mt-4 w-full rounded-xl text-xs font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10 min-h-[40px]">
            <Link href="/stocks">
              <T korean="예측 투표 참여하기" english="Join Prediction" japanese="予測投票に参加" chinese="参与预测竞猜" /> <ChevronRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 3.5. DISCORD BOT DEEPLINK & WEB ATTENDANCE BONUS BANNER */}
      <DiscordBanner />

      {/* 3.8 DAILY LUCKY WHEEL (일일 행운의 룰렛 & 바이럴 공유 스테이션) */}
      <div id="attendance" className="scroll-mt-20">
        <DailyLuckyWheel />
      </div>

      {/* 3.9 DAILY FINANCIAL LITERACY QUIZ STATION */}
      <div id="financial-quiz" className="scroll-mt-20">
        <DailyFinancialQuizStation />
      </div>

      {/* 3.95 PORTFOLIO 1v1 BATTLE ARENA */}
      <PortfolioBattleArena />

      {/* 3.98 MACRO ECONOMIC & LIQUIDITY DASHBOARD */}
      <MacroLiquidityDashboard />

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
                  <T korean="가상 주식 시장 주요 종목" english="Hot Stock Highlights" japanese="仮想株式市場の注目銘柄" chinese="虚拟股票市场热门标的" />
                </h2>
              </div>
              <Link href="/stocks" className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1">
                <T korean="거래소 바로가기" english="View Exchange" japanese="取引所へ行く" chinese="前往交易所" /> <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="divide-y divide-border/50 mt-2">
              <Link href="/stocks/WDG" className="py-3 flex items-center justify-between hover:bg-muted/30 px-1 rounded-lg transition-colors">
                <div>
                  <b className="text-sm font-bold text-foreground">
                    <T korean="월덕게임즈 (WDG)" english="Woldeok Games (WDG)" japanese="ウォルドクゲームズ (WDG)" chinese="月德游戏 (WDG)" />
                  </b>
                  <span className="block text-[11px] text-muted-foreground">
                    <T korean="가상 엔터테인먼트 · 시총 1위" english="Virtual Entertainment · #1 Market Cap" japanese="仮想エンタメ・時価総額1位" chinese="虚拟娱乐·市值第一" />
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
                    <T korean="월덱테크 (WDT)" english="Woldek Tech (WDT)" japanese="ウォルデックテック (WDT)" chinese="沃德科技 (WDT)" />
                  </b>
                  <span className="block text-[11px] text-muted-foreground">
                    <T korean="가상 AI & 클라우드 기술주" english="Virtual AI & Cloud Tech" japanese="仮想AI＆クラウドテック" chinese="虚拟AI与云科技龙头" />
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
                    <T korean="치무테크 (CHIMU)" english="Chimu Tech (CHIMU)" japanese="チムテック (CHIMU)" chinese="芝木科技 (CHIMU)" />
                  </b>
                  <span className="block text-[11px] text-muted-foreground">
                    <T korean="메타버스 로보틱스" english="Metaverse Robotics" japanese="メタバースロボティクス" chinese="元宇宙机器人" />
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
            <span><T korean="호가 체결 틱 주기" english="Order Tick Rate" japanese="約定ティック周期" chinese="撮合周期" />: 10s</span>
            <Link href="/stocks/alerts" className="font-semibold text-foreground hover:underline">
              <T korean="목표가 알림 설정" english="Price Alerts" japanese="目標価格アラート設定" chinese="目标价提醒设置" />
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
                  <T korean="직업 업무 스테이션" english="Career Mastery" japanese="職業業務ステーション" chinese="职业工作站" />
                </h2>
              </div>
              <Link href="/work" className="text-xs font-semibold text-blue-500 hover:underline inline-flex items-center gap-1">
                <T korean="출근하기" english="Start Work" japanese="出勤する" chinese="打卡上班" /> <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">
                    <T korean="시니어 프로그래머" english="Senior Programmer" japanese="シニアプログラマー" chinese="资深程序员" />
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <T korean="업무 완료 시 +2,200 WLD 급여" english="+2,200 WLD salary on completion" japanese="業務完了時 +2,200 WLD 給与" chinese="完成工作发放 +2,200 WLD 薪资" />
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  Lv.4 <T korean="마스터" english="Master" japanese="マスター" chinese="大师" />
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">
                    <T korean="퀀트 트레이더" english="Quant Trader" japanese="クオンツトレーダー" chinese="量化交易员" />
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <T korean="매매 수수료 15% 감면 혜택" english="15% Trading Fee Discount" japanese="取引手数料15%割引特典" chinese="尊享交易手续费85折优惠" />
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  Lv.2 <T korean="전문직" english="Pro" japanese="プロ" chinese="专业" />
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span><T korean="일일 남은 업무: 5회" english="Remaining Daily Tasks: 5" japanese="本日の残り業務: 5回" chinese="今日剩余工作: 5次" /></span>
            <Link href="/work" className="font-semibold text-primary hover:underline">
              <T korean="업무 루틴 시작하기" english="Start Career Routine" japanese="業務ルーティンを開始" chinese="开启每日工作" />
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
                <T korean="공식 공지사항 & 패치노트" english="Announcements & Releases" japanese="公式お知らせ＆パッチノート" chinese="官方公告与更新日志" />
              </h2>
            </div>
            <Link href="/newspaper" className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1">
              <T korean="전체보기" english="View All" japanese="すべて見る" chinese="查看全部" /> <ChevronRight className="size-3" />
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
