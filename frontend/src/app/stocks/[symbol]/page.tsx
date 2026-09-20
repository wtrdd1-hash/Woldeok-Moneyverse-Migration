import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';
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
  const [portfolio, watchlist, discussion, alertResult] = await Promise.all([
    apiOrNull<{ holdings: HubHolding[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ stocks: WatchlistRow[] }>('/api/v1/stocks/watchlist'),
    apiOrNull<{ posts: PostSummary[] }>(`/api/v1/board/public/stock-posts?stock=${encodedSymbol}`),
    apiOrNull<{ alerts: StockAlertRule[] }>('/api/v1/stocks/alerts'),
  ]);
  const holding = findHoldingForStock(portfolio?.holdings ?? [], stock.id);
  const watching = (watchlist?.stocks ?? []).some((row) => row.stock_id === stock.id);
  const posts = discussion?.posts ?? [];
  const stockAlerts = (alertResult?.alerts ?? []).filter((rule) => rule.stock_id === stock.id);

  return (
    <div data-page="stocks-symbol" className="mv-page mv-page--finance grid gap-6">
      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/stocks">
          <ArrowLeft />
          {isEn ? 'Back to market' : '시장으로 돌아가기'}
        </Link>
      </Button>

      <PageHeader eyebrow="VIRTUAL STOCK HUB" title={`${stock.symbol} · ${stock.name}`}>
        {stock.description ||
          (isEn
            ? 'A game-only virtual stock. Not a real stock or financial product.'
            : '게임 안에서만 거래되는 가상 종목입니다. 실제 주식·금융상품이 아닙니다.')}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge variant="secondary" className="font-mono">
                  {stock.symbol}
                </Badge>
                <CardTitle className="mt-2">{isEn ? 'Market snapshot' : '시장 요약'}</CardTitle>
              </div>
              <WatchlistToggle stockId={stock.id} watching={watching} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Figure label={isEn ? 'Current price' : '현재가'} value={stock.current_price} />
              <Figure label={isEn ? 'Day open' : '오늘 시가'} value={stock.day_open_price} />
              <Figure label={isEn ? 'Day high' : '오늘 고가'} value={stock.day_high_price} />
              <Figure label={isEn ? 'Day low' : '오늘 저가'} value={stock.day_low_price} />
            </dl>
            <p className="text-sm text-muted-foreground">
              {isEn
                ? `Available ${groupDigits(stock.shares_available)} shares · ${groupDigits(stock.shares_outstanding)} issued`
                : `거래 가능 ${groupDigits(stock.shares_available)}주 · 총 발행 ${groupDigits(stock.shares_outstanding)}주`}
            </p>
            <div className="flex flex-wrap gap-2">
              <StockDetailDialog
                stockId={stock.id}
                symbol={stock.symbol}
                name={stock.name}
                currentPrice={stock.current_price}
                dayOpenPrice={stock.day_open_price}
                available={stock.shares_available}
              />
              <Button asChild variant="outline">
                <Link href={`/stocks/compare?symbols=${encodedSymbol}`}>
                  {isEn ? 'Compare' : '다른 종목과 비교'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/stocks/alerts?stock=${encodedSymbol}`}>
                  {isEn ? 'Set alert' : '조건부 알림 설정'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEn ? 'My position' : '내 보유 현황'}</CardTitle>
            <CardDescription>
              {isEn
                ? 'Authoritative server-side holding values.'
                : '서버 기준 보유 수량과 평가액입니다.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio === null ? (
              <EmptyState
                title={isEn ? 'Unable to load holdings.' : '보유 현황을 불러오지 못했어요.'}
              />
            ) : holding ? (
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
                    <Badge variant={rule.condition_met ? 'default' : 'secondary'}>
                      {rule.condition_met ? (isEn ? 'Met' : '충족') : isEn ? 'Watching' : '감시 중'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{stockAlertThreshold(rule)}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{isEn ? 'Related community' : '관련 커뮤니티'}</CardTitle>
            <CardDescription>
              {isEn
                ? 'Recent posts tagged with this virtual stock.'
                : '이 종목이 태그된 최근 토론입니다.'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/board?stock=${encodedSymbol}#board-composer`}>
                {isEn ? 'Start discussion' : '이 종목으로 글쓰기'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/board?stock=${encodedSymbol}`}>
                {isEn ? 'All discussions' : '전체 토론'}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {discussion === null ? (
            <EmptyState
              title={isEn ? 'Unable to load discussions.' : '토론을 불러오지 못했어요.'}
            />
          ) : posts.length === 0 ? (
            <EmptyState title={isEn ? 'No discussion yet.' : '아직 관련 토론이 없어요.'} />
          ) : (
            <ul className="divide-y">
              {posts.slice(0, 5).map((post) => (
                <li key={post.postId}>
                  <Link
                    href={`/board/${post.postId}`}
                    className="flex min-h-14 items-center gap-3 py-3 hover:underline"
                  >
                    <span className="min-w-0 flex-1">
                      <b className="block truncate">{post.title}</b>
                      <span className="text-xs text-muted-foreground">
                        {post.authorName} ·{' '}
                        {formatMoment(post.createdAt, isEn ? 'Time unavailable' : '시간 확인 중')}
                      </span>
                    </span>
                    {post.commentCount > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="size-3.5" aria-hidden />
                        {post.commentCount}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
