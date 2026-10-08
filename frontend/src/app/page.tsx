import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  Briefcase,
  Landmark,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Circle,
  Bell,
  Sparkles,
  Layers,
  Calculator,
  Flame,
  Trophy,
  Gift,
} from 'lucide-react';
import { WalletGlance } from '@/components/wallet-glance';
import { LobbyCount } from '@/components/lobby-count';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { MacroLiquidityDashboard } from '@/components/macro-liquidity-dashboard';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { TranslatedText as T } from '@/components/translated-text';
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
    <div data-page="home" className="mv-page mv-page--community mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-8 pb-20 sm:pb-12">
      {/* =========================================================================
          🏛️ 2026 STRIPE & LINEAR STYLE FINTECH BENTO COCKPIT
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* LEFT / CENTER FINTECH COCKPIT (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6 min-w-0">
          {/* Bento 1: Financial Net Worth Cockpit (Stripe/Revolut High-End) */}
          <section
            aria-labelledby="hero-balance-heading"
            className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#0a1410]/95 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-emerald-500/35 zero-overflow-shield"
          >
            {/* Top Micro-Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-500/15">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                  WOLDEOK LEDGER · <T korean="실시간 분산 경제 원장" english="LIVE DISTRIBUTED LEDGER" japanese="分散型経済元帳" chinese="实时分布式账本" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="size-3 text-emerald-400 shrink-0" />
                <span><T korean="100% 무손실 원장 보호" english="100% Lossless Ledger" japanese="100%無損失元帳保護" chinese="100%无损账本保障" /></span>
              </div>
            </div>

            {/* Asset Metrics & In-line Asset Allocation */}
            <div className="py-5 sm:py-6 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4 items-center">
              <div>
                <p id="hero-balance-heading" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                  <T korean="내 가상 자산 순가치" english="Total Virtual Net Worth" japanese="私の仮想資産総額" chinese="我的虚拟总资产" />
                </p>
                <div className="mt-1.5 font-mono tabular-nums text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-baseline gap-2 min-w-0 max-w-full overflow-hidden">
                  <WalletGlance />
                </div>
                <p className="mt-1 font-mono text-xs text-zinc-400">
                  <T korean="≈ ₩179,460,000 KRW (실시간 가상환율 1:1,000 연동)" english="≈ ₩179,460,000 KRW (Live 1:1,000 Peg)" japanese="≈ ₩179,460,000 KRW (為替連動)" chinese="≈ ₩179,460,000 KRW (实时锚定)" />
                </p>
              </div>

              {/* In-line Asset Allocation Bar (Stripe Dashboard Style) */}
              <div className="p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                  <span><T korean="자산 포트폴리오 구성" english="Asset Allocation" japanese="資産構成比率" chinese="资产配置比例" /></span>
                  <span className="font-mono text-emerald-400 font-bold">100%</span>
                </div>
                {/* 3-Color Asset Allocation Segmented Bar */}
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[62%]" title="현금 지갑 (62%)" />
                  <div className="h-full bg-blue-500 w-[28%]" title="가상 주식 (28%)" />
                  <div className="h-full bg-purple-500 w-[10%]" title="은행 복리 예금 (10%)" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
                  <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> <T korean="현금 62%" english="Cash 62%" japanese="現金 62%" chinese="现金 62%" /></span>
                  <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-blue-500" /> <T korean="주식 28%" english="Stocks 28%" japanese="株式 28%" chinese="股票 28%" /></span>
                  <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-purple-500" /> <T korean="예금 10%" english="Bank 10%" japanese="預金 10%" chinese="储蓄 10%" /></span>
                </div>
              </div>
            </div>

            {/* 4 Core Quick Command Dock (Linear Style Glass Action Bar) */}
            <div className="pt-3 border-t border-emerald-500/15 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              <div className="flex flex-col justify-center min-w-0">
                <P2PTransferModal triggerText="1:1 P2P 안심 송금" />
              </div>

              <Link
                href="/work"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-blue-500/50 transition-all active:scale-[0.98] group min-h-[48px] shadow-xs min-w-0"
              >
                <div className="grid size-7.5 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                  <Briefcase className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-zinc-100 truncate leading-tight">
                    <T korean="직업 출근" english="Careers" japanese="職業出勤" chinese="职业上班" />
                  </span>
                  <span className="block text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                    <T korean="일일 급여 수령" english="Daily Salary" japanese="日次給与受取" chinese="领取每日薪资" />
                  </span>
                </div>
              </Link>

              <Link
                href="/stocks"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-emerald-500/50 transition-all active:scale-[0.98] group min-h-[48px] shadow-xs min-w-0"
              >
                <div className="grid size-7.5 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                  <TrendingUp className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-zinc-100 truncate leading-tight">
                    <T korean="주식 거래" english="Stocks" japanese="株式取引" chinese="股票交易" />
                  </span>
                  <span className="block text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                    <T korean="10-Depth 호가" english="Orderbook" japanese="10-Depth気配値" chinese="10档深度盘口" />
                  </span>
                </div>
              </Link>

              <Link
                href="/bank"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-purple-500/50 transition-all active:scale-[0.98] group min-h-[48px] shadow-xs min-w-0"
              >
                <div className="grid size-7.5 shrink-0 place-items-center rounded-xl bg-purple-500/15 text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors">
                  <Landmark className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-zinc-100 truncate leading-tight">
                    <T korean="가상 은행" english="Bank" japanese="仮想銀行" chinese="虚拟银行" />
                  </span>
                  <span className="block text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                    <T korean="복리 저축·국채" english="Savings & Bonds" japanese="複利貯蓄・国債" chinese="复利储蓄·国债" />
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* Bento 2: 실시간 가상 주식 Top Movers 스트립 (TradingView Style) */}
          <section className="rounded-3xl border border-zinc-800/80 bg-[#0a1410]/90 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-[var(--rise)]" />
                <h3 className="text-sm font-bold text-foreground">
                  <T korean="실시간 가상 주식 핫무버" english="Live Top Movers" japanese="急上昇銘柄" chinese="热门异动股票" />
                </h3>
              </div>
              <Link href="/stocks" className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1">
                <span><T korean="거래소 전체 10개 종목" english="View All 10 Stocks" japanese="全10銘柄を見る" chinese="查看全部10支标的" /></span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <Link href="/stocks/WDG" className="p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-800/60 transition-colors">
                <div className="text-xs font-bold text-foreground truncate">월덕게임즈 (WDG)</div>
                <div className="mt-1 font-mono text-sm font-black text-foreground">1,450 <span className="text-[10px] font-normal text-muted-foreground">WLD</span></div>
                <div className="font-mono text-xs font-bold text-[var(--rise)]">+4.8% ▲</div>
              </Link>

              <Link href="/stocks/WDT" className="p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-800/60 transition-colors">
                <div className="text-xs font-bold text-foreground truncate">월덱테크 (WDT)</div>
                <div className="mt-1 font-mono text-sm font-black text-foreground">1,714 <span className="text-[10px] font-normal text-muted-foreground">WLD</span></div>
                <div className="font-mono text-xs font-bold text-[var(--rise)]">+3.2% ▲</div>
              </Link>

              <Link href="/stocks/CHIMU" className="p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-800/60 transition-colors">
                <div className="text-xs font-bold text-foreground truncate">치무테크 (CHIMU)</div>
                <div className="mt-1 font-mono text-sm font-black text-foreground">3,140 <span className="text-[10px] font-normal text-muted-foreground">WLD</span></div>
                <div className="font-mono text-xs font-bold text-[var(--fall)]">-1.2% ▼</div>
              </Link>

              <Link href="/stocks/SHIN" className="p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-800/60 transition-colors">
                <div className="text-xs font-bold text-foreground truncate">신화바이오 (SHIN)</div>
                <div className="mt-1 font-mono text-sm font-black text-foreground">890 <span className="text-[10px] font-normal text-muted-foreground">WLD</span></div>
                <div className="font-mono text-xs font-bold text-[var(--rise)]">+7.5% ▲</div>
              </Link>
            </div>
          </section>

          {/* Bento 3: 특수 금융 마켓 배너 (텍스트 깨짐 원천 차단) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
            <Link
              href="/arcade"
              className="group p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-[#0a1410] to-[#0a1410] hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                  <Flame className="size-3.5" />
                  <span>실시간 1:1 매칭 · 수수료 3%</span>
                </div>
                <h4 className="text-base font-extrabold text-foreground group-hover:text-amber-400 transition-colors leading-snug">
                  1:1 라이브 배틀 아레나 (PvP)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  시민과 실시간 판돈을 걸고 가위바위보·하이로우 즉석 결투를 펼치세요.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>승부존 입장하기</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/marketplace/auction"
              className="group p-5 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-[#0a1410] to-[#0a1410] hover:border-purple-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400">
                  <Sparkles className="size-3.5" />
                  <span>신화급 한정판 · 100% 국고 소각</span>
                </div>
                <h4 className="text-base font-extrabold text-foreground group-hover:text-purple-400 transition-colors leading-snug">
                  심야 비밀 암시장 한정 경매
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  매일 심야에만 열리는 희귀 영구 버프 및 치장 아이템 실시간 옥션.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-purple-400">
                <span>비밀 암시장 입장하기</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT RETENTION & BOOSTER SIDE RAIL (4 Columns - Clean & Refined) */}
        <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6 min-w-0">
          {/* Rail 1: 7-Day Clean Check-in Strip (No Ugly Wheel Graphics) */}
          <section className="rounded-3xl border border-emerald-500/20 bg-[#0a1410]/95 backdrop-blur-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="size-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">
                  <T korean="7일 연속 출석 체크인" english="7-Day Check-in Streak" japanese="7日連続出席" chinese="7日连续签到" />
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                매일 00:00 초기화
              </span>
            </div>

            {/* Clean 7-Day Timeline Dots (Stripe/Apple Style) */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className="flex flex-col items-center gap-1 p-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-center">
                  <span className="text-[10px] text-muted-foreground">D{day}</span>
                  <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    day === 1 ? 'bg-emerald-500 text-black font-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {day === 7 ? '👑' : day * 10}
                  </div>
                </div>
              ))}
            </div>

            <Button asChild className="w-full h-10 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/15">
              <Link href="/arcade">
                <T korean="오늘의 출석 보상 받기 (+500 WLD)" english="Claim Daily Reward (+500 WLD)" japanese="出席報酬を受け取る" chinese="领取今日签到奖励" />
              </Link>
            </Button>
          </section>

          {/* Rail 2: Live Hot-Time Buff Booster (Compact Card) */}
          <section className="rounded-3xl border border-amber-500/25 bg-[#0a1410]/95 backdrop-blur-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">
                  <T korean="주말 골든 핫타임" english="Golden Hot-Time" japanese="ゴールデンホットタイム" chinese="黄金热力时间" />
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                +50% BOOST
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              전 직업군 근무 완료 시 지급되는 WLD 급여가 1.5배(150%)로 특별 증액 지급됩니다.
            </p>
            <Button asChild variant="outline" className="w-full h-10 rounded-xl font-bold text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              <Link href="/work">
                <T korean="직업 근무하러 가기 (1.5배 급여)" english="Start Career Shift (1.5x Pay)" japanese="職業勤務へ行く" chinese="前往职业上班" />
              </Link>
            </Button>
          </section>

          {/* Rail 3: Clean Daily Missions Checklist */}
          <section className="rounded-3xl border border-zinc-800/80 bg-[#0a1410]/95 backdrop-blur-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">
                  <T korean="일일 경제 퀘스트" english="Daily Quests" japanese="デイリークエスト" chinese="每日任务" />
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">1 / 4 완료</span>
            </div>

            {/* Checklist */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> 직업 근무 1회 완료</span>
                <span className="font-mono text-zinc-400">+500 WLD</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-zinc-300 flex items-center gap-1.5"><Circle className="size-3.5 text-zinc-600" /> 가상 주식 1회 매매</span>
                <span className="font-mono text-zinc-400">+500 WLD</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-zinc-300 flex items-center gap-1.5"><Circle className="size-3.5 text-zinc-600" /> 복리 예적금 이자 확인</span>
                <span className="font-mono text-zinc-400">+1,000 WLD</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-zinc-300 flex items-center gap-1.5"><Circle className="size-3.5 text-zinc-600" /> 금융 계산기 1회 사용</span>
                <span className="font-mono text-zinc-400">+1,000 WLD</span>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full h-9 rounded-xl font-bold text-xs text-muted-foreground hover:text-foreground">
              <Link href="/quests">
                <T korean="전체 퀘스트 센터 보기" english="View All Quests" japanese="全クエストを見る" chinese="查看全部任务" />
              </Link>
            </Button>
          </section>
        </div>
      </div>

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

      {/* 2.5 MACRO ECONOMIC & LIQUIDITY DASHBOARD */}
      <MacroLiquidityDashboard />

      {/* 3. FINANCIAL CALCULATORS & TOOLS QUICK LAUNCH */}
      <section className="rounded-3xl border border-zinc-800/80 bg-[#0a1410]/90 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-400">
              <Calculator className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                <T korean="핀테크 시뮬레이터 & 웹 금융 계산기" english="Financial Calculators & Simulators" japanese="フィンテック計算機ハブ" chinese="金融模拟器与计算中心" />
              </h3>
              <p className="text-[11px] text-zinc-400">
                <T korean="복리 저축, 주식 물타기 평단가, 직업 연봉 시뮬레이션을 무료로 계산하세요." english="Free compound interest, DCA stock averaging, and career salary calculators." japanese="複利・ナンピン・年収シミュレーション" chinese="免费复利·补仓·年薪模拟计算" />
              </p>
            </div>
          </div>
          <Link href="/tools" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
            <span><T korean="전체 도구" english="View All Tools" japanese="全ツール" chinese="查看全部工具" /></span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Link href="/tools/compound-calculator" className="p-4 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-emerald-500/40 transition-all group">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
              <span><T korean="복리 적금 이자 계산기" english="Compound Calculator" japanese="複利利息計算機" chinese="复利储蓄计算器" /></span>
              <ChevronRight className="size-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </span>
            <span className="block text-[11px] text-zinc-400 mt-1">월 복리 적립식 자산 굴리기</span>
          </Link>

          <Link href="/tools/stock-calculator" className="p-4 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-blue-500/40 transition-all group">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span><T korean="주식 물타기 평단가 계산기" english="DCA Calculator" japanese="ナンピン平均単価" chinese="股票补仓均价计算器" /></span>
              <ChevronRight className="size-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
            </span>
            <span className="block text-[11px] text-zinc-400 mt-1">추가 매수 시 최종 평단가 시뮬레이션</span>
          </Link>

          <Link href="/tools/farming-calculator" className="p-4 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-purple-500/40 transition-all group">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-purple-400 transition-colors flex items-center justify-between">
              <span><T korean="직업 파밍 연봉 시뮬레이터" english="Career Simulator" japanese="職業年収シミュレーター" chinese="职业年薪模拟器" /></span>
              <ChevronRight className="size-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
            </span>
            <span className="block text-[11px] text-zinc-400 mt-1">직무별 최적 노동 수익 및 수수료 분석</span>
          </Link>
        </div>
      </section>

      {/* 4. OFFICIAL NOTICE & RELEASES */}
      {notices.length > 0 && (
        <section aria-labelledby="notices-heading" className="rounded-3xl border border-zinc-800/80 bg-[#0a1410]/90 shadow-sm p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-emerald-400" />
              <h3 id="notices-heading" className="text-sm font-bold text-foreground">
                <T korean="공식 공지사항 & 릴리스 노트" english="Announcements & Releases" japanese="公式お知らせ＆リリース" chinese="官方公告与更新日志" />
              </h3>
            </div>
            <Link href="/newspaper" className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1">
              <T korean="전체보기" english="View All" japanese="すべて見る" chinese="查看全部" /> <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/50 mt-2">
            {notices.map((n) => (
              <div key={n.announcementId} className="py-2.5 flex items-center justify-between hover:bg-zinc-900/40 px-2 rounded-xl transition-colors">
                <span className="text-xs sm:text-sm font-medium text-zinc-200 truncate max-w-[80%]">
                  {n.title}
                </span>
                {n.publishedAt && (
                  <time dateTime={n.publishedAt} className="text-[11px] text-zinc-500 shrink-0 font-mono">
                    {formatDay(n.publishedAt)}
                  </time>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. BOTTOM ADVERTISEMENT */}
      <HomeAdvertisement />
    </div>
  );
}
