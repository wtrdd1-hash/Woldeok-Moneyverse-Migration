import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { MarketPricesProvider } from '@/lib/use-market-prices';
import { isLoggedInMember } from '@/lib/session';
import { LiveBadge } from './live';
import dynamicImport from 'next/dynamic';
import { StockDisclosureTicker } from '@/components/stock-disclosure-ticker';
import { GlobalMacroPulseTicker } from '@/components/global-macro-pulse-ticker';
import { normalizeStockSort, sortMarketStocks } from './stock-market-sort';
import { canonicalUrl } from '@/lib/seo';

const TradeDialog = dynamicImport(
  () => import('./trade-dialog').then((mod) => mod.TradeDialog),
);

export const dynamic = 'force-dynamic';

const STOCKS_META_BY_LOCALE = {
  en: {
    title: 'Virtual Stock Exchange — Toss-style Real-time Orderbook & Trading',
    description: 'Track real-time virtual quotes, 10-depth orderbooks, and trade 10 listed companies with ease.',
    canonical: '/en/stocks',
  },
  ko: {
    title: '가상 주식 거래소 — 실시간 10단 호가창 & 모의투자 | 월덕 머니버스',
    description: '[토스 증권 스타일] 10대 가상 상장사 실시간 호가, 캔들 차트, 1초 모의투자 시뮬레이터. 가입 즉시 1만 WLD 지급!',
    canonical: '/stocks',
  },
  ja: {
    title: '仮想株式取引所 — リアルタイム10段階気配値＆模擬投資',
    description: 'トス証券スタイルの直感的な仮想株式取引所。10大上場企業のリアルタイム相場とチャート。',
    canonical: '/ja/stocks',
  },
  zh: {
    title: '虚拟股票交易所 — 实时10档深度盘口与模拟交易',
    description: 'Toss风格极简虚拟股票交易所，实时查看10大标的行情与深度K线。',
    canonical: '/zh/stocks',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = STOCKS_META_BY_LOCALE[locale] ?? STOCKS_META_BY_LOCALE.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/stocks'),
        'en-US': canonicalUrl('/en/stocks'),
        'ja-JP': canonicalUrl('/ja/stocks'),
        'zh-CN': canonicalUrl('/zh/stocks'),
        'x-default': canonicalUrl('/stocks'),
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl(meta.canonical),
    },
  };
}

interface StockRow {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly day_high_price: string;
  readonly day_low_price: string;
  readonly shares_outstanding: string;
  readonly shares_available: string;
  readonly halt_status?: string;
}

export default async function StocksPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [marketData, params] = await Promise.all([
    apiOrNull<{ stocks: StockRow[] }>('/api/v1/stocks'),
    searchParams,
  ]);

  const rawStocks = marketData?.stocks ?? [];
  const sortParam = Array.isArray(params?.sort) ? params.sort[0] : params?.sort;
  const sort = normalizeStockSort(sortParam);
  const stocks = sortMarketStocks(rawStocks, sort);

  return (
    <MarketPricesProvider>
      <div data-page="stocks" className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6 px-3 sm:px-6 py-2 sm:py-4 pb-28 zero-overflow-shield">
        {/* 1. Header: Toss Securities Style Ultra-Clean Title & Live Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                가상 주식 거래소
              </h1>
              <LiveBadge />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              10대 가상 상장사 실시간 10단 호가창 · 1초 체결 모의투자 시뮬레이터
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/stocks/community"
              className="btn-toss h-10 px-4 bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700/70 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <MessageSquare className="size-3.5 text-primary" />
              <span>주주 라운지 →</span>
            </Link>
          </div>
        </div>

        {/* 2. Global Macro & Disclosure Ticker */}
        <div className="space-y-4">
          <GlobalMacroPulseTicker />
          <StockDisclosureTicker />
        </div>

        {/* 3. Toss Style Filter Tabs */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              ['default', '전체 10종목'],
              ['change', '급등·급락순'],
              ['price', '가격순'],
              ['name', '이름순'],
            ].map(([value, label]) => {
              const isActive = sort === value;
              return (
                <Link
                  key={value}
                  href={value === 'default' ? '/stocks' : `/stocks?sort=${value}`}
                  className={`btn-toss min-h-[36px] px-3.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline shrink-0">
            총 {stocks.length}개 종목 상장 중
          </span>
        </div>

        {/* 4. 10 Listed Companies: Toss Clean Card List */}
        <div className="space-y-2.5">
          {stocks.length === 0 ? (
            <div className="toss-card p-10 text-center text-slate-400 text-xs bg-[#0f1422] rounded-2xl">
              거래 가능한 종목이 없습니다.
            </div>
          ) : (
            stocks.map((stock) => {
              const cur = Number.parseInt(stock.current_price, 10);
              const open = Number.parseInt(stock.day_open_price || stock.current_price, 10);
              const pct = open > 0 ? ((cur - open) / open) * 100 : 0;
              const isPositive = pct >= 0;
              const isHalted = stock.halt_status && stock.halt_status.includes('HALT');

              return (
                <div
                  key={stock.id}
                  className="toss-card p-4 sm:p-5 flex items-center justify-between gap-3.5 bg-[#0f1422] border-slate-800/80 hover:border-emerald-500/40 transition-all btn-interactive rounded-2xl shadow-sm"
                >
                  {/* Stock Brand Icon & Name */}
                  <Link href={`/stocks/${stock.symbol}`} className="flex items-center gap-3.5 min-w-0 flex-1 group">
                    <div className="size-11 sm:size-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 grid place-items-center font-black font-fintech text-xs text-slate-200 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {stock.symbol.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-100 truncate group-hover:text-primary transition-colors">
                          {stock.name}
                        </span>
                        {isHalted && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-bold shrink-0">
                            거래정지
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold block mt-0.5">
                        {stock.symbol}
                      </span>
                    </div>
                  </Link>

                  {/* Price & Change Rate */}
                  <Link href={`/stocks/${stock.symbol}`} className="text-right shrink-0 min-w-[90px]">
                    <div className="text-xs sm:text-sm font-black font-fintech text-slate-100 tabular-nums">
                      {cur.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">WLD</span>
                    </div>
                    <div className={`text-xs font-extrabold font-fintech tabular-nums mt-0.5 flex items-center justify-end gap-0.5 ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      <span>{isPositive ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}</span>
                    </div>
                  </Link>

                  {/* Trade Action Trigger */}
                  <div className="shrink-0 pl-1">
                    <TradeDialog
                      stockId={stock.id}
                      symbol={stock.symbol}
                      name={stock.name}
                      currentPrice={stock.current_price}
                      side="buy"
                      triggerLabel="매수"
                      triggerVariant="default"
                      triggerClassName="h-9 px-3.5 text-xs font-bold font-mono active:scale-95 btn-toss rounded-xl"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Safe Simulation Notice */}
        <div className="toss-card p-4 sm:p-5 bg-[#0f1422] border-slate-800/80 flex items-start gap-3 text-xs text-slate-400 rounded-2xl">
          <HelpCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-200">100% 안전한 가상 모의투자 안내</span>
            <p className="leading-relaxed [word-break:keep-all]">
              월덕 머니버스의 모든 종목 시세와 재화(WLD)는 게임 내 알고리즘에 의해 움직이는 가상 경제이며, 실제 현금 입출금이나 실제 주식 투자 상품이 아닙니다.
            </p>
          </div>
        </div>
      </div>
    </MarketPricesProvider>
  );
}
