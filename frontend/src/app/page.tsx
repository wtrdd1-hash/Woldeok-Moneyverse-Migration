import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  Briefcase,
  Landmark,
  ChevronRight,
  Calculator,
  Flame,
  Coins,
  Percent,
  Scale,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { GuestQuickstart } from '@/components/guest-quickstart';
import { WalletGlance } from '@/components/wallet-glance';
import { LobbyCount } from '@/components/lobby-count';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { TranslatedText as T } from '@/components/translated-text';
import { Badge } from '@/components/ui/badge';
import { publicApi, apiOrNull } from '@/lib/api';
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
    title: 'Woldeok Moneyverse — Simple & Clean Virtual Finance Simulator',
    description: 'Explore virtual stocks, compound interest calculators, and financial simulations with ease.',
    canonical: '/en',
  },
  ko: {
    title: '월덕 머니버스 — 쉽고 직관적인 가상경제 & 모의주식',
    description: '1초 만에 확인하는 내 가상 자산, 모의 주식 거래, 복리 및 대출 계산기.',
    canonical: '/',
  },
  ja: {
    title: 'ウォルドク・マネーバース — シンプルな仮想金融シミュレーター',
    description: '仮想株式相場や複利計算を直感的に体験できる金融シミュレーター。',
    canonical: '/ja',
  },
  zh: {
    title: '月德 Moneyverse — 简洁直观的虚拟金融模拟器',
    description: '轻松体验虚拟股票交易与复利金融计算工具。',
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
  };
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const marketData = await apiOrNull<{ stocks: StockItem[] }>('/api/v1/stocks');

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
    .slice(0, 3); // 깔끔하게 상위 3개만 노출

  return (
    <div data-page="home" className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-5 px-3 sm:px-0 pb-20 sm:pb-12 zero-overflow-shield">
      {/* 1. Toss Style Clean Onboarding Banner */}
      <GuestQuickstart locale={locale} />

      {/* 2. Toss Style Hero Asset Card (한눈에 들어오는 내 잔고) */}
      <section aria-labelledby="hero-balance-heading" className="fintech-card p-6 sm:p-7 border-slate-800/80 bg-slate-900/60 dark:bg-[#0d121c] backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="hero-balance-heading" className="text-xs font-semibold text-slate-400">내 가상 자산</h2>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-fintech">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 inline-block" />
            게임 재화
          </Badge>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-fintech text-slate-100 tabular-nums tracking-tight">
              <WalletGlance />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-fintech mt-1">
            * 게임 내 가상 재화이며 실제 현금과 무관합니다.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <P2PTransferModal triggerText="1:1 간편 송금" />
          </div>
          <Link
            href="/wallet"
            className="flex-1 inline-flex items-center justify-center min-h-[44px] rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors btn-interactive"
          >
            내역 조회
          </Link>
        </div>
      </section>

      {/* 3. Toss Style 3 Core Action Buttons (누르기 쉬운 큼직한 3대 메뉴) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Link
          href="/stocks"
          className="fintech-card p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/50 btn-interactive min-h-[88px]"
        >
          <div className="size-10 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center">
            <TrendingUp className="size-5" />
          </div>
          <span className="text-xs font-bold text-slate-200">주식 거래</span>
        </Link>

        <Link
          href="/work"
          className="fintech-card p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-sky-500/50 btn-interactive min-h-[88px]"
        >
          <div className="size-10 rounded-2xl bg-sky-500/15 text-sky-400 grid place-items-center">
            <Briefcase className="size-5" />
          </div>
          <span className="text-xs font-bold text-slate-200">직업 출근</span>
        </Link>

        <Link
          href="/bank"
          className="fintech-card p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-amber-500/50 btn-interactive min-h-[88px]"
        >
          <div className="size-10 rounded-2xl bg-amber-500/15 text-amber-400 grid place-items-center">
            <Landmark className="size-5" />
          </div>
          <span className="text-xs font-bold text-slate-200">가상 은행</span>
        </Link>
      </div>

      {/* 4. 실시간 인기 주식 TOP 3 (간결한 리스트 스트립) */}
      <div className="fintech-card p-5 border-slate-800/80 bg-slate-900/40 dark:bg-[#0d121c] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Flame className="size-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-slate-200">가상주식 변동</h2>
          </div>
          <Link href="/stocks" className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-0.5">
            <span>더보기</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60">
          {movers.length === 0 ? (
            <p className="py-4 text-xs text-slate-500 text-center">시세 자료를 불러오지 못했습니다.</p>
          ) : (
            movers.map((item) => {
              const isPositive = item.pct >= 0;
              return (
                <Link
                  key={item.symbol}
                  href={`/stocks/${item.symbol}`}
                  className="flex items-center justify-between py-3 hover:opacity-80 transition-opacity btn-interactive"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                    <span className="text-[10px] font-fintech text-slate-500 uppercase">{item.symbol}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-fintech font-black text-xs text-slate-100 tabular-nums">
                      {item.cur.toLocaleString()} WLD
                    </div>
                    <div className={`font-fintech text-[11px] font-bold tabular-nums ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositive ? `+${item.pct.toFixed(1)}%` : `${item.pct.toFixed(1)}%`}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* 5. 필수 금융 계산기 4선 (간결한 2x2 그리드) */}
      <div className="fintech-card p-5 border-slate-800/80 bg-slate-900/40 dark:bg-[#0d121c] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Calculator className="size-4 text-sky-400" />
            <h2 className="text-xs font-bold text-slate-200">금융 계산기 4선</h2>
          </div>
          <Link href="/tools" className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-0.5">
            <span>전체 10종</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/tools/compound-calculator"
            className="p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:border-emerald-500/40 transition-colors btn-interactive"
          >
            <span className="block text-xs font-bold text-slate-200">복리 수익률</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">적립식 시뮬레이션</span>
          </Link>

          <Link
            href="/tools/stock-calculator"
            className="p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:border-sky-500/40 transition-colors btn-interactive"
          >
            <span className="block text-xs font-bold text-slate-200">주식 물타기</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">평단가 탈출 계산</span>
          </Link>

          <Link
            href="/tools/dividend"
            className="p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:border-amber-500/40 transition-colors btn-interactive"
          >
            <span className="block text-xs font-bold text-slate-200">배당소득세</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">15.4% 원천징수</span>
          </Link>

          <Link
            href="/tools/loan"
            className="p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:border-rose-500/40 transition-colors btn-interactive"
          >
            <span className="block text-xs font-bold text-slate-200">대출 이자</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">원리금 균등 상환</span>
          </Link>
        </div>
      </div>

      {/* 6. Footer Meta */}
      <HomeAdvertisement />
      <LobbyCount />
    </div>
  );
}
