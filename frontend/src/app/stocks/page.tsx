import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PriceChart } from '@/components/price-chart';
import type { PricePoint } from '@/components/price-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatMoment, priceDirection } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { TradeDialog } from './trade-dialog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 주식',
  robots: { index: false, follow: false },
};

/** The API returns these rows as the database shapes them. */
interface StockRow {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly active: boolean;
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

export default async function StocksPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly stock?: string }>;
}) {
  await requireMember();
  const { stock: requested } = await searchParams;

  const [market, portfolio, history] = await Promise.all([
    apiOrNull<{ stocks: StockRow[] }>('/api/v1/stocks'),
    apiOrNull<{ holdings: HoldingRow[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ trades: TradeRow[] }>('/api/v1/stocks/history'),
  ]);

  const stocks = market?.stocks ?? [];
  // The chart follows a query parameter rather than client state, so the view
  // is linkable and works before hydration — the original could only reach it
  // by clicking.
  const selected = stocks.find((row) => row.id === requested) ?? stocks[0];
  const prices = selected
    ? await apiOrNull<{ prices: PricePoint[] }>(`/api/v1/stocks/${selected.id}/prices`)
    : null;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="VIRTUAL MARKET" title="가상 주식 시장">
        경제 상황에 따라 가격이 바뀌는 게임 전용 시장입니다. 실제 주식·현금·투자 상품이
        아닙니다.
      </PageHeader>

      <section aria-labelledby="market-title" className="grid gap-3">
        <h2 id="market-title" className="text-lg">
          거래 가능 종목
        </h2>
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
                    <Badge variant="secondary" className="font-mono">
                      {row.symbol}
                    </Badge>
                    {!row.active && <Badge variant="outline">거래 정지</Badge>}
                  </div>
                  <CardTitle className="text-base">{row.name}</CardTitle>
                  <CardDescription>
                    {row.description || '게임 경제 안에서 거래하는 가상 종목입니다.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <p className="text-xl font-medium">
                    <Amount
                      value={row.current_price}
                      direction={priceDirection(row.current_price, row.day_open_price)}
                      currency
                    />
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <TradeDialog
                      stockId={row.id}
                      symbol={row.symbol}
                      name={row.name}
                      currentPrice={row.current_price}
                      side="buy"
                    />
                    <TradeDialog
                      stockId={row.id}
                      symbol={row.symbol}
                      name={row.name}
                      currentPrice={row.current_price}
                      side="sell"
                    />
                    <Button asChild variant="ghost" className="min-h-11">
                      <Link href={`/stocks?stock=${row.id}`} scroll={false}>
                        차트 보기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{selected.symbol} 가격 추이</CardTitle>
            <CardDescription>최근 최대 80개 가격 기록</CardDescription>
          </CardHeader>
          <CardContent>
            {prices === null ? (
              <EmptyState title="가격 기록을 불러오지 못했어요." />
            ) : (
              <PriceChart points={prices.prices} symbol={selected.symbol} />
            )}
          </CardContent>
        </Card>
      )}

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
                        <Amount
                          value={holding.market_value}
                          direction={priceDirection(holding.current_price, holding.average_cost)}
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
  );
}
