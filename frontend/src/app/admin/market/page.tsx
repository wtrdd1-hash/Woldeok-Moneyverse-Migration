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
import { HaltStockDialog, HaltSettlementStatusDialog } from './admin-market-halt-dialog';
import { LimitPolicyGuardCard } from './limit-policy-guard-card';
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
    <div data-page="admin-market" className="mv-page mv-page--admin grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* 시장 거시 지표 및 AI 뉴스 센터 바로가기 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground font-medium">시장 전체 기조</span>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {marketTrend !== null ? percentPerDay(marketTrend) : '—'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            개별 종목 동역학이 공유하는 시장 전체 추세 지수
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground font-medium">상장 종목 수</span>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {stocks?.stocks.length ?? 0} <span className="text-xs font-normal text-muted-foreground font-sans">개 종목</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            정상 거래 및 서킷브레이커 상태 포함
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm bg-card flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground font-medium">AI 시장 뉴스룸</span>
            <CardTitle className="text-base font-bold text-foreground">
              AI 뉴스 자동 발행 센터
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Link
              href="/admin/market/ai-news"
              className="inline-flex w-full items-center justify-center h-9 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
            >
              뉴스룸 콘솔 바로가기 →
            </Link>
          </CardContent>
        </Card>
      </div>

      <LimitPolicyGuardCard />

      {/* 상장 주식 종목 관리 */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">상장 주식 종목 관리 ({stocks?.stocks.length ?? 0})</CardTitle>
          <NewStockForm />
        </CardHeader>
        <CardContent className="p-0">
          {/* 모바일 뷰: 종목 카드 스택 (md:hidden) */}
          <div className="grid gap-3 p-4 md:hidden divide-y divide-border/40">
            {stocks?.stocks.map((stock) => {
              const dyn = dynamics?.stocks.find((d) => d.symbol === stock.symbol);
              const gap = dyn ? gapPercent(stock.current_price, dyn.fair_value) : '—';
              const isHalted = stock.circuit_breaker_active;

              return (
                <div key={stock.symbol} className="pt-3 first:pt-0 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{stock.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">({stock.symbol})</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        발행 주식수: <span className="font-mono">{groupDigits(stock.total_shares)}주</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isHalted ? (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          거래정지
                        </Badge>
                      ) : (
                        <Badge variant={stock.active ? 'default' : 'secondary'} className="text-[10px] font-bold">
                          {stock.active ? '거래 중' : '비활성'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface/50 p-2.5 rounded-xl border border-border/50">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">현재가</span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        {groupDigits(stock.current_price)} <span className="text-[10px] text-muted-foreground font-normal">WLD</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">적정가 (괴리율)</span>
                      <span className="font-mono font-semibold text-xs text-foreground">
                        {dyn ? `${groupDigits(dyn.fair_value)} WLD` : '—'} <span className={`text-[10px] ${gap.startsWith('+') ? 'text-emerald-600' : gap.startsWith('-') ? 'text-rose-600' : 'text-muted-foreground'}`}>({gap})</span>
                      </span>
                    </div>
                  </div>

                  {/* 모바일 액션 버튼 그룹 (40px 터치 타겟 대응) */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <SetPriceDialog
                      symbol={stock.symbol}
                      name={stock.name}
                      currentPrice={stock.current_price}
                    />
                    <ToggleActive symbol={stock.symbol} active={stock.active} />
                    <HaltStockDialog
                      symbol={stock.symbol}
                      stockName={stock.name}
                      isHalted={isHalted}
                    />
                    <CorporateActionDialog
                      symbol={stock.symbol}
                      stockName={stock.name}
                      currentShares={stock.total_shares}
                    />
                    <DeleteStockDialog symbol={stock.symbol} name={stock.name} />
                  </div>
                </div>
              );
            })}
            {(!stocks || stocks.stocks.length === 0) && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                등록된 주식 종목이 없습니다.
              </div>
            )}
          </div>

          {/* 데스크톱 뷰: 테이블 (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">심볼 / 종목명</TableHead>
                  <TableHead className="text-right text-xs">현재가</TableHead>
                  <TableHead className="text-right text-xs">적정가</TableHead>
                  <TableHead className="text-right text-xs">괴리율</TableHead>
                  <TableHead className="text-right text-xs">발행주식수</TableHead>
                  <TableHead className="text-center text-xs">상태</TableHead>
                  <TableHead className="text-right text-xs">관리 액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks?.stocks.map((stock) => {
                  const dyn = dynamics?.stocks.find((d) => d.symbol === stock.symbol);
                  const gap = dyn ? gapPercent(stock.current_price, dyn.fair_value) : '—';
                  const isHalted = stock.circuit_breaker_active;

                  return (
                    <TableRow key={stock.symbol} className="hover:bg-surface/50">
                      <TableCell className="text-xs">
                        <div className="font-bold text-foreground">{stock.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{stock.symbol}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs">
                        {groupDigits(stock.current_price)} WLD
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {dyn ? `${groupDigits(dyn.fair_value)} WLD` : '—'}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-xs font-semibold ${gap.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : gap.startsWith('-') ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                        {gap}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {groupDigits(stock.total_shares)}주
                      </TableCell>
                      <TableCell className="text-center">
                        {isHalted ? (
                          <Badge variant="destructive" className="text-[10px] font-bold">
                            거래정지
                          </Badge>
                        ) : (
                          <Badge variant={stock.active ? 'default' : 'secondary'} className="text-[10px] font-bold">
                            {stock.active ? '거래 중' : '비활성'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <SetPriceDialog
                            symbol={stock.symbol}
                            name={stock.name}
                            currentPrice={stock.current_price}
                          />
                          <ToggleActive symbol={stock.symbol} active={stock.active} />
                          <HaltStockDialog
                            symbol={stock.symbol}
                            stockName={stock.name}
                            isHalted={isHalted}
                          />
                          <CorporateActionDialog
                            symbol={stock.symbol}
                            stockName={stock.name}
                            currentShares={stock.total_shares}
                          />
                          <DeleteStockDialog symbol={stock.symbol} name={stock.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 시장 이벤트 관리 */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base">시장 이벤트 & 충격 시나리오</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              특정 종목 또는 시장 전체에 호재/악재 이벤트를 발효합니다.
            </p>
          </div>
          <PublishMarketEventDialog stocks={stocks?.stocks ?? []} />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[580px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">적용 대상</TableHead>
                  <TableHead className="text-xs">이벤트명 / 설명</TableHead>
                  <TableHead className="text-xs">강도</TableHead>
                  <TableHead className="text-xs">종료 일시</TableHead>
                  <TableHead className="text-right text-xs">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.events.map((evt) => (
                  <TableRow key={evt.id} className="hover:bg-surface/50">
                    <TableCell className="text-xs font-bold font-mono">
                      {eventScope(evt)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-foreground">{evt.headline}</div>
                      {evt.body && <div className="text-muted-foreground text-[11px] truncate max-w-sm">{evt.body}</div>}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {strengthLabel(evt.strength)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {formatMoment(evt.expires_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <CancelMarketEventButton eventId={evt.id} />
                    </TableCell>
                  </TableRow>
                ))}
                {(!events || events.events.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                      현재 진행 중인 시장 이벤트가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
