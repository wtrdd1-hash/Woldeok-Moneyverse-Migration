import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { publicApi } from '@/lib/api';
import { formatDay, formatMoment } from '@/lib/money';
import { canonicalUrl, breadcrumbJsonLd } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';
import { BoardParticipation } from './board-participation';
import { parseBoardTitleQuery } from './board-title-search';

export const revalidate = 60;

const boardMetadata = {
  title: '커뮤니티 광장 — 공략 및 자유 토론',
  description: '월덕 머니버스 이용자들의 가상경제 팁, 공략과 자유 토론을 누구나 읽을 수 있는 커뮤니티 게시판입니다.',
  alternates: { canonical: canonicalUrl('/board') },
};

export async function generateMetadata({ searchParams }: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasSearch = params.q !== undefined;
  return { ...boardMetadata, robots: { index: !hasSearch, follow: true } };
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
  readonly updatedAt: string | null;
  readonly commentCount: number;
  readonly mine: boolean;
  readonly stock: StockContext | null;
}

function selectedStock(value: string | string[] | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9._-]{1,16}$/.test(trimmed) ? trimmed.toUpperCase() : null;
}

export default async function BoardPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const stock = selectedStock(params.stock);
  const search = parseBoardTitleQuery(params.q);
  const query = new URLSearchParams();
  if (stock) query.set('stock', stock);
  if (search.query) query.set('q', search.query);
  const suffix = query.size ? `?${query.toString()}` : '';
  const data = search.invalid ? null : await publicApi<{ posts: PostSummary[] }>(
    `/api/v1/board/public/stock-posts${suffix}`,
    60,
  );

  const boardBreadcrumb = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '커뮤니티 광장', path: '/board' },
  ]);

  return (
    <div data-page="board" className="mv-page mv-page--community grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(boardBreadcrumb) }}
      />
      <PageHeader eyebrow="COMMUNITY" title="커뮤니티 광장">
        게시글과 댓글은 누구나 읽을 수 있습니다. 글과 댓글 작성은 로그인하고 최신 정책에
        동의한 회원만 가능합니다.
      </PageHeader>

      {stock ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">{stock}</Badge>
              <span>종목과 연결된 토론만 보고 있습니다.</span>
            </div>
            <Link className="text-sm font-semibold underline underline-offset-4" href="/board">
              전체 글 보기
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <form role="search" method="get" action="/board" className="flex flex-wrap items-end gap-3">
            {stock ? <input type="hidden" name="stock" value={stock} /> : null}
            <label htmlFor="board-title-query" className="grid min-w-0 flex-1 gap-1 text-sm font-semibold">
              게시글 제목 검색
              <input id="board-title-query" name="q" type="search" maxLength={80}
                defaultValue={search.query ?? (typeof params.q === 'string' ? params.q.slice(0, 80) : '')}
                placeholder="검색할 제목" className="min-h-11 rounded-md border border-input bg-background px-3"
                aria-describedby="board-search-scope" />
            </label>
            <button type="submit" className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">검색</button>
            <Link href={stock ? `/board?stock=${encodeURIComponent(stock)}` : '/board'} className="inline-flex min-h-11 items-center underline underline-offset-4">검색 초기화</Link>
          </form>
          <p id="board-search-scope" className="mt-2 text-xs text-muted-foreground">
            최근 공개 게시글 50건의 제목에서만 검색합니다. 전체 게시글 검색이 아닙니다.
          </p>
          {search.invalid ? <p role="alert" className="mt-2 text-sm text-destructive">검색어는 1~80자이며 제어문자와 꺾쇠괄호를 사용할 수 없습니다.</p> : null}
        </CardContent>
      </Card>

      <BoardParticipation defaultStockSymbol={stock ?? undefined} />

      <section aria-labelledby="posts-title" className="grid gap-3">
        <h2 id="posts-title" className="sr-only">
          글 목록
        </h2>
        {search.invalid ? (
          <EmptyState title="검색어를 확인해 주세요." />
        ) : data === null ? (
          <EmptyState title="게시글을 불러오지 못했어요." />
        ) : data.posts.length === 0 ? (
          <EmptyState
            title={search.query ? '최근 게시글 50건에서 일치하는 제목이 없어요.' : stock ? `${stock} 토론 글이 아직 없어요.` : '아직 작성된 글이 없어요.'}
            description="회원의 첫 이야기를 기다리고 있어요."
          />
        ) : (
          <Card className="overflow-hidden py-0">
            <CardContent className="px-0">
              <ul>
                {data.posts.map((post) => (
                  <li key={post.postId} className="border-b last:border-b-0">
                    <Link
                      href={`/board/${post.postId}`}
                      className="flex min-h-14 items-center gap-4 px-4 py-3 transition-colors hover:bg-paper-dark"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          {post.stock ? (
                            <Badge variant="outline" className="shrink-0">
                              {post.stock.symbol}
                            </Badge>
                          ) : null}
                          <b className="truncate font-bold">{post.title}</b>
                          {post.commentCount > 0 && (
                            <span
                              className="flex shrink-0 items-center gap-1 text-xs font-bold text-clay-ink"
                              aria-label={`댓글 ${post.commentCount}개`}
                            >
                              <MessageSquare className="size-3.5" aria-hidden />
                              {post.commentCount}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground sm:hidden">
                          {post.authorName} · {formatDay(post.createdAt, '작성일 확인 중')}
                        </span>
                      </span>
                      <span className="hidden w-32 shrink-0 truncate text-sm text-muted-foreground sm:block">
                        {post.authorName}
                      </span>
                      <time
                        dateTime={post.createdAt}
                        className="hidden w-36 shrink-0 text-right text-xs text-muted-foreground sm:block"
                      >
                        {formatMoment(post.createdAt, '작성 시간 확인 중')}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Keep the ad outside the posting form and away from individual UGC detail pages. */}
      <PublicAdvertisement />
    </div>
  );
}
