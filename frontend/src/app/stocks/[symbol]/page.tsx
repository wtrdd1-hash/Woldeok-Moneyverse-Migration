import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';
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
import { StockDetailDialog } from '../stock-detail-dialog';
import { WatchlistToggle } from '../watchlist-toggle';
import { StockQuickAlertDialog } from './stock-quick-alert-dialog';
import { StockAlertDeleteButton } from './stock-alert-delete-button';
import { StockDiscussionSection } from './stock-discussion-section';
import { StockInteractiveChart } from './stock-interactive-chart';
import { StockTradingConsole } from './stock-trading-console';
import { StockHaltBanner } from './stock-halt-banner';
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
    title: `${stock.symbol} ${stock.name} — 가상 주식 상세`,
    description: `${stock.name}의 월덕 머니버스 가상 시세, 보유 현황, 차트와 관련 커뮤니티 토론을 한곳에서 확인하세요. 실제 금융상품이 아닙니다.`,
    alternates: { canonical: stockUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${stock.name} (${stock.symbol}) — 가상 주식 시세`,
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
  await requireMember();
  const { symbol } = await params;
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const market = await apiOrNull<{ stocks: HubStock[] }>('/api/v1/stocks');
  const stock = findStockBySymbol(market?.stocks ?? [], symbol);
  if (!stock) notFound();

  const encodedSymbol = encodeURIComponent(stock.symbol);
  const [portfolio, watchlist, discussion, alertResult, receiptsResult] = await Promise.all([
    apiOrNull<{ holdings: HubHolding[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ stocks: WatchlistRow[] }>('/api/v1/stocks/watchlist'),
    apiOrNull<{ posts: PostSummary[] }>(`/api/v1/board/public/stock-posts?stock=${encodedSymbol}`),
    apiOrNull<{ alerts: StockAlertRule[] }>('/api/v1/stocks/alerts'),
    apiOrNull<{ receipts: StockHaltReceipt[] }>('/api/v1/stocks/halt-receipts'),
  ]);
  const holding = findHoldingForStock(portfolio?.holdings ?? [], stock.id);
  const watching = (watchlist?.stocks ?? []).some((row) => row.stock_id === stock.id);
  const posts = discussion?.posts ?? [];
  const stockAlerts = (alertResult?.alerts ?? []).filter((rule) => rule.stock_id === stock.id);
  const stockReceipt = (receiptsResult?.receipts ?? []).find((r) => r.stock_id === stock.id);
  const isHalted =
    stock.halt_status === 'HALTED_SETTLED' ||
    stock.halt_status === 'HALTED_SETTLING' ||
    stock.halt_status === 'HALTING' ||
    holding?.halt_status === 'HALTED_SETTLED' ||
    !stock.active;

  return (
    <div data-page="stocks-symbol" className="mv-page mv-page--finance grid gap-6">
      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/stocks">
          <ArrowLeft />
          {isEn ? 'Back to market' : '시장으로 돌아가기'}
        </Link>
      </Button>

      {isHalted && (
        <StockHaltBanner
          symbol={stock.symbol}
          name={stock.name}
          haltStatus={stock.halt_status}
          receipt={stockReceipt}
          isEn={isEn}
        />
      )}

      <PageHeader eyebrow="VIRTUAL STOCK HUB" title={`${stock.symbol} · ${stock.name}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground [word-break:keep-all]">
            {stock.description ||
              (isEn
                ? 'A game-only virtual stock. Not a real stock or financial product.'
                : '게임 안에서만 거래되는 가상 종목입니다. 실제 주식·금융상품이 아닙니다.')}
          </p>
          <WatchlistToggle stockId={stock.id} watching={watching} />
        </div>
      </PageHeader>

      {/* 1. 상단 인터랙티브 라인/영역 차트 (1D/1W/1M/1Y 기간 탭 및 SVG 툴팁) */}
      <StockInteractiveChart
        currentPrice={stock.current_price}
        dayOpenPrice={stock.day_open_price}
        dayHighPrice={stock.day_high_price}
        dayLowPrice={stock.day_low_price}
        symbol={stock.symbol}
        isEn={isEn}
      />

      {/* 2. 본문 실시간 양방향 트레이딩 콘솔 (5/10-Depth 호가창 + 토스형 주문패널 + 모바일 하단 액션 바) */}
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

      {/* 3. 보조 2열 정보 그리드 (좌측: 시장 시세 요약, 우측: 내 보유 현황) */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <Card className="border-border/80 bg-card/60 shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">{isEn ? 'Market Snapshot' : '시장 시세 요약'}</CardTitle>
              <div className="flex items-center gap-1.5">
                <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5">
                  <Link href={`/stocks/compare?symbols=${encodedSymbol}`}>
                    {isEn ? 'Compare' : '종목 비교'}
                  </Link>
                </Button>
                <StockQuickAlertDialog
                  stockId={stock.id}
                  symbol={stock.symbol}
                  name={stock.name}
                  currentPrice={stock.current_price}
                  isEn={isEn}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-2 grid gap-3">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Figure label={isEn ? 'Current' : '현재가'} value={stock.current_price} />
              <Figure label={isEn ? 'Day open' : '오늘 시가'} value={stock.day_open_price} />
              <Figure label={isEn ? 'Day high' : '오늘 고가'} value={stock.day_high_price} />
              <Figure label={isEn ? 'Day low' : '오늘 저가'} value={stock.day_low_price} />
            </dl>
            <p className="text-xs font-mono text-muted-foreground pt-1">
              {isEn
                ? `Available ${groupDigits(stock.shares_available)} shares · ${groupDigits(stock.shares_outstanding)} issued`
                : `시장 유통 가능 ${groupDigits(stock.shares_available)}주 · 총 발행 ${groupDigits(stock.shares_outstanding)}주`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <CardTitle className="text-sm font-bold">{isEn ? 'My Position' : '내 보유 현황'}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {isEn ? 'Authoritative server-side holding values.' : '서버 기준 보유 수량 및 실시간 평가액입니다.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio === null ? (
              <EmptyState
                title={isEn ? 'Unable to load holdings.' : '보유 현황을 불러오지 못했어요.'}
              />
            ) : holding && Number(holding.quantity) > 0 ? (
              <dl className="grid gap-3">
                <Position
                  label={isEn ? 'Quantity' : '보유 수량'}
                  value={`${groupDigits(holding.quantity)}${isEn ? ' shares' : '주'}`}
                />
                <Position
                  label={isEn ? 'Average cost' : '평균 매입가'}
                  value={<Amount value={holding.average_cost} />}
                />
                <Position
                  label={isEn ? 'Market value' : '평가액'}
                  value={<Amount value={holding.market_value} />}
                />
              </dl>
            ) : stockReceipt ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {isEn ? 'Cost-Basis Settlement Receipt' : '거래정지 원가환급 영수증'}
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
              <EmptyState
                title={
                  isEn
                    ? 'You do not hold this virtual stock.'
                    : '이 가상 종목을 아직 보유하지 않았어요.'
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{isEn ? 'My alerts for this stock' : '이 종목의 내 알림'}</CardTitle>
            <CardDescription>
              {isEn
                ? 'See the server-side conditions currently watching this stock.'
                : '서버가 이 종목에 대해 감시 중인 조건을 바로 확인합니다.'}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/stocks/alerts?stock=${encodedSymbol}`}>
              {isEn ? 'Manage alerts' : '알림 관리'}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {alertResult === null ? (
            <EmptyState title={isEn ? 'Unable to load alerts.' : '알림을 불러오지 못했어요.'} />
          ) : stockAlerts.length === 0 ? (
            <EmptyState
              title={isEn ? 'No alert for this stock yet.' : '이 종목에 설정된 알림이 없어요.'}
              description={
                isEn
                  ? 'Create one without selecting the stock again.'
                  : '종목을 다시 고를 필요 없이 바로 알림을 만들 수 있습니다.'
              }
            />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {stockAlerts.slice(0, 6).map((rule) => (
                <li key={rule.alert_id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <b>{stockAlertConditionLabel(rule.condition_kind, isEn)}</b>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={rule.condition_met ? 'default' : 'secondary'}>
                        {rule.condition_met ? (isEn ? 'Met' : '충족') : isEn ? 'Watching' : '감시 중'}
                      </Badge>
                      <StockAlertDeleteButton alertId={rule.alert_id} isEn={isEn} />
                    </div>
                  </div>
                  <p className="mt-1 text-muted-foreground">{stockAlertThreshold(rule)}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <StockDiscussionSection
        stockId={stock.id}
        symbol={stock.symbol}
        name={stock.name}
        posts={posts}
        isEn={isEn}
      />
    </div>
  );
}

function Figure({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg border bg-surface p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular mt-1 text-xl font-bold">{groupDigits(value)}</dd>
    </div>
  );
}

function Position({ label, value }: { readonly label: string; readonly value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="tabular font-bold">{value}</dd>
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
