import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { WatchlistToggle } from '../watchlist-toggle';

interface WatchlistRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly created_at: string;
}

function changeLabel(current: string, open: string) {
  const currentValue = BigInt(current);
  const openValue = BigInt(open);
  if (openValue <= 0n) return '—';
  const basisPoints = ((currentValue - openValue) * 10000n) / openValue;
  const sign = basisPoints > 0n ? '+' : '';
  const absolute = basisPoints < 0n ? -basisPoints : basisPoints;
  return `${sign}${basisPoints < 0n ? '-' : ''}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}%`;
}

export default async function StockWatchlistPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const watchlist = await apiOrNull<{ stocks: WatchlistRow[] }>('/api/v1/stocks/watchlist');

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="WATCHLIST" title={isEn ? 'My Stock Watchlist' : '내 관심 종목'}>
        {isEn
          ? 'Keep the virtual stocks you care about in one focused view. Prices are game-only data, not real securities or investment products.'
          : '관심 있는 가상 종목만 한곳에서 빠르게 확인하세요. 표시되는 가격은 게임 전용 데이터이며 실제 증권·투자 상품이 아닙니다.'}
      </PageHeader>

      {watchlist === null ? (
        <EmptyState
          title={isEn ? 'Failed to load your watchlist.' : '관심 종목을 불러오지 못했어요.'}
          description={isEn ? 'Please try again in a few moments.' : '잠시 후 다시 시도해 주세요.'}
        />
      ) : watchlist.stocks.length === 0 ? (
        <EmptyState
          title={isEn ? 'Your watchlist is empty.' : '아직 관심 종목이 없습니다.'}
          description={isEn ? 'Add stocks from the market and they will appear here.' : '거래소에서 관심 종목을 추가하면 이곳에 모아서 볼 수 있습니다.'}
          action={<Button asChild><Link href="/stocks">{isEn ? 'Browse market' : '거래소 둘러보기'}</Link></Button>}
        />
      ) : (
        <section aria-labelledby="watchlist-title" className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="watchlist-title" className="text-lg">
              {isEn ? `${watchlist.stocks.length} watched stocks` : `관심 종목 ${watchlist.stocks.length}개`}
            </h2>
            <Button asChild variant="outline"><Link href="/stocks">{isEn ? 'Find more stocks' : '종목 더 찾기'}</Link></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {watchlist.stocks.map((stock) => (
              <Card key={stock.stock_id} className="gap-4">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="font-mono">{stock.symbol}</Badge>
                    <WatchlistToggle stockId={stock.stock_id} watching />
                  </div>
                  <CardTitle className="text-base">{stock.name}</CardTitle>
                  <CardDescription>{isEn ? 'Saved virtual stock' : '저장한 가상 종목'}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{isEn ? 'Current price' : '현재가'}</p>
                      <p className="tabular text-xl font-semibold">{groupDigits(stock.current_price)} WLD</p>
                    </div>
                    <Badge variant="outline" className="tabular">{changeLabel(stock.current_price, stock.day_open_price)}</Badge>
                  </div>
                  <Button asChild className="min-h-11">
                    <Link href={`/stocks/${encodeURIComponent(stock.symbol)}`}>{isEn ? 'Open stock hub' : '종목 허브 열기'}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
