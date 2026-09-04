import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import type { SparkPoint } from '@/components/sparkline';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { MarketPricesProvider } from '@/lib/use-market-prices';
import { requireMember } from '@/lib/session';
import { LiveBadge, LiveHoldingValue, LiveQuote, LiveSparkline } from './live';
import { MarketNews } from './market-news';
import type { MarketEvent } from './market-news';
import { StockDetailDialog } from './stock-detail-dialog';
import { TradeDialog } from './trade-dialog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 주식 거래소 — 실시간 종목 시세 및 캔들 차트 분석',
  description: '월덕 머니버스 커뮤니티 가상 주식 거래소에서 실시간 종목 시세를 분석하고 차트를 확인해 매매하세요.',
  robots: { index: true, follow: true },
};

/** The API returns these rows as the database shapes them. */
interface StockRow {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly current_price: string;
  readonly day_open_price: string;
  /** Today's range, from the candle the market ticker keeps. */
  readonly day_high_price: string;
  readonly day_low_price: string;
  /** How many shares exist, and how many nobody is holding (053). */
  readonly shares_outstanding: string;
  readonly shares_available: string;
}

/** Every listed stock's recent prices, most recent first (055). */
interface SparkSeries {
  readonly stock_id: string;
  readonly prices: readonly string[];
}

interface HoldingRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly quantity: string;
  readonly average_cost: string;
  readonly market_value: string;
  readonly current_price: string;
}

interface TradeRow {
  readonly trade_id: string;
  readonly symbol: string;
  readonly side: string;
  readonly quantity: string;
  readonly unit_price: string;
  readonly gross_amount: string;
  readonly tax_amount: string;
  readonly created_at: string;
}

/**
 * The market moves every second, so this page is never cached and revalidates
 * itself while it is open. Thirty seconds is a compromise: often enough that
 * the figures are not stale, rare enough that a reader filling in a trade
 * form is not interrupted by a re-render every second.
 */
export const revalidate = 0;

/** How much recent movement each card's sparkline draws. */
const SPARK_POINTS = 40;

export default async function StocksPage() {
  await requireMember();

  // Four calls, not three plus one per listed stock. The preview lines used
  // to be fetched a card at a time, after the list came back, so the page
  // cost grew with the catalogue and paid that cost again on every
  // thirty-second refresh. They now arrive together and in the same round as
  // everything else.
  const [market, portfolio, history, sparks, news] = await Promise.all([
    apiOrNull<{ stocks: StockRow[] }>('/api/v1/stocks'),
    apiOrNull<{ holdings: HoldingRow[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ trades: TradeRow[] }>('/api/v1/stocks/history'),
    apiOrNull<{ series: SparkSeries[] }>(`/api/v1/stocks/sparklines?limit=${SPARK_POINTS}`),
    // The news leaning the market (124). Absent rather than empty when the
    // call fails: a market with no news is a normal state, not an error.
    apiOrNull<{ events: MarketEvent[] }>('/api/v1/stocks/market-events'),
  ]);

  const stocks = market?.stocks ?? [];

  // The detail dialog fetches its own candles when it opens, so this is the
  // only price history the page carries.
  const seriesFor = new Map<string, readonly SparkPoint[]>(
    (sparks?.series ?? []).map((row) => [
      row.stock_id,
      (row.prices ?? []).map((price) => ({ price })),
    ]),
  );

  return (
    <MarketPricesProvider>
    <div className="grid gap-6">
      <PageHeader eyebrow="VIRTUAL MARKET" title="가상 주식 시장">
        경제 상황에 따라 가격이 바뀌는 게임 전용 시장입니다. 실제 주식·현금·투자 상품이
        아닙니다.
      </PageHeader>

      <MarketNews events={news?.events ?? []} />

      <section aria-labelledby="market-title" className="grid gap-3">
        <div className="flex items-center gap-3">
          <h2 id="market-title" className="text-lg">
            거래 가능 종목
          </h2>
          <LiveBadge />
        </div>
        {market === null ? (
          <EmptyState title="주식 정보를 불러오지 못했어요." description="잠시 후 다시 시도해 주세요." />
        ) : stocks.length === 0 ? (
          <EmptyState title="현재 거래 가능한 종목이 없습니다." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {stocks.map((row) => (
              <Card key={row.id} className="gap-4">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {/* Only tradable stocks reach this list — a suspended one
                        is absent rather than shown greyed out — so there is no
                        거래 정지 badge here. The operator console shows both. */}
                    <Badge variant="secondary" className="font-mono">
                      {row.symbol}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{row.name}</CardTitle>
                  <CardDescription>
                    {row.description || '게임 경제 안에서 거래하는 가상 종목입니다.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex items-end justify-between gap-3">
                    <LiveQuote
                      stockId={row.id}
                      price={row.current_price}
                      open={row.day_open_price}
                    />
                    {/* The shape of the last few minutes, extended by the
                        broadcast. The figures beside it carry the same
                        information, so it is decorative. */}
                    <LiveSparkline
                      stockId={row.id}
                      points={seriesFor.get(row.id) ?? []}
                      price={row.current_price}
                      open={row.day_open_price}
                      limit={SPARK_POINTS}
                      className="w-28 shrink-0"
                    />
                  </div>
                  <p className="tabular text-xs text-muted-foreground">
                    오늘 고가 {groupDigits(row.day_high_price)} · 저가{' '}
                    {groupDigits(row.day_low_price)}
                  </p>
                  {/* The float. A buy draws from what nobody is holding, so
                      this is the ceiling on the order the reader is about to
                      place — worth saying before they type a quantity. */}
                  <p className="tabular text-xs text-muted-foreground">
                    거래 가능 {groupDigits(row.shares_available)}주 · 총 발행{' '}
                    {groupDigits(row.shares_outstanding)}주
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <TradeDialog
                      stockId={row.id}
                      symbol={row.symbol}
                      name={row.name}
                      currentPrice={row.current_price}
                      available={row.shares_available}
                      side="buy"
                    />
                    <TradeDialog
                      stockId={row.id}
                      symbol={row.symbol}
                      name={row.name}
                      currentPrice={row.current_price}
                      available={row.shares_available}
                      side="sell"
                    />
                    <StockDetailDialog
                      stockId={row.id}
                      symbol={row.symbol}
                      name={row.name}
                      currentPrice={row.current_price}
                      dayOpenPrice={row.day_open_price}
                      available={row.shares_available}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>내 보유 종목</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio === null ? (
            <EmptyState title="보유 종목을 불러오지 못했어요." />
          ) : portfolio.holdings.length === 0 ? (
            <EmptyState title="보유한 가상 주식이 없습니다." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>종목</TableHead>
                    <TableHead className="text-right">수량</TableHead>
                    <TableHead className="text-right">평균 매입가</TableHead>
                    <TableHead className="text-right">평가액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.holdings.map((holding) => (
                    <TableRow key={holding.stock_id}>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {holding.symbol}
                        </span>{' '}
                        {holding.name}
                      </TableCell>
                      <TableCell className="tabular text-right">
                        {holding.quantity}주
                      </TableCell>
                      <TableCell className="text-right">
                        <Amount value={holding.average_cost} />
                      </TableCell>
                      <TableCell className="text-right">
                        <LiveHoldingValue
                          stockId={holding.stock_id}
                          quantity={holding.quantity}
                          price={holding.current_price}
                          averageCost={holding.average_cost}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>내 거래 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {history === null ? (
            <EmptyState title="거래 내역을 불러오지 못했어요." />
          ) : history.trades.length === 0 ? (
            <EmptyState title="아직 거래 내역이 없습니다." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시각</TableHead>
                    <TableHead>종목</TableHead>
                    <TableHead>구분</TableHead>
                    <TableHead className="text-right">수량</TableHead>
                    <TableHead className="text-right">체결가</TableHead>
                    <TableHead className="text-right">세금</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.trades.map((trade) => (
                    <TableRow key={trade.trade_id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatMoment(trade.created_at, '기록 확인 중')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={trade.side === 'buy' ? 'default' : 'outline'}>
                          {trade.side === 'buy' ? '매수' : '매도'}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular text-right">{trade.quantity}주</TableCell>
                      <TableCell className="text-right">
                        <Amount value={trade.unit_price} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Amount value={trade.tax_amount} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </MarketPricesProvider>
  );
}
