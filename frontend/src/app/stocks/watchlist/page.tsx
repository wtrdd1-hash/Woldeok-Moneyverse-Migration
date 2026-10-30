import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { parseStockWatchlistTrend, parseVerifiedStockWatchlist, type VerifiedWatchlistRow } from '@/lib/stock-watchlist-trend';
import { WatchlistToggle } from '../watchlist-toggle';

type WatchlistRow = VerifiedWatchlistRow;

type WatchlistSort = 'saved' | 'change' | 'price' | 'name';

function changeBasisPoints(stock: WatchlistRow) {
  const current = BigInt(stock.current_price);
  const open = BigInt(stock.day_open_price);
  return open > 0n ? ((current - open) * 10000n) / open : 0n;
}

function changeLabel(current: string, open: string) {
  const currentValue = BigInt(current);
  const openValue = BigInt(open);
  if (openValue <= 0n) return '—';
  const basisPoints = ((currentValue - openValue) * 10000n) / openValue;
  const negative = basisPoints < 0n;
  const absolute = negative ? -basisPoints : basisPoints;
  return `${basisPoints > 0n ? '+' : negative ? '-' : ''}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}%`;
}

function normalizeSort(value: string | undefined): WatchlistSort {
  return value === 'change' || value === 'price' || value === 'name' ? value : 'saved';
}

function sortWatchlist(stocks: readonly WatchlistRow[], sort: WatchlistSort) {
  return [...stocks].sort((a, b) => {
    if (sort === 'change') return changeBasisPoints(a) > changeBasisPoints(b) ? -1 : changeBasisPoints(a) < changeBasisPoints(b) ? 1 : 0;
    if (sort === 'price') return BigInt(a.current_price) > BigInt(b.current_price) ? -1 : BigInt(a.current_price) < BigInt(b.current_price) ? 1 : 0;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return b.created_at.localeCompare(a.created_at);
  });
}

export default async function StockWatchlistPage({ searchParams }: { readonly searchParams: Promise<{ readonly q?: string; readonly sort?: string; readonly trend?: string | string[] }> }) {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const { q = '', sort: sortParam, trend: trendParam } = await searchParams;
  const trend = parseStockWatchlistTrend(trendParam);
  const query = q.trim().slice(0, 80);
  const sort = normalizeSort(sortParam);
  const response = trend === null ? null : await apiOrNull<unknown>(`/api/v1/stocks/watchlist${trend === 'all' ? '' : `?trend=${trend}`}`);
  const watchlist = trend === null ? null : parseVerifiedStockWatchlist(response, trend);
  const filtered = watchlist?.stocks.filter((stock) => `${stock.symbol} ${stock.name}`.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale))) ?? [];
  const visibleStocks = sortWatchlist(filtered, sort);

  return (
    <div data-page="stocks-watchlist" className="mv-page mv-page--finance grid gap-6">
      <PageHeader eyebrow="WATCHLIST" title={isEn ? 'My Stock Watchlist' : '내 관심 종목'}>
        {isEn ? 'Search and prioritize saved virtual stocks in one focused view. Prices are game-only data, not real securities or investment products.' : '저장한 가상 종목을 검색하고 원하는 순서로 빠르게 확인하세요. 표시되는 가격은 게임 전용 데이터이며 실제 증권·투자 상품이 아닙니다.'}
      </PageHeader>

      {trend === null ? (
        <EmptyState title={isEn ? 'Invalid price trend filter.' : '등락 필터가 올바르지 않습니다.'} description={isEn ? 'Clear the filter and try again.' : '필터를 초기화하고 다시 시도해 주세요.'} />
      ) : watchlist === null ? (
        <EmptyState title={isEn ? 'Failed to load your watchlist.' : '관심 종목을 불러오지 못했어요.'} description={isEn ? 'Please try again in a few moments.' : '잠시 후 다시 시도해 주세요.'} />
      ) : watchlist.stocks.length === 0 && trend === 'all' ? (
        <EmptyState title={isEn ? 'Your watchlist is empty.' : '아직 관심 종목이 없습니다.'} description={isEn ? 'Add stocks from the market and they will appear here.' : '거래소에서 관심 종목을 추가하면 이곳에 모아서 볼 수 있습니다.'}>
          <Button asChild><Link href="/stocks">{isEn ? 'Browse market' : '거래소 둘러보기'}</Link></Button>
        </EmptyState>
      ) : watchlist.stocks.length === 0 ? (
        <EmptyState title={isEn ? 'No watched stocks match the selected daily trend.' : '선택한 등락 조건에 맞는 관심 종목이 없습니다.'} description={isEn ? 'Try another daily price trend or clear the filter.' : '다른 등락 조건을 선택하거나 필터를 초기화해 주세요.'}>
          <Button asChild variant="outline"><Link href="/stocks/watchlist">{isEn ? 'Clear filter' : '필터 초기화'}</Link></Button>
        </EmptyState>
      ) : (
        <section aria-labelledby="watchlist-title" className="grid gap-4">
          <form method="get" className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]" role="search">
            <Input name="q" defaultValue={query} maxLength={80} placeholder={isEn ? 'Search symbol or name' : '종목 코드 또는 이름 검색'} aria-label={isEn ? 'Search saved stocks' : '관심 종목 검색'} />
            <select name="sort" defaultValue={sort} aria-label={isEn ? 'Sort saved stocks' : '관심 종목 정렬'} className="min-h-10 rounded-md border bg-background px-3 text-sm">
              <option value="saved">{isEn ? 'Recently saved' : '최근 저장순'}</option>
              <option value="change">{isEn ? 'Top change' : '등락률순'}</option>
              <option value="price">{isEn ? 'Highest price' : '가격순'}</option>
              <option value="name">{isEn ? 'Name' : '이름순'}</option>
            </select>
            <select name="trend" defaultValue={trend ?? 'all'} aria-label={isEn ? 'Filter watched stocks by daily price trend' : '관심 종목 당일 등락 필터'} className="min-h-11 rounded-md border bg-background px-3 text-sm">
              <option value="all">{isEn ? 'All trends' : '전체 등락'}</option>
              <option value="up">{isEn ? 'Rising' : '상승'}</option>
              <option value="down">{isEn ? 'Falling' : '하락'}</option>
              <option value="flat">{isEn ? 'Unchanged' : '보합'}</option>
            </select>
            <Button type="submit">{isEn ? 'Apply' : '적용'}</Button>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="watchlist-title" className="text-lg">{isEn ? `${visibleStocks.length} of ${watchlist.stocks.length} stocks matching selected trend` : `선택한 등락 조건 ${watchlist.stocks.length}개 중 ${visibleStocks.length}개`}</h2>
            <Button asChild variant="outline"><Link href="/stocks">{isEn ? 'Find more stocks' : '종목 더 찾기'}</Link></Button>
          </div>
          {visibleStocks.length === 0 ? (
            <EmptyState title={isEn ? 'No saved stocks match your search.' : '검색 조건에 맞는 관심 종목이 없습니다.'} description={isEn ? 'Try another symbol or name, or clear the filters.' : '다른 종목 코드나 이름으로 검색하거나 조건을 초기화해 보세요.'}>
              <Button asChild variant="outline"><Link href="/stocks/watchlist">{isEn ? 'Clear filters' : '검색 초기화'}</Link></Button>
            </EmptyState>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleStocks.map((stock) => (
                <Card key={stock.stock_id} className="gap-4">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2"><Badge variant="secondary" className="font-mono">{stock.symbol}</Badge><WatchlistToggle stockId={stock.stock_id} watching /></div>
                    <CardTitle className="text-base">{stock.name}</CardTitle>
                    <CardDescription>{isEn ? 'Saved virtual stock' : '저장한 가상 종목'}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">{isEn ? 'Current price' : '현재가'}</p><p className="tabular text-xl font-semibold">{groupDigits(stock.current_price)} WLD</p></div><Badge variant="outline" className="tabular">{changeLabel(stock.current_price, stock.day_open_price)}</Badge></div>
                    <Button asChild className="min-h-11"><Link href={`/stocks/${encodeURIComponent(stock.symbol)}`}>{isEn ? 'Open stock hub' : '종목 허브 열기'}</Link></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
