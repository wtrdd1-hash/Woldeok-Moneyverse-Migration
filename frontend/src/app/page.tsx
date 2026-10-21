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
  Sparkles,
  Calculator,
  Flame,
  Coins,
  Cpu,
  Zap,
  Globe,
  Bell,
  Scale,
  Percent,
  Wallet,
  TrendingDown,
} from 'lucide-react';
import { WalletGlance } from '@/components/wallet-glance';
import { GuestQuickstart } from '@/components/guest-quickstart';
import { LobbyCount } from '@/components/lobby-count';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { MacroLiquidityDashboard } from '@/components/macro-liquidity-dashboard';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { TranslatedText as T } from '@/components/translated-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HomeDualSurface } from '@/components/home-dual-surface';
import { publicApi, apiOrNull } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { getServerLocale } from '@/lib/locale-server';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';

export const revalidate = 60;

interface StockItem {
  readonly id?: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

const HOME_META_BY_LOCALE = {
  en: {
    title: 'Woldeok Moneyverse — Explore a Fictional Economy & Virtual Stocks',
    description: 'Try fictional-company trading scenarios, interactive finance calculators, and community economy games. WLD is fictional game currency, not real money.',
    badge: 'Explore a Fictional Economy',
    ogTitle: 'Woldeok Moneyverse — Virtual Stocks & Finance Tools',
    ogDescription: 'Explore fictional companies, simulated trading and interactive finance tools before deciding whether to sign up.',
    canonical: '/en',
  },
  ko: {
    title: '월덕 머니버스 — 가상경제·모의 주식·금융 계산기 체험',
    description: '가상의 기업과 주식·직업 시뮬레이션, 복리 및 대출 계산기를 체험하세요. WLD는 실제 돈이 아닌 게임 재화입니다. 회원가입 전에도 공개 도구를 이용할 수 있습니다.',
    badge: '가상경제 미리 체험하기',
    ogTitle: '월덕 머니버스 — 가상경제와 금융 시뮬레이터',
    ogDescription: '가상 기업·모의 주식과 금융 계산기를 체험해 보세요. WLD는 실물 화폐가 아닌 게임 재화입니다.',
    canonical: '/',
  },
  ja: {
    title: 'ウォルドク・マネーバース — 仮想経済と金融シミュレーター',
    description: '架空の企業や模擬株式取引、複利計算などの金融ツールを体験できます。WLDはゲーム内の仮想通貨であり、現実のお金や投資商品ではありません。',
    badge: '仮想経済を体験する',
    ogTitle: 'ウォルドク・マネーバース — 仮想株式と金融ツール',
    ogDescription: '架空の企業、模擬株式取引、金融計算ツールを体験しましょう。WLDはゲーム内通貨です。',
    canonical: '/ja',
  },
  zh: {
    title: '月德 Moneyverse — 虚拟经济与金融模拟工具',
    description: '体验虚构企业、模拟股票交易以及复利等金融计算工具。WLD仅为游戏内虚拟货币，不代表真实现金或投资产品。',
    badge: '体验虚拟经济',
    ogTitle: '月德 Moneyverse — 模拟股票与金融工具',
    ogDescription: '探索虚构企业、模拟交易与金融计算工具。WLD仅是游戏内虚拟货币。',
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
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: canonicalUrl(meta.canonical),
      siteName: 'Woldeok Moneyverse',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
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
  const locale = await getServerLocale();
  const [announcements, marketData] = await Promise.all([
    publicApi<{ announcements: Announcement[] }>('/api/v1/announcements', 60),
    apiOrNull<{ stocks: StockItem[] }>('/api/v1/stocks'),
  ]);

  const notices = announcements?.announcements.slice(0, 3) ?? [];
  const rawStocks = marketData?.stocks ?? [];

  const movers = rawStocks
    .map((stock) => {
      const cur = Number.parseInt(stock.current_price, 10);
      const open = Number.parseInt(stock.day_open_price, 10);
      if (!Number.isFinite(cur) || !Number.isFinite(open) || open <= 0) return null;
      const pct = ((cur - open) / open) * 100;
      return { ...stock, cur, open, pct };
    })
    .filter((stock): stock is NonNullable<typeof stock> => stock !== null)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 4);

  return (
    <div data-page="home" className="mv-page mv-page--community mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-8 pb-20 sm:pb-12 zero-overflow-shield">
      {/* Top Banner / Onboarding */}
      <GuestQuickstart locale={locale} />

      {/* =========================================================================
       * 💎 3D INTERACTIVE HERO BENTO GRID (Linear & Toss High-Density Surface)
       * ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        {/* Bento 1 (8 Columns): Main Asset & Macro Portfolio Cockpit */}
        <div className="lg:col-span-8 fintech-card p-5 sm:p-7 flex flex-col justify-between space-y-6 border-slate-800/80 bg-slate-900/40 dark:bg-[#0c1018]/90 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-400 grid place-items-center ring-1 ring-emerald-500/30">
                <Coins className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-fintech font-bold text-slate-400 tracking-wider uppercase">
                  Sovereign Virtual Ledger
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                  <T korean="가상 자산 & 거시경제 포트폴리오" english="Virtual Assets & Macro Portfolio" japanese="仮想資産＆マクロポートフォリオ" chinese="虚拟资产与宏观投资组合" />
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-fintech px-2 py-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
                복식부기 실시간 무결성 100%
              </Badge>
            </div>
          </div>

          {/* Large Balance Display */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-7 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">
                <T korean="내 보유 가상 자산 총액" english="Total Net Worth" japanese="保有仮想資産総額" chinese="持有虚拟资产总额" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-fintech text-emerald-400 tabular-nums tracking-tight">
                  10,000
                </span>
                <span className="text-base font-extrabold text-slate-400 font-fintech">WLD</span>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] font-fintech ml-1">
                  +100.0% 정착지원
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-fintech pt-1">
                <T korean="* WLD는 게임 내 가상 재화이며 실제 현금 가치가 아닙니다." english="* WLD is an in-game virtual credit, not real currency." japanese="* WLDはゲーム内仮想財貨であり、現実の現金価値はありません。" chinese="* WLD仅为游戏内虚拟代币，不具有真实现金价值。" />
              </p>
            </div>

            {/* Asset Allocation Mini Progress Bar */}
            <div className="sm:col-span-5 p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-fintech text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <T korean="자산 배분 비율" english="Allocation" japanese="資産配分" chinese="资产配置" />
                </span>
                <span className="text-emerald-400 font-bold">100% DEMO</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex ring-1 ring-white/5">
                <div className="h-full bg-emerald-400 w-[60%]" title="현금 지갑 (60%)" />
                <div className="h-full bg-sky-400 w-[30%]" title="가상 주식 (30%)" />
                <div className="h-full bg-amber-400 w-[10%]" title="은행 예금 (10%)" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-fintech text-slate-400 pt-0.5">
                <span>현금 60%</span>
                <span>주식 30%</span>
                <span>예금 10%</span>
              </div>
            </div>
          </div>

          {/* 4 Core Quick Command Action Strip */}
          <div className="pt-3 border-t border-slate-800/70 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex flex-col justify-center min-w-0">
              <P2PTransferModal triggerText="1:1 P2P 안심 송금" />
            </div>

            <Link
              href="/work"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 hover:border-sky-500/50 transition-all btn-interactive group min-h-[48px]"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-400 group-hover:bg-sky-500 group-hover:text-black transition-colors">
                <Briefcase className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-200 truncate">직업 출근</span>
                <span className="block text-[10px] text-slate-400 truncate mt-0.5">일일 급여 수령</span>
              </div>
            </Link>

            <Link
              href="/stocks"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all btn-interactive group min-h-[48px]"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <TrendingUp className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-200 truncate">주식 거래소</span>
                <span className="block text-[10px] text-slate-400 truncate mt-0.5">10대 상장사 호가</span>
              </div>
            </Link>

            <Link
              href="/bank"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 hover:border-amber-500/50 transition-all btn-interactive group min-h-[48px]"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                <Landmark className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-200 truncate">가상 은행</span>
                <span className="block text-[10px] text-slate-400 truncate mt-0.5">복리 저축·국채</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Bento 2 (4 Columns): Live Top Movers Ticker Strip */}
        <div className="lg:col-span-4 fintech-card p-5 sm:p-6 flex flex-col justify-between space-y-4 border-slate-800/80 bg-slate-900/40 dark:bg-[#0c1018]/90 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-slate-100">
                <T korean="실시간 주식 핫무버" english="Live Top Movers" japanese="急上昇銘柄" chinese="热门异动股票" />
              </h3>
            </div>
            <Link href="/stocks" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              <span>전체 10종목</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {movers.length === 0 ? (
              <p className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/40 text-xs text-slate-400 text-center">
                시세 데이터를 불러오는 중입니다.
              </p>
            ) : (
              movers.map((item) => {
                const isPositive = item.pct >= 0;
                return (
                  <Link
                    key={item.symbol}
                    href={`/stocks/${item.symbol}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-800/70 bg-slate-900/40 hover:bg-slate-800/50 hover:border-emerald-500/40 transition-all btn-interactive group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                        {item.name}
                      </div>
                      <span className="text-[10px] font-fintech text-slate-400 uppercase">
                        {item.symbol}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-fintech font-black text-xs text-slate-100 tabular-nums">
                        {item.cur.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">WLD</span>
                      </div>
                      <div className={`font-fintech text-[11px] font-bold mt-0.5 tabular-nums flex items-center justify-end gap-0.5 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        <span>{isPositive ? `+${item.pct.toFixed(1)}%` : `${item.pct.toFixed(1)}%`}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-fintech text-slate-400">
            <span>2시간 주기 자동 속보 가동</span>
            <span className="text-emerald-400 font-bold">10-Depth 활성</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * ⚡ 4 KEY FINANCIAL CALCULATORS & TOOLS QUICK LAUNCHER
       * ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="size-4 text-emerald-400" />
            <h2 className="text-base font-extrabold text-slate-100 tracking-tight">
              실전 금융 시뮬레이터 & 공학 계산기 10종
            </h2>
          </div>
          <Link href="/tools" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
            <span>전체 10종 계산기 열기</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/tools/compound"
            className="fintech-card p-4 hover:border-emerald-500/50 btn-interactive group space-y-1.5"
          >
            <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-400 grid place-items-center">
              <Percent className="size-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-emerald-400 truncate">
              복리 수익률 계산기
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              월 복리 적립식 투자 백테스트
            </p>
          </Link>

          <Link
            href="/tools/stock-dca"
            className="fintech-card p-4 hover:border-sky-500/50 btn-interactive group space-y-1.5"
          >
            <div className="size-8 rounded-xl bg-sky-500/15 text-sky-400 grid place-items-center">
              <TrendingDown className="size-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-sky-400 truncate">
              주식 물타기 평단가
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              분할 매수 탈출 단가 시뮬레이션
            </p>
          </Link>

          <Link
            href="/tools/dividend"
            className="fintech-card p-4 hover:border-amber-500/50 btn-interactive group space-y-1.5"
          >
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center">
              <Coins className="size-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-amber-400 truncate">
              배당소득세 계산기
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              15.4% 원천징수 실지급액 산출
            </p>
          </Link>

          <Link
            href="/tools/loan"
            className="fintech-card p-4 hover:border-rose-500/50 btn-interactive group space-y-1.5"
          >
            <div className="size-8 rounded-xl bg-rose-500/15 text-rose-400 grid place-items-center">
              <Scale className="size-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-rose-400 truncate">
              대출 상환 이자 계산기
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              원리금 균등 분할 상환표
            </p>
          </Link>
        </div>
      </section>

      {/* =========================================================================
       * 🏛️ MACRO LIQUIDITY & COMMUNITY SURFACES
       * ========================================================================= */}
      <MacroLiquidityDashboard />
      <HomeAdvertisement />
      <LobbyCount />
    </div>
  );
}
