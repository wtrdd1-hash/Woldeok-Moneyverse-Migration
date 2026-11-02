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
import { localeLabel } from '@/lib/locale';
import { getStockName } from '@/lib/i18n-dictionary';
import { compareAmounts, groupDigits } from '@/lib/money';
import { MarketPricesProvider } from '@/lib/use-market-prices';
import dynamicImport from 'next/dynamic';
import { StockDisclosureTicker } from '@/components/stock-disclosure-ticker';
import { GlobalMacroPulseTicker } from '@/components/global-macro-pulse-ticker';
import { normalizeStockSort, sortMarketStocks } from './stock-market-sort';
import { marketDayChange, parsePublicMarket } from './stock-market-evidence';
import { canonicalUrl } from '@/lib/seo';

const TradeDialog = dynamicImport(
  () => import('./trade-dialog').then((mod) => mod.TradeDialog),
);

export const dynamic = 'force-dynamic';

const STOCKS_META_BY_LOCALE = {
  en: {
    title: 'Virtual Stock Exchange — Verified Market Prices',
    description: 'View server-provided virtual stock prices and access game trading controls. Quotes and trades are not real securities.',
    canonical: '/en/stocks',
  },
  ko: {
    title: '가상 주식 거래소 — 서버 시세 및 게임 거래 | 월덕 머니버스',
    description: '서버에서 제공하는 가상 주식 종목과 WLD 시세를 조회하고 게임 내 거래 기능을 이용할 수 있습니다. 실제 주식 투자 상품이 아닙니다.',
    canonical: '/stocks',
  },
  ja: {
    title: '仮想株式取引所 — サーバー相場とゲーム内取引',
    description: 'サーバーから取得した仮想株式の価格とゲーム内取引を表示します。実際の証券ではありません。',
    canonical: '/ja/stocks',
  },
  zh: {
    title: '虚拟股票交易所 — 服务器报价与游戏内交易',
    description: '查看服务器提供的虚拟股票报价及游戏内交易入口。并非真实证券交易。',
    canonical: '/zh/stocks',
  },
  vi: {
    title: 'Sàn giao dịch Cổ phiếu ảo | Woldeok Moneyverse',
    description: 'Xem giá cổ phiếu ảo từ máy chủ và giao dịch trong trò chơi, không phải chứng khoán thật.',
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

export default async function StocksPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const [marketData, params] = await Promise.all([
    apiOrNull<unknown>('/api/v1/stocks'),
    searchParams,
  ]);

  const verifiedMarket = parsePublicMarket(marketData);
  const sortParam = Array.isArray(params?.sort) ? params.sort[0] : params?.sort;
  const sort = normalizeStockSort(sortParam);
  const stocks = verifiedMarket === null ? [] : sortMarketStocks(verifiedMarket, sort);

  const filterOptions = [
    { value: 'default', label: localeLabel(locale, '전체 종목', 'All Stocks', 'すべての銘柄', '全部股票') },
    { value: 'change', label: localeLabel(locale, '급등·급락순', 'Top Movers', '変動率順', '涨跌幅榜') },
    { value: 'price', label: localeLabel(locale, '가격순', 'By Price', '価格順', '价格高低') },
    { value: 'name', label: localeLabel(locale, '이름순', 'By Name', '名前順', '名称排序') },
  ];

  return (
    <MarketPricesProvider>
      <div data-page="stocks" className="space-y-6">
        {/* 1. Global Macro & Disclosure Ticker */}
        <div className="space-y-4">
          <GlobalMacroPulseTicker />
          <StockDisclosureTicker />
        </div>

        {/* 2. Toss Style Filter Tabs */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterOptions.map(({ value, label }) => {
              const isActive = sort === value;
              return (
                <Link
                  key={value}
                  href={value === 'default' ? '/stocks' : `/stocks?sort=${value}`}
                  className={`btn-toss min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 px-3.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
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
            {localeLabel(
              locale,
              `총 ${stocks.length}개 종목 상장 중`,
              `${stocks.length} stocks listed`,
              `計${stocks.length}銘柄上場中`,
              `现已上市${stocks.length}只股票`,
            )}
          </span>
        </div>

        {/* 3. 10 Listed Companies: Toss Clean Card List */}
        <div className="space-y-2.5">
          {verifiedMarket === null ? (
            <div role="alert" aria-live="polite" className="toss-card grid gap-3 rounded-2xl border border-amber-500/40 bg-[#0f1422] p-5 text-sm text-slate-200">
              <p>{localeLabel(locale, '주식 시세를 확인할 수 없습니다. 잠시 후 다시 조회해 주세요.', 'Stock prices are unavailable. Please try again.', '株価を確認できません。再度お試しください。', '无法确认股票报价，请稍后重试。')}</p>
              <Link href="/stocks" className="inline-flex min-h-11 w-fit items-center rounded-lg border px-4 py-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
                {localeLabel(locale, '다시 조회', 'Retry', '再読み込み', '重试')}
              </Link>
            </div>
          ) : stocks.length === 0 ? (
            <div className="toss-card p-10 text-center text-slate-400 text-xs bg-[#0f1422] rounded-2xl">
              {localeLabel(
                locale,
                '거래 가능한 종목이 없습니다.',
                'No tradable stocks available.',
                '取引可能な銘柄がありません。',
                '暂无可交易股票。',
              )}
            </div>
          ) : (
            stocks.map((stock) => {
              const direction = compareAmounts(stock.current_price, stock.day_open_price);
              const isHalted = stock.halt_status !== 'ACTIVE';
              const localizedStockName = getStockName(stock.symbol, locale, stock.name);

              return (
                <div
                  key={stock.id}
                  className="toss-card p-4 sm:p-5 flex items-center justify-between gap-3.5 bg-[#0f1422] border-slate-800/80 hover:border-emerald-500/40 transition-all btn-interactive rounded-2xl shadow-sm"
                >
                  {/* Stock Brand Icon & Name */}
                  <Link href={`/stocks/${encodeURIComponent(stock.symbol)}`} className="flex items-center gap-3.5 min-w-0 flex-1 group focus-visible:outline-2 focus-visible:outline-offset-2">
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
                            {localeLabel(locale, '거래정지', 'HALTED', '取引停止', '暂停交易')}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold block mt-0.5">
                        {stock.symbol}
                      </span>
                    </div>
                  </Link>

                  {/* Price & Change Rate */}
                  <Link href={`/stocks/${encodeURIComponent(stock.symbol)}`} className="min-w-0 max-w-[45vw] shrink-0 break-all text-right sm:max-w-none focus-visible:outline-2 focus-visible:outline-offset-2">
                    <div className="text-xs sm:text-sm font-black font-fintech text-slate-100 tabular-nums">
                      {groupDigits(stock.current_price)} <span className="text-[10px] text-slate-400 font-normal">WLD</span>
                    </div>
                    <div className={`text-xs font-extrabold font-fintech tabular-nums mt-0.5 flex items-center justify-end gap-0.5 ${
                      direction > 0 ? 'text-emerald-400' : direction < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {direction > 0 ? <TrendingUp className="size-3" aria-hidden="true" /> : direction < 0 ? <TrendingDown className="size-3" aria-hidden="true" /> : null}
                      <span>{marketDayChange(stock.current_price, stock.day_open_price)}</span>
                    </div>
                  </Link>

                  {/* Trade Action Trigger */}
                  <div className="shrink-0 pl-1">
                    {isHalted ? (
                      <span className="inline-flex min-h-11 items-center rounded-lg border border-rose-500/50 px-3 text-xs text-rose-300">
                        {localeLabel(locale, '매수 불가', 'Trading halted', '取引停止', '暂停交易')}
                      </span>
                    ) : <TradeDialog
                      stockId={stock.id}
                      symbol={stock.symbol}
                      name={localizedStockName}
                      currentPrice={stock.current_price}
                      side="buy"
                      triggerLabel={localeLabel(locale, '매수', 'Buy', '買い', '买入')}
                      triggerVariant="default"
                      triggerClassName="min-h-11 px-3.5 text-xs font-bold font-mono active:scale-95 btn-toss rounded-xl"
                    />}
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
              {localeLabel(
                locale,
                '가상 주식 거래 안내',
                'Virtual Stock Trading Notice',
                '仮想株式取引のご案内',
                '虚拟股票交易提示',
              )}
            </span>
            <p className="leading-relaxed [word-break:keep-all]">
              {localeLabel(
                locale,
                '월덕 머니버스의 모든 종목 시세와 재화(WLD)는 게임 내 알고리즘에 의해 움직이는 가상 경제이며, 실제 현금 입출금이나 실제 주식 투자 상품이 아닙니다.',
                'All stock prices and WLD currency are algorithm-driven virtual game assets, not actual money or real financial securities.',
                'ウォルドク・マネーバースのすべての銘柄相場と通貨(WLD)はゲーム内アルゴリズムにより動作する仮想経済であり、実際の現金や実在の株式商品ではありません。',
                '月德Moneyverse内所有标的行情与WLD货币均为由算法驱动的虚拟游戏资产，非真实现金或真实证券。',
              )}
            </p>
          </div>
        </div>
      </div>
    </MarketPricesProvider>
  );
}
