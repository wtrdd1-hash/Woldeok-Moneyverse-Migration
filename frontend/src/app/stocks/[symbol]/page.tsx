
function getStockDisplayName(symbol: string, defaultName: string, locale: string): string {
  if (locale === 'ko') return defaultName;
  const map: Record<string, { en: string; ja: string; zh: string; vi: string }> = {
    'WDG': { en: 'Woldeok Games', ja: 'ウォルドクゲームズ', zh: '沃尔德克游戏', vi: 'Woldeok Games' },
    'WLD': { en: 'Woldeok Core', ja: 'ウォルドクコア', zh: '沃尔德克核心', vi: 'Woldeok Core' }
  };
  const item = map[symbol.toUpperCase()];
  if (!item) return defaultName;
  return locale === 'ja' ? item.ja : (locale === 'zh' ? item.zh : (locale === 'vi' ? item.vi : item.en));
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare, AlertTriangle, TrendingUp, TrendingDown, PieChart, Info, Bell } from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { WatchlistToggle } from '../watchlist-toggle';
import { StockQuickAlertDialog } from './stock-quick-alert-dialog';
import { StockAlertDeleteButton } from './stock-alert-delete-button';
import { StockDiscussionSection } from './stock-discussion-section';
import { StockInteractiveChart } from './stock-interactive-chart';
import { StockTradingConsole } from './stock-trading-console';
import { StockMarketToast } from './stock-market-toast';
import { QuickOrderbookSimulator } from '@/components/quick-orderbook-simulator';
import { StockSentimentPoll } from '@/components/stock-sentiment-poll';
import { StockHaltBanner } from './stock-halt-banner';
import { StockTickerSwitcher } from './stock-ticker-switcher';
import { SocialShareToolbar } from '@/components/social-share-toolbar';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  findHoldingForStock,
  findStockBySymbol,
  type HubHolding,
  type HubStock,
} from '../stock-hub';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface WatchlistRow {
  readonly stock_id: string;
}
interface StockHaltReceipt {
  readonly id: string;
  readonly halt_event_id: string;
  readonly stock_id: string;
  readonly stock_symbol: string;
  readonly stock_name: string;
  readonly quantity: string;
  readonly basis_method: string;
  readonly basis_unit_amount: string;
  readonly refund_amount: string;
  readonly status: string;
  readonly created_at: string;
}
interface StockContext {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly category: string;
  readonly stance: string;
  readonly positionDisclosure: string;
}
interface StockAlertRule {
  readonly alert_id: string;
  readonly stock_id: string;
  readonly condition_kind: string;
  readonly threshold_amount: string | null;
  readonly threshold_bps: number | null;
  readonly condition_met: boolean;
}
interface PostSummary {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly commentCount: number;
  readonly stock: StockContext | null;
}

async function selectedStock(symbol: string): Promise<HubStock | null> {
  const market = await apiOrNull<{ stocks: HubStock[] }>('/api/v1/stocks');
  return findStockBySymbol(market?.stocks ?? [], symbol);
}

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ readonly symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  const stock = await selectedStock(symbol);
  if (!stock) return { title: '가상 주식', robots: { index: false, follow: false } };
  const stockUrl = canonicalUrl(`/stocks/${encodeURIComponent(stock.symbol)}`);
  const ogImageUrl = buildOgImageUrl({
    title: `${stock.name} (${stock.symbol})`,
    description: `${stock.name} 가상 시세 및 차트. ${stock.description || '월덕 머니버스 실시간 거래소.'}`,
    type: 'stock',
    badge: '가상 주식 시세',
    metric: `${groupDigits(stock.current_price)} WLD`,
    metricLabel: '현재가',
  });

  return {
    title: `${stock.symbol} ${stock.name} — 실시간 가상 주식 시세 & 차트`,
    description: `${stock.name}(${stock.symbol})의 월덕 머니버스 실시간 가상 시세, 10-Depth 호가창, 차트 및 커뮤니티 토론. 실제 금융상품이 아닌 게임 가상재화입니다.`,
    keywords: [
      `${stock.name}`,
      `${stock.symbol}`,
      `${stock.name} 주가`,
      `${stock.name} 시세`,
      '가상 주식',
      '호가창',
      '모의투자',
      '월덕 머니버스',
    ],
    alternates: {
      canonical: stockUrl,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${stock.name} (${stock.symbol}) — 가상 주식 시세 & 차트`,
      description: `${stock.name}의 실시간 가상 주식 호가 및 차트`,
      url: stockUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${stock.name} (${stock.symbol})`,
      description: `${stock.name} 실시간 시세`,
      images: [ogImageUrl],
    },
  };
}

export default async function StockHubPage({
  params,
}: {
  readonly params: Promise<{ readonly symbol: string }>;
}) {
  const { symbol } = await params;
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const market = await apiOrNull<{ stocks: HubStock[] }>('/api/v1/stocks');
  const stock = findStockBySymbol(market?.stocks ?? [], symbol);
  if (!stock) notFound();

  const encodedSymbol = encodeURIComponent(stock.symbol);
  const [portfolio, watchlist, discussion, alertResult, receiptsResult, pulseResult] = await Promise.all([
    apiOrNull<{ holdings: HubHolding[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ stocks: WatchlistRow[] }>('/api/v1/stocks/watchlist'),
    apiOrNull<{ posts: PostSummary[] }>(`/api/v1/board/public/stock-posts?stock=${encodedSymbol}`),
    apiOrNull<{ alerts: StockAlertRule[] }>('/api/v1/stocks/alerts'),
    apiOrNull<{ receipts: StockHaltReceipt[] }>('/api/v1/stocks/halt-receipts'),
    apiOrNull<{ success: boolean; data: { leadHeadline: string; updatedAt: string } }>('/api/v1/newspaper/pulse'),
  ]);
  const holding = findHoldingForStock(portfolio?.holdings ?? [], stock.id);
  const watching = (watchlist?.stocks ?? []).some((row) => row.stock_id === stock.id);
  const posts = discussion?.posts ?? [];
  const stockAlerts = (alertResult?.alerts ?? []).filter((rule) => rule.stock_id === stock.id);
  const stockReceipt = (receiptsResult?.receipts ?? []).find((r) => r.stock_id === stock.id);
  const newsList = pulseResult?.data?.leadHeadline && pulseResult.data.leadHeadline !== '현재 진행 중인 시장 소식이 없습니다'
    ? [{
        id: 'pulse-lead',
        headline: pulseResult.data.leadHeadline,
        direction: (stock.day_open_price && Number(stock.current_price) >= Number(stock.day_open_price) ? 'up' : 'down') as 'up' | 'down',
        publishedAt: pulseResult.data.updatedAt,
      }]
    : [];
  const isHalted =
    stock.halt_status === 'HALTED_SETTLED' ||
    stock.halt_status === 'HALTED_SETTLING' ||
    stock.halt_status === 'HALTING' ||
    stock.halt_status === 'HALTED' ||
    holding?.halt_status === 'HALTED_SETTLED' ||
    stock.active === false;

  // 가격 변동 계산
  const currentPriceNum = Number(stock.current_price) || 0;
  const openPriceNum = Number(stock.day_open_price) || currentPriceNum;
  const priceDiff = currentPriceNum - openPriceNum;
  const changePercent = openPriceNum > 0 ? ((priceDiff / openPriceNum) * 100).toFixed(2) : '0.00';
  const isPositive = priceDiff >= 0;

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${stock.name} (${stock.symbol})`,
    description: stock.description || `${stock.name} 가상 주식 시세 및 호가창`,
    category: 'Virtual Stock',
    offers: {
      '@type': 'Offer',
      price: stock.current_price,
      priceCurrency: 'WLD',
    },
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isEn ? 'Home' : '홈',
        item: canonicalUrl(''),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isEn ? 'Stocks' : '가상 주식',
        item: canonicalUrl('/stocks'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${stock.symbol} ${stock.name}`,
        item: canonicalUrl(`/stocks/${encodedSymbol}`),
      },
    ],
  };

  return (
    <div data-page="stocks-symbol" className="min-h-screen pb-24 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      {/* 1. 상단 네비게이션 & 빠른 티커 스위처 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/stocks" className="flex items-center gap-1.5 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? 'Market' : '거래소 목록'}</span>
            </Link>
          </Button>
          <span className="text-muted-foreground/40">|</span>
          <StockTickerSwitcher
            stocks={market?.stocks ?? []}
            currentSymbol={stock.symbol}
            isEn={isEn}
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SocialShareToolbar
            compact
            title={`${stock.symbol} ${stock.name} 실시간 시세`}
            description={`현재가: ${groupDigits(stock.current_price)} WLD`}
            url={`/stocks/${stock.symbol}`}
            hashtags={['월덕머니버스', '가상주식', stock.symbol]}
          />
          <WatchlistToggle stockId={stock.id} watching={watching} />
          <StockQuickAlertDialog
            stockId={stock.id}
            symbol={stock.symbol}
            name={stock.name}
            currentPrice={stock.current_price}
            isEn={isEn}
          />
        </div>
      </div>

      {/* 거래정지 배너 */}
      {isHalted && (
        <StockHaltBanner
          symbol={stock.symbol}
          name={stock.name}
          haltStatus={stock.halt_status}
          receipt={stockReceipt}
          isEn={isEn}
        />
      )}

      {/* 2. [Toss Style] 대형 히어로 주가 섹션 */}
      <div className="toss-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {isEn ? 'Virtual Equity' : '가상 주식'}
              </span>
              <span className="text-xs font-mono text-muted-foreground font-semibold">
                {stock.symbol}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {getStockDisplayName(stock.symbol, stock.name, locale)}
            </h1>
          </div>

          <div className="text-right">
            <div className="font-fintech text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {groupDigits(stock.current_price)}{' '}
              <span className="text-base sm:text-lg font-bold text-muted-foreground">WLD</span>
            </div>
            <div className={`flex items-center justify-end gap-1 text-sm sm:text-base font-bold font-fintech ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{groupDigits(priceDiff.toString())} WLD</span>
              <span>({isPositive ? '+' : ''}{changePercent}%)</span>
            </div>
          </div>
        </div>

        {stock.description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
            {stock.description}
          </p>
        )}
      </div>

      {/* 실시간 틱 토스트 알림 */}
      <StockMarketToast
        stockId={stock.id}
        symbol={stock.symbol}
        isEn={isEn}
      />

      {/* 3. [Toss 2026 Core] 상단 차트 & 인터랙티브 트레이딩 허브 */}
      <Tabs defaultValue="trading" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md w-full h-11 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="trading" className="rounded-lg text-xs sm:text-sm font-semibold">
            {isEn ? 'Chart & Trade' : '차트 & 주문'}
          </TabsTrigger>
          <TabsTrigger value="position" className="rounded-lg text-xs sm:text-sm font-semibold">
            {isEn ? 'My Position' : '내 보유 현황'}
          </TabsTrigger>
          <TabsTrigger value="community" className="rounded-lg text-xs sm:text-sm font-semibold">
            {isEn ? 'Discussion' : '토론 & 분석'}
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: 차트 및 실시간 호가/주문 */}
        <TabsContent value="trading" className="space-y-6 focus-visible:outline-none">
          {/* 인터랙티브 차트 (1D/1W/1M/1Y/캔들/라인) */}
          <div className="toss-card p-4 sm:p-6 overflow-hidden">
            <StockInteractiveChart
              currentPrice={stock.current_price}
              dayOpenPrice={stock.day_open_price}
              dayHighPrice={stock.day_high_price}
              dayLowPrice={stock.day_low_price}
              symbol={stock.symbol}
              stockId={stock.id}
              isEn={isEn}
              newsItems={newsList}
            />
          </div>

          {/* 10-Depth 호가창 및 트레이딩 패널 */}
          <StockTradingConsole
            stockId={stock.id}
            symbol={stock.symbol}
            name={stock.name}
            currentPrice={stock.current_price}
            dayOpenPrice={stock.day_open_price}
            availableShares={stock.shares_available}
            holdingQuantity={holding?.quantity}
            isHalted={isHalted}
            isEn={isEn}
            receipt={stockReceipt}
          />

          {/* 1-Tap 퀵 호가 체결 시뮬레이터 */}
          <div className="toss-card p-5">
            <QuickOrderbookSimulator
              currentPrice={Number.parseInt(stock.current_price, 10) || 1450}
              symbol={stock.symbol}
            />
          </div>
        </TabsContent>

        {/* 탭 2: 내 보유 현황 & 종목 스냅샷 */}
        <TabsContent value="position" className="space-y-6 focus-visible:outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 내 포지션 카드 */}
            <div className="toss-card p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    {isEn ? 'My Virtual Position' : '내 보유 현황'}
                  </h3>
                </div>
                {holding && Number(holding.quantity) > 0 && (
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                    {isEn ? 'Active Position' : '보유 중'}
                  </Badge>
                )}
              </div>

              {portfolio === null ? (
                <EmptyState
                  title={isEn ? 'Unable to load holdings.' : '보유 현황을 불러오지 못했어요.'}
                />
              ) : holding && Number(holding.quantity) > 0 ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/40 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{isEn ? 'Held Shares' : '보유 수량'}</span>
                      <span className="font-fintech font-bold text-base text-foreground">
                        {groupDigits(holding.quantity)} {isEn ? 'shares' : '주'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{isEn ? 'Avg Cost' : '평균 매입 단가'}</span>
                      <span className="font-fintech font-medium text-foreground">
                        <Amount value={holding.average_cost} />
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-border/40">
                      <span className="text-muted-foreground font-semibold">{isEn ? 'Total Valuation' : '총 평가 금액'}</span>
                      <span className="font-fintech font-extrabold text-lg text-primary">
                        <Amount value={holding.market_value} />
                      </span>
                    </div>
                  </div>
                </div>
              ) : stockReceipt ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {isEn ? 'Settlement Receipt' : '거래정지 원가환급 영수증'}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/40">
                      {stockReceipt.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                    <div>
                      <span>정산 수량: </span>
                      <span className="font-mono font-medium text-foreground">{groupDigits(stockReceipt.quantity)}주</span>
                    </div>
                    <div>
                      <span>취득 단가: </span>
                      <span className="font-mono font-medium text-foreground">{groupDigits(stockReceipt.basis_unit_amount)} WLD</span>
                    </div>
                    <div className="col-span-2 text-foreground font-semibold text-xs pt-1 border-t border-emerald-500/20">
                      <span>총 환급 WLD: </span>
                      <span className="font-mono font-bold text-primary text-sm">{groupDigits(stockReceipt.refund_amount)} WLD</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {isEn ? 'You do not own any shares of this stock yet.' : '아직 이 종목을 보유하고 있지 않아요.'}
                  </p>
                  <Button asChild size="sm" className="btn-toss">
                    <Link href={`/stocks/${encodedSymbol}?tab=trading`}>
                      {isEn ? 'Buy this stock' : '첫 매수 주문하기'}
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* 시장 시세 요약 카드 */}
            <div className="toss-card p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-base font-bold text-foreground">
                    {isEn ? 'Market Stats' : '시세 및 유통 정보'}
                  </h3>
                </div>
                <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                  <Link href={`/stocks/compare?symbols=${encodedSymbol}`}>
                    {isEn ? 'Compare' : '타 종목 비교'}
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/20 rounded-xl border border-border/30">
                  <span className="text-xs text-muted-foreground block">{isEn ? 'Day Open' : '오늘 시가'}</span>
                  <span className="font-fintech font-bold text-sm sm:text-base text-foreground">
                    {groupDigits(stock.day_open_price || stock.current_price)} WLD
                  </span>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/30">
                  <span className="text-xs text-muted-foreground block">{isEn ? 'Day High' : '오늘 고가'}</span>
                  <span className="font-fintech font-bold text-sm sm:text-base text-emerald-500">
                    {groupDigits(stock.day_high_price || stock.current_price)} WLD
                  </span>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/30">
                  <span className="text-xs text-muted-foreground block">{isEn ? 'Day Low' : '오늘 저가'}</span>
                  <span className="font-fintech font-bold text-sm sm:text-base text-rose-500">
                    {groupDigits(stock.day_low_price || stock.current_price)} WLD
                  </span>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/30">
                  <span className="text-xs text-muted-foreground block">{isEn ? 'Available' : '시장 유통 잔여'}</span>
                  <span className="font-fintech font-bold text-sm sm:text-base text-foreground">
                    {groupDigits(stock.shares_available)} 주
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-1 flex justify-between">
                <span>총 발행 주식수</span>
                <span className="font-mono font-medium">{groupDigits(stock.shares_outstanding)} 주</span>
              </div>
            </div>
          </div>

          {/* 알림 설정 내역 카드 */}
          <div className="toss-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">
                  {isEn ? 'Active Price Alerts' : '설정된 가격 감시 알림'}
                </h3>
              </div>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href={`/stocks/alerts?stock=${encodedSymbol}`}>
                  {isEn ? 'Manage All' : '전체 알림 관리'}
                </Link>
              </Button>
            </div>

            {stockAlerts.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground py-2">
                {isEn ? 'No price alert is set for this stock.' : '현재 이 종목에 설정된 알림이 없습니다. 상단 벨 아이콘으로 등록할 수 있어요.'}
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {stockAlerts.slice(0, 6).map((rule) => (
                  <div key={rule.alert_id} className="p-3 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold block text-foreground">
                        {stockAlertConditionLabel(rule.condition_kind, isEn)}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {stockAlertThreshold(rule)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={rule.condition_met ? 'default' : 'secondary'} className="text-[10px]">
                        {rule.condition_met ? (isEn ? 'Met' : '충족') : (isEn ? 'Watching' : '감시')}
                      </Badge>
                      <StockAlertDeleteButton alertId={rule.alert_id} isEn={isEn} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 탭 3: 토론 및 심리 분석 */}
        <TabsContent value="community" className="space-y-6 focus-visible:outline-none">
          {/* 실시간 롱/숏 심리 투표 */}
          <div className="toss-card p-6">
            <StockSentimentPoll
              symbol={stock.symbol}
              name={stock.name}
            />
          </div>

          {/* 커뮤니티 게시판 */}
          <div className="toss-card p-6">
            <StockDiscussionSection
              stockId={stock.id}
              symbol={stock.symbol}
              name={stock.name}
              posts={posts}
              isEn={isEn}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* 스폰서드 디스플레이 광고 */}
      <PublicAdvertisement className="my-6" />

      {/* 가상 화폐 고지 */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center text-xs text-muted-foreground">
        본 가상 주식 거래소의 모든 데이터 및 시세는 월덕 머니버스 게임 시스템에서 제공하는 모의 데이터이며, 실제 금융 거래와 전혀 무관합니다.
      </div>
    </div>
  );
}

function stockAlertConditionLabel(kind: string, isEn: boolean): string {
  const labels: Record<string, readonly [string, string]> = {
    price_at_or_above: ['Price at or above', '가격 이상'],
    price_at_or_below: ['Price at or below', '가격 이하'],
    day_change_at_or_above: ['Daily change at or above', '일일 변동률 이상'],
    day_change_at_or_below: ['Daily change at or below', '일일 변동률 이하'],
  };
  const label = labels[kind];
  return label ? label[isEn ? 0 : 1] : kind;
}

function stockAlertThreshold(rule: StockAlertRule): string {
  if (rule.condition_kind.startsWith('price_')) return `${rule.threshold_amount ?? '—'} WLD`;
  if (rule.threshold_bps === null) return '—';
  return `${rule.threshold_bps >= 0 ? '+' : ''}${(rule.threshold_bps / 100).toFixed(2)}%`;
}
