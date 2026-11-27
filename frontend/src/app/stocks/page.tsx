import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { getStockName } from '@/lib/i18n-dictionary';
import { MarketPricesProvider } from '@/lib/use-market-prices';
import dynamicImport from 'next/dynamic';
import { GlobalMacroPulseTicker } from '@/components/global-macro-pulse-ticker';
import { normalizeStockSort, sortMarketStocks } from './stock-market-sort';
import { canonicalUrl } from '@/lib/seo';
import { StatRow } from '@/components/d180/primitives';
import { pick } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import { COPY } from './copy';

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
    title: '가상 주식 거래소 — 실시간 10단 호가창 & 모의투자',
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
  vi: {
    title: 'Sàn giao dịch Cổ phiếu ảo',
    description: 'Trải nghiệm sàn giao dịch cổ phiếu ảo thời gian thực với sổ lệnh khớp giá tốc độ cao.',
    canonical: '/vi/stocks',
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
  const locale = await getServerLocale();
  const [marketData, params] = await Promise.all([
    apiOrNull<{ stocks: StockRow[] }>('/api/v1/stocks'),
    searchParams,
  ]);

  const rawStocks = marketData?.stocks ?? [];
  const sortParam = Array.isArray(params?.sort) ? params.sort[0] : params?.sort;
  const sort = normalizeStockSort(sortParam);
  const stocks = sortMarketStocks(rawStocks, sort);

  const advancingCount = stocks.filter((s) => Number(s.current_price) >= Number(s.day_open_price || s.current_price)).length;
  const decliningCount = stocks.length - advancingCount;

  const filterOptions = [
    { value: 'default', label: pick(locale, fill(COPY.filterAll, { count: stocks.length })) },
    { value: 'change', label: pick(locale, COPY.filterChange) },
    { value: 'price', label: pick(locale, COPY.filterPrice) },
    { value: 'name', label: pick(locale, COPY.filterName) },
  ];

  return (
    <MarketPricesProvider>
      <div data-page="stocks" className="space-y-6">
        {/* 1. Global Macro & Disclosure Ticker */}
        <div className="space-y-4">
          <GlobalMacroPulseTicker />
          {/* The disclosure feed was a hard-coded dataset shown as LIVE and
              'verified official' with price-impact ranges (QA 2026-11-25). */}
        </div>

        {/* DESIGN180 StatRow from the exchange answer only; filler cards removed. */}
        <StatRow
          label={pick(locale, COPY.marketSummary)}
          items={[
            { label: pick(locale, COPY.listed), value: marketData ? `${stocks.length}` : null },
            { label: pick(locale, COPY.advancing), value: marketData ? `${advancingCount}` : null, tone: 'rise' },
            { label: pick(locale, COPY.declining), value: marketData ? `${decliningCount}` : null, tone: 'fall' },
          ]}
        />

        {/* 2. Toss Style Filter Tabs */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterOptions.map(({ value, label }) => {
              const isActive = sort === value;
              return (
                <Link
                  key={value}
                  href={value === 'default' ? '/stocks' : `/stocks?sort=${value}`}
                  className={`btn-toss inline-flex items-center justify-center min-h-[44px] sm:min-h-[36px] px-3.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
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
            {pick(locale, fill(COPY.listedCount, { count: stocks.length }))}
          </span>
        </div>

        {/* 3. 10 Listed Companies: Toss Clean Card List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {stocks.length === 0 ? (
            <div className="xl:col-span-2 toss-card p-10 text-center text-slate-400 text-xs bg-[#0f1422] rounded-2xl">
              {pick(locale, COPY.noStocks)}
            </div>
          ) : (
            stocks.map((stock) => {
              const cur = Number.parseInt(stock.current_price, 10);
              const open = Number.parseInt(stock.day_open_price || stock.current_price, 10);
              const pct = open > 0 ? ((cur - open) / open) * 100 : 0;
              const isPositive = pct >= 0;
              const isHalted = stock.halt_status && stock.halt_status.includes('HALT');
              const localizedStockName = getStockName(stock.symbol, locale, stock.name);

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
                          {localizedStockName}
                        </span>
                        {isHalted && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-bold shrink-0">
                            {pick(locale, COPY.halted)}
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
                      isPositive ? 'text-red-400' : 'text-blue-400'
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
                      name={localizedStockName}
                      currentPrice={stock.current_price}
                      side="buy"
                      triggerLabel={pick(locale, COPY.buy)}
                      triggerVariant="trading-buy"
                      triggerClassName="min-h-[44px] sm:min-h-[38px] px-4 text-xs font-bold font-mono tabular-nums active:scale-95 btn-toss rounded-xl shrink-0"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Safe Simulation Notice */}
        <div className="toss-card p-4 sm:p-5 bg-[#0f1422] border-slate-800/80 flex items-start gap-3 text-xs text-slate-400 rounded-2xl">
          <HelpCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-200">
              {pick(locale, COPY.safetyTitle)}
            </span>
            <p className="leading-relaxed [word-break:keep-all]">
              {pick(locale, COPY.safetyBody)}
            </p>
          </div>
        </div>
      </div>
    </MarketPricesProvider>
  );
}
