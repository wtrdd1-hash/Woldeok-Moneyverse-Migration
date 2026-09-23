import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiOrNull } from '@/lib/api';
import { ADMIN_NAV, MEMBER_NAV, PUBLIC_NAV, navLabel } from '@/lib/navigation';
import type { CatalogItem } from '@/app/shop/shop-store-view';
import { currentViewer } from '@/lib/viewer';
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
  readonly searchParams: Promise<{ readonly q?: string }>;
}) {
  const [{ q = '' }, viewer] = await Promise.all([searchParams, currentViewer()]);
  const query = q.slice(0, 80);
  const signedIn = viewer.signedIn && viewer.consentCurrent;
  const entries = searchableEntries(
    PUBLIC_NAV,
    MEMBER_NAV,
    ADMIN_NAV,
    signedIn,
    signedIn && viewer.adminRoles.length > 0,
  );
  const results = filterSearchEntries(entries, query);
  const catalog = query.trim()
    ? await apiOrNull<{ catalogItems: CatalogItem[] }>(
        `/api/v1/shop/public-catalog?q=${encodeURIComponent(query.trim())}`,
      )
    : null;
  const catalogResults = catalog?.catalogItems.slice(0, 6) ?? [];

  return (
    <div data-page="search" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="SEARCH" title="통합 검색">
        현재 계정에서 사용할 수 있는 Moneyverse 화면과 기능을 찾아 바로 이동합니다.
      </PageHeader>

      <form role="search" action="/search" className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="global-search" className="sr-only">
          기능 또는 화면 검색
        </label>
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

      {!query.trim() ? (
        <EmptyState
          title="찾을 기능을 입력해 주세요."
          description="한글·영문 기능명이나 경로로 검색할 수 있습니다."
        />
      ) : results.length === 0 && catalogResults.length === 0 ? (
        <EmptyState
          title="검색 결과가 없습니다."
          description="다른 기능명으로 검색하거나 메뉴에서 원하는 화면을 찾아보세요."
        />
      ) : (
        <div className="grid gap-6" aria-live="polite">
          {results.length > 0 ? (
            <section aria-labelledby="search-results" className="grid gap-3">
              <h2 id="search-results" className="text-lg font-bold">
                화면·기능 {results.length}개
              </h2>
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
                      <p className="text-sm text-muted-foreground">
                        {navLabel(entry.label, 'en')} · {entry.href}
                      </p>
                      <Button asChild variant="outline" className="min-h-11 w-full">
                        <Link href={entry.href}>이 화면으로 이동</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {catalogResults.length > 0 ? (
            <section aria-labelledby="catalog-results" className="grid gap-3">
              <h2 id="catalog-results" className="text-lg font-bold">
                상점 상품 {catalogResults.length}개
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {catalogResults.map((item) => (
                  <Card key={item.catalog_id}>
                    <CardHeader className="gap-2 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <Button asChild variant="outline" className="min-h-11 w-full">
                        <Link href={`/shop?q=${encodeURIComponent(item.name)}`}>상점에서 보기</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
