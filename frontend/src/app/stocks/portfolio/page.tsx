import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart, ExternalLink, ShieldCheck } from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { MarketPricesProvider } from '@/lib/use-market-prices';
import { analyzePortfolio, type PortfolioHoldingInput } from './analysis';
import { TradeDialog } from '../trade-dialog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '가상 주식 포트폴리오 분석 — 자산 비중 및 실시간 손익',
  description: '보유 중인 게임 전용 가상 주식의 평가금액, 자산 구성 비중과 미실현 손익을 확인하고 리밸런싱을 수행합니다.',
  robots: { index: false, follow: false },
};

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

function signedPercent(bpsText: string): string {
  const bps = Number(bpsText);
  if (!Number.isSafeInteger(bps)) return '—';
  const prefix = bps > 0 ? '+' : bps < 0 ? '−' : '';
  return `${prefix}${(Math.abs(bps) / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

export default async function PortfolioAnalysisPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const [response, receiptsResult] = await Promise.all([
    apiOrNull<{ holdings: PortfolioHoldingInput[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ receipts: StockHaltReceipt[] }>('/api/v1/stocks/halt-receipts'),
  ]);
  const haltReceipts = receiptsResult?.receipts ?? [];

  let analysis: ReturnType<typeof analyzePortfolio> | null = null;
  let invalid = false;
  if (response) {
    try {
      analysis = analyzePortfolio(response.holdings ?? []);
    } catch {
      invalid = true;
    }
  }

  const isTotalProfit = analysis ? BigInt(analysis.total_unrealized_gain_loss) > 0n : false;
  const isTotalLoss = analysis ? BigInt(analysis.total_unrealized_gain_loss) < 0n : false;

  return (
    <MarketPricesProvider>
      <div data-page="stocks-portfolio" className="mv-page mv-page--finance grid gap-6">
        <PageHeader eyebrow="VIRTUAL PORTFOLIO" title={isEn ? 'Portfolio Analysis' : '가상 주식 포트폴리오'}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isEn
                ? 'Review valuation, allocation and unrealized gain/loss for your game-only virtual-stock holdings.'
                : '게임 전용 가상 주식 보유량의 평가금액, 자산 구성 비중과 실시간 미실현 손익을 정밀 분석합니다.'}
            </p>
            <Button asChild variant="outline" size="sm" className="min-h-9 text-xs font-semibold">
              <Link href="/stocks">
                {isEn ? 'Browse market' : '거래소 종목 목록'}
              </Link>
            </Button>
          </div>
        </PageHeader>

        {response === null || invalid || analysis === null ? (
          <EmptyState
            title={isEn ? 'Portfolio analysis is unavailable.' : '포트폴리오 분석을 불러오지 못했어요.'}
            description={isEn ? 'Authoritative holding data could not be validated. Please try again later.' : '서버 기준 보유 데이터를 검증하지 못했습니다. 잠시 후 다시 시도해 주세요.'}
          />
        ) : analysis.holdings.length === 0 ? (
          <div className="grid gap-6">
            <EmptyState
              title={isEn ? 'No active virtual-stock holdings.' : '현재 보유 중인 가상 주식이 없어요.'}
              description={isEn ? 'Buy a game-only virtual stock to see portfolio analytics here.' : '가상 주식 거래소에서 관심 종목을 매수하면 이곳에서 포트폴리오 분석과 리밸런싱을 진행할 수 있습니다.'}
            />
            <HaltReceiptsCard receipts={haltReceipts} isEn={isEn} />
          </div>
        ) : (
          <>
            {/* 1. 핀테크 헤어로 요약 메트릭 카드 3종 */}
            <section className="grid gap-3.5 sm:grid-cols-3" aria-label={isEn ? 'Portfolio summary' : '포트폴리오 요약'}>
              <Card className="border-border/80 bg-card/70 shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-2">
                  <CardDescription className="text-xs font-semibold text-muted-foreground">
                    {isEn ? 'Total Market Value' : '총 평가금액'}
                  </CardDescription>
                  <CardTitle className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                    <Amount value={analysis.total_market_value} /> <span className="text-sm font-normal text-muted-foreground">WLD</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-4 pt-0 text-xs text-muted-foreground font-mono">
                  {isEn ? 'Based on latest execution prices' : '최근 체결가 기준 실시간 평가'}
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/70 shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-2">
                  <CardDescription className="text-xs font-semibold text-muted-foreground">
                    {isEn ? 'Total Cost Basis' : '총 취득원가'}
                  </CardDescription>
                  <CardTitle className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-muted-foreground">
                    <Amount value={analysis.total_cost_basis} /> <span className="text-sm font-normal text-muted-foreground">WLD</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-4 pt-0 text-xs text-muted-foreground font-mono">
                  {isEn ? 'Historical purchase sum' : '체결 시점 가중평균 원금 합계'}
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/70 shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-semibold text-muted-foreground">
                      {isEn ? 'Unrealized Return' : '미실현 평가손익'}
                    </CardDescription>
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs font-bold px-2 py-0.5 ${
                        isTotalProfit
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isTotalLoss
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }`}
                    >
                      {signedPercent(analysis.total_gain_loss_bps)}
                    </Badge>
                  </div>
                  <CardTitle
                    className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                      isTotalProfit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTotalLoss
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-foreground'
                    }`}
                  >
                    {isTotalProfit ? '+' : ''}
                    <Amount value={analysis.total_unrealized_gain_loss} /> <span className="text-sm font-normal text-muted-foreground">WLD</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-4 pt-0 text-xs text-muted-foreground font-mono">
                  {isEn ? 'Profit / Loss versus cost' : '원금 대비 수익률 지표'}
                </CardContent>
              </Card>
            </section>

            {/* 2. 자산 배분 비주얼 스택 바 (Asset Allocation Multi-Segment Stack Bar) */}
            <Card className="border-border/80 bg-card/60 shadow-xs overflow-hidden">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="size-4 text-primary" />
                    <CardTitle className="text-sm font-bold">
                      {isEn ? 'Asset Allocation' : '포트폴리오 자산 배분 비중'}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {isEn ? `${analysis.holdings.length} Positions` : `${analysis.holdings.length}개 보유 종목`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* 다중 세그먼트 가로 스택 프로그레스 바 */}
                <div className="h-3.5 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
                  {analysis.holdings.map((holding) => {
                    const widthPct = Math.min(100, Math.max(0, Number(holding.allocation_bps) / 100));
                    if (widthPct <= 0) return null;
                    return (
                      <div
                        key={`bar-${holding.stock_id}`}
                        style={{ width: `${widthPct}%`, backgroundColor: holding.color }}
                        title={`${holding.symbol}: ${signedPercent(holding.allocation_bps)}`}
                        className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                      />
                    );
                  })}
                </div>

                {/* 범례 칩 목록 (Legend Chips) */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {analysis.holdings.map((holding) => (
                    <div
                      key={`legend-${holding.stock_id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-mono"
                    >
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: holding.color }} />
                      <span className="font-bold text-foreground">{holding.symbol}</span>
                      <span className="text-muted-foreground">{signedPercent(holding.allocation_bps)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 3. 종목별 보유 상세 및 원터치 리밸런싱 주문 카드 목록 */}
            <Card className="border-border/80 bg-card/60 shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/15">
                <CardTitle className="text-sm font-bold">
                  {isEn ? 'Holding Positions & Quick Rebalancing' : '보유 종목 상세 및 원터치 리밸런싱'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {isEn
                    ? 'Execute buy or profit-taking sell orders directly from each position.'
                    : '각 종목 카드에서 즉시 추가 매수 또는 차익 실현(매도) 주문을 실행할 수 있습니다.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 grid gap-3">
                {analysis.holdings.map((holding) => {
                  const isHoldingProfit = BigInt(holding.unrealized_gain_loss) > 0n;
                  const isHoldingLoss = BigInt(holding.unrealized_gain_loss) < 0n;

                  return (
                    <article
                      key={holding.stock_id}
                      className="rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-border hover:shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      {/* 좌측: 종목명 및 비중 프로그레스 */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: holding.color }}
                          />
                          <Badge variant="secondary" className="font-mono font-bold text-xs">
                            {holding.symbol}
                          </Badge>
                          <span className="font-bold text-sm text-foreground truncate">
                            {holding.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`font-mono text-[11px] font-bold px-1.5 py-0.5 ml-auto sm:ml-0 ${
                              isHoldingProfit
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isHoldingLoss
                                ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {signedPercent(holding.gain_loss_bps)}
                          </Badge>
                        </div>

                        <div className="text-xs font-mono text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>{isEn ? 'Holding' : '보유'} <b className="text-foreground">{groupDigits(holding.quantity)}</b>{isEn ? ' sh' : '주'}</span>
                          <span>{isEn ? 'Avg Cost' : '평균단가'} <b className="text-foreground">{groupDigits(holding.average_cost)}</b> WLD</span>
                          <span>{isEn ? 'Current' : '현재가'} <b className="text-foreground">{groupDigits(holding.current_price)}</b> WLD</span>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="h-1.5 flex-1 rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(0, Number(holding.allocation_bps) / 100))}%`,
                                backgroundColor: holding.color,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground shrink-0 font-medium">
                            {signedPercent(holding.allocation_bps)}
                          </span>
                        </div>
                      </div>

                      {/* 우측: 평가액 및 원터치 액션 버튼군 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                        <div className="text-left sm:text-right font-mono space-y-0.5">
                          <div className="text-xs text-muted-foreground">{isEn ? 'Market Valuation' : '평가금액'}</div>
                          <div className="text-base font-extrabold text-foreground">
                            {groupDigits(holding.market_value)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
                          </div>
                          <div className={`text-xs font-semibold ${
                            isHoldingProfit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isHoldingLoss
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-muted-foreground'
                          }`}>
                            {isHoldingProfit ? '+' : ''}{groupDigits(holding.unrealized_gain_loss)} WLD
                          </div>
                        </div>

                        {/* 원터치 리밸런싱 모달 및 종목 허브 링크 버튼군 */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* 추가 매수 다이얼로그 */}
                          <TradeDialog
                            stockId={holding.stock_id}
                            symbol={holding.symbol}
                            name={holding.name}
                            currentPrice={holding.current_price}
                            side="buy"
                            triggerLabel={isEn ? 'Buy More' : '추가 매수'}
                            triggerVariant="default"
                            triggerClassName="min-h-9 px-3 text-xs font-bold font-mono active:scale-95"
                          />

                          {/* 차익 실현 / 분할 매도 다이얼로그 */}
                          <TradeDialog
                            stockId={holding.stock_id}
                            symbol={holding.symbol}
                            name={holding.name}
                            currentPrice={holding.current_price}
                            holdingQuantity={holding.quantity}
                            side="sell"
                            triggerLabel={isEn ? 'Sell' : '매도'}
                            triggerVariant="outline"
                            triggerClassName="min-h-9 px-3 text-xs font-bold font-mono active:scale-95 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                          />

                          {/* 종목 허브 딥링크 */}
                          <Button asChild variant="ghost" size="sm" className="min-h-9 px-2 text-xs text-muted-foreground hover:text-foreground">
                            <Link href={`/stocks/${encodeURIComponent(holding.symbol)}`} title={isEn ? 'Open stock hub' : '종목 허브로 이동'}>
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </CardContent>
            </Card>

            {/* 4. 거래정지 원가환급 영수증 (STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC) */}
            <HaltReceiptsCard receipts={haltReceipts} isEn={isEn} />

            <p className="text-xs text-muted-foreground">
              {isEn
                ? 'This analysis covers service-internal virtual assets only. It is not investment advice and does not represent real securities or redeemable value.'
                : '이 분석은 월덕 머니버스 내부 가상 주식 데이터만 다룹니다. 실제 금융투자 상품이 아니며 현금 환전 가치를 보장하지 않습니다.'}
            </p>
          </>
        )}
      </div>
    </MarketPricesProvider>
  );
}

function HaltReceiptsCard({
  receipts,
  isEn,
}: {
  readonly receipts: readonly StockHaltReceipt[];
  readonly isEn: boolean;
}) {
  if (receipts.length === 0) return null;

  return (
    <Card className="border-border/80 bg-card/70 shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold">
              {isEn ? 'Stock Halt Settlement Receipts' : '종목 거래정지 원가환급 영수증'}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-mono text-emerald-600 border-emerald-500/40">
            {isEn ? `${receipts.length} Settled` : `${receipts.length}건 정산완료`}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
          {isEn
            ? 'Authoritative server-side cost basis refund receipts. All holdings were automatically settled into WLD with zero fees or taxes.'
            : '운영 정책에 의해 거래정지된 종목의 매수원가(Cost Basis) 자동환급 영수증입니다. 시장가가 아닌 취득 원가 전액이 지갑으로 환급되었으며 수수료와 세금은 면제되었습니다.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {receipt.stock_symbol}
                  </Badge>
                  <span className="font-semibold text-sm truncate max-w-[130px]" title={receipt.stock_name}>
                    {receipt.stock_name}
                  </span>
                </div>
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                  {receipt.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/60">
                <div>
                  <span>정산 수량: </span>
                  <span className="font-mono font-medium text-foreground">{groupDigits(receipt.quantity)}주</span>
                </div>
                <div>
                  <span>취득 단가: </span>
                  <span className="font-mono font-medium text-foreground">{groupDigits(receipt.basis_unit_amount)} WLD</span>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-foreground font-semibold">총 환급액:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    +{groupDigits(receipt.refund_amount)} WLD
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>{receipt.created_at ? formatMoment(receipt.created_at) : ''}</span>
                  <Link
                    href={`/stocks/${encodeURIComponent(receipt.stock_symbol)}`}
                    className="text-primary hover:underline flex items-center gap-0.5"
                  >
                    <span>{isEn ? 'View Hub' : '종목 허브'}</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

