import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { groupDigits } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AdminMarketEvent, AdminStock, AdminStockDynamics } from '../types';
import { formatMoment } from '@/lib/money';
import { cn } from '@/lib/cn';
import { eventScope } from '@/app/stocks/market-news';
import { CancelMarketEventButton, PublishMarketEventDialog } from './market-events';
import { strengthLabel } from './strengths';
import {
  CorporateActionDialog,
  DeleteStockDialog,
  NewStockForm,
  SetPriceDialog,
  ToggleActive,
} from '../admin-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/market');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

/** Basis points a day, written as the percent a day a reader thinks in, signed. */
function percentPerDay(bps: string): string {
  const value = Number(bps) / 100;
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} %/일`;
}

/** How far the price sits from the fair value, as a signed percent. BigInt: these are prices. */
function gapPercent(price: string, fair: string): string {
  if (!/^\d+$/.test(price) || !/^\d+$/.test(fair) || BigInt(fair) === 0n) return '—';
  const bps = ((BigInt(price) - BigInt(fair)) * 10_000n) / BigInt(fair);
  const value = Number(bps) / 100;
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} %`;
}

export default async function AdminMarketPage() {
  await requireAdminConsole(AREA.href);
  const [stocks, dynamics, events] = await Promise.all([
    apiOrNull<{ stocks: AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<{ stocks: AdminStockDynamics[] }>('/api/v1/admin/stocks/dynamics'),
    apiOrNull<{ events: AdminMarketEvent[] }>('/api/v1/admin/stocks/market-events'),
  ]);
  const marketTrend = dynamics?.stocks[0]?.market_trend_bps ?? null;

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* Which way the market leans, and how hard each stock is moving.
          Percent a day rather than basis points, because that is the unit
          an operator decides in; the console does the division. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">시장 방향</CardTitle>
          <p className="text-sm text-muted-foreground">
            시장 전체 추세{' '}
            <b className="tabular text-foreground">
              {marketTrend === null ? '—' : percentPerDay(marketTrend)}
            </b>
            . 종목 추세는 몇 시간에 걸쳐 바뀌고, 변동성은 하루 3 % 근처로 돌아오며 오르내려요.
            적정가는 소식과 매매가 쌓여 움직이는 기준점입니다.
          </p>
        </CardHeader>
        <CardContent>
          {dynamics === null ? (
            <EmptyState title="시장 상태를 불러오지 못했어요." />
          ) : dynamics.stocks.length === 0 ? (
            <EmptyState title="거래 중인 종목이 없습니다." />
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">종목</TableHead>
                  <TableHead className="text-right">현재가 / 적정가</TableHead>
                  <TableHead className="text-right">추세</TableHead>
                  <TableHead className="text-right">변동성</TableHead>
                  <TableHead className="w-[12%] text-right">소식</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dynamics.stocks.map((row) => (
                  <TableRow key={row.stock_id}>
                    <TableCell className="truncate">
                      <span className="font-mono text-xs text-muted-foreground">{row.symbol}</span>{' '}
                      {row.name}
                    </TableCell>
                    <TableCell className="tabular text-right text-xs">
                      {groupDigits(row.current_price)} / {groupDigits(row.fair_value)}
                      <span className="block text-muted-foreground">
                        적정가 대비 {gapPercent(row.current_price, row.fair_value)}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'tabular text-right text-xs font-bold',
                        Number(row.trend_bps) > 0 ? 'text-rise' : Number(row.trend_bps) < 0 ? 'text-fall' : '',
                      )}
                    >
                      {percentPerDay(row.trend_bps)}
                    </TableCell>
                    <TableCell className="tabular text-right text-xs">
                      {(Number(row.vol_bps) / 100).toFixed(1)} %/일
                    </TableCell>
                    <TableCell className="tabular text-right text-xs">{row.live_events}건</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle className="text-base">시장 소식</CardTitle>
            <p className="text-sm text-muted-foreground">
              호재와 악재. 낸 순간부터 기간이 끝날 때까지 대상의 적정가가 기울고 변동성이 커져요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/admin/market/ai-news">AI 시나리오 →</Link>
            </Button>
            <PublishMarketEventDialog stocks={stocks?.stocks ?? []} />
          </div>
        </CardHeader>
        <CardContent>
          {events === null ? (
            <EmptyState title="소식을 불러오지 못했어요." />
          ) : events.events.length === 0 ? (
            <EmptyState title="아직 낸 소식이 없어요." />
          ) : (
            <ul className="grid gap-3">
              {events.events.map((event) => (
                <li
                  key={event.id}
                  className={cn(
                    'grid gap-2 rounded-[12px] border p-3 sm:grid-cols-[1fr_auto] sm:items-start',
                    !event.live && 'opacity-60',
                  )}
                >
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-bold',
                          event.direction === 'up' ? 'border-rise text-rise' : 'border-fall text-fall',
                        )}
                      >
                        {event.direction === 'up' ? '▲ 호재' : '▼ 악재'} · {strengthLabel(event.strength)}
                      </Badge>
                      <span className="font-mono text-muted-foreground">{eventScope(event)}</span>
                      <Badge variant="secondary">{event.source}</Badge>
                      <span className="text-muted-foreground">
                        {event.cancelled_at
                          ? `${formatMoment(event.cancelled_at)}에 끝냄`
                          : event.live
                            ? `${formatMoment(event.ends_at)}까지`
                            : `${formatMoment(event.ends_at)}에 끝남`}
                      </span>
                    </div>
                    <b className="text-sm">{event.headline}</b>
                    {event.body && (
                      <p className="text-sm text-muted-foreground [word-break:keep-all]">{event.body}</p>
                    )}
                  </div>
                  {event.live && <CancelMarketEventButton eventId={event.id} />}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">가상 주식 종목 관리</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <NewStockForm />
            {stocks === null ? (
              <EmptyState title="등록된 종목을 불러오지 못했어요." />
            ) : stocks.stocks.length === 0 ? (
              <EmptyState title="등록된 종목이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>코드</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">현재가</TableHead>
                      <TableHead className="text-right">유통 / 발행</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.stocks.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-mono text-xs">{stock.symbol}</TableCell>
                        <TableCell>{stock.name}</TableCell>
                        <TableCell className="text-right">
                          <Amount value={stock.current_price} />
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-right text-xs">
                          {groupDigits(stock.shares_available)} /{' '}
                          {groupDigits(stock.shares_outstanding)}
                          <span className="block text-muted-foreground">
                            보유자 {stock.holders}명 · 거래 {stock.trades}건
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stock.active ? 'secondary' : 'outline'}>
                            {stock.active ? '거래 중' : '정지'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            <ToggleActive id={stock.id} active={stock.active} kind="stock" />
                            <SetPriceDialog
                              stockId={stock.id}
                              symbol={stock.symbol}
                              currentPrice={stock.current_price}
                            />
                            <CorporateActionDialog stockId={stock.id} symbol={stock.symbol} />
                            <DeleteStockDialog
                              stockId={stock.id}
                              symbol={stock.symbol}
                              holders={stock.holders}
                              trades={stock.trades}
                            />
                          </div>
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
