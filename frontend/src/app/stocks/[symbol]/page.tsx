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
  return {
    title: `${stock.symbol} ${stock.name} — 가상 주식 상세`,
    description: `${stock.name}의 월덕 머니버스 가상 시세, 보유 현황, 차트와 관련 커뮤니티 토론을 한곳에서 확인하세요. 실제 금융상품이 아닙니다.`,
    alternates: { canonical: `/stocks/${encodeURIComponent(stock.symbol)}` },
    robots: { index: false, follow: true },
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
  const [portfolio, watchlist, discussion] = await Promise.all([
    apiOrNull<{ holdings: HubHolding[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ stocks: WatchlistRow[] }>('/api/v1/stocks/watchlist'),
    apiOrNull<{ posts: PostSummary[] }>(`/api/v1/board/public/stock-posts?stock=${encodedSymbol}`),
  ]);
  const holding = findHoldingForStock(portfolio?.holdings ?? [], stock.id);
  const watching = (watchlist?.stocks ?? []).some((row) => row.stock_id === stock.id);
  const posts = discussion?.posts ?? [];

  return (
    <div className="grid gap-6">
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
