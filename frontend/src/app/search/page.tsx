import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { publicApi } from '@/lib/api';
import { ADMIN_NAV, MEMBER_NAV, PUBLIC_NAV, navLabel } from '@/lib/navigation';
import { currentViewer } from '@/lib/viewer';
import { filterRecentPublicBoardPosts, normalizeSearchQuery } from './recent-board';
import { filterSearchEntries, searchableEntries } from './search';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '통합 검색',
  description: 'Moneyverse에서 사용할 수 있는 화면과 기능을 빠르게 찾습니다.',
  robots: { index: false, follow: false },
};

const ACCESS_LABEL = { public: '공개', member: '회원', admin: '운영' } as const;

export default async function SearchPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, viewer] = await Promise.all([searchParams, currentViewer()]);
  const query = normalizeSearchQuery(params.q);
  const signedIn = viewer.signedIn && viewer.consentCurrent;
  const entries = searchableEntries(
    PUBLIC_NAV,
    MEMBER_NAV,
    ADMIN_NAV,
    signedIn,
    signedIn && viewer.adminRoles.length > 0,
  );
  const results = filterSearchEntries(entries, query);
  // Public board data is provided by the existing PostgreSQL-backed API, never by a local demo index.
  const boardPayload = query ? await publicApi<unknown>('/api/v1/board/public/stock-posts', 60) : null;
  const recentPosts = query ? filterRecentPublicBoardPosts(boardPayload, query) : [];
  const noMatches = results.length === 0 && recentPosts !== null && recentPosts.length === 0;

  return (
    <div data-page="search" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="SEARCH" title="통합 검색">
        현재 계정에서 사용할 수 있는 Moneyverse 화면과 기능을 찾아 바로 이동합니다.
      </PageHeader>

      <form role="search" action="/search" className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="global-search" className="sr-only">기능 또는 화면 검색</label>
        <Input
          id="global-search"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={80}
          autoComplete="off"
          placeholder="예: 지갑, 작업, security, /stocks"
          className="min-h-11 flex-1"
        />
        <Button type="submit" className="min-h-11 sm:min-w-28">
          <Search aria-hidden="true" /> 검색
        </Button>
      </form>

      {!query ? (
        <EmptyState title="찾을 기능을 입력해 주세요." description="한글·영문 기능명이나 경로로 검색할 수 있습니다." />
      ) : (
        <>
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            화면 및 기능 {results.length}개 · 최근 공개 게시글 {recentPosts === null ? '확인 불가' : `${recentPosts.length}개`}
          </p>
          {noMatches ? (
            <EmptyState title="검색 결과가 없습니다." description="다른 기능명으로 검색하거나 메뉴에서 원하는 화면을 찾아보세요." />
          ) : null}
          {results.length > 0 ? (
            <section aria-labelledby="search-results" className="grid gap-3">
              <h2 id="search-results" className="text-lg font-bold">화면 및 기능 {results.length}개</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((entry) => (
                  <Card key={entry.href}>
                    <CardHeader className="gap-2 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base">{entry.label}</CardTitle>
                        <Badge variant="secondary">{ACCESS_LABEL[entry.access]}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <p className="text-sm text-muted-foreground">{navLabel(entry.label, 'en')} · {entry.href}</p>
                      <Button asChild variant="outline" className="min-h-11 w-full">
                        <Link href={entry.href}>이 화면으로 이동</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="recent-board-results" className="grid gap-3">
            <div className="space-y-1">
              <h2 id="recent-board-results" className="text-lg font-bold">최근 공개 게시글 제목 검색</h2>
              <p className="text-sm text-muted-foreground">
                전체 게시글 검색이 아닙니다. 최근 공개 게시글 최대 50개의 제목에서만 찾으며, 결과는 최대 10개 표시합니다.
              </p>
            </div>
            {recentPosts === null ? (
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  최근 게시글을 불러오지 못했습니다. 검색 결과가 없다는 뜻은 아닙니다. 잠시 후 다시 검색해 주세요.
                </AlertDescription>
              </Alert>
            ) : recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">최근 공개 게시글 제목과 일치하는 글이 없습니다.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {recentPosts.map((post) => (
                  <li key={post.postId}>
                    <Card className="h-full">
                      <CardHeader className="gap-2">
                        <Badge variant="secondary" className="w-fit">공개 게시글</Badge>
                        <CardTitle className="break-words text-base">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <p className="break-words text-sm text-muted-foreground">작성자 {post.authorName}</p>
                        <Button asChild variant="outline" className="min-h-11 w-full">
                          <Link href={`/board/${post.postId}`}>게시글 읽기</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
