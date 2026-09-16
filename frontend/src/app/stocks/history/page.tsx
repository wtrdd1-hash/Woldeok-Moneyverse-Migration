import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';

interface TradeRow {
  readonly trade_id: string;
  readonly symbol: string;
  readonly side: string;
  readonly quantity: string;
  readonly unit_price: string;
  readonly gross_amount: string;
  readonly tax_amount: string;
  readonly created_at: string;
}

type SideFilter = 'all' | 'buy' | 'sell';

function normalizeSide(value: string | undefined): SideFilter {
  return value === 'buy' || value === 'sell' ? value : 'all';
}

export default async function StockHistoryPage({ searchParams }: { readonly searchParams: Promise<{ readonly q?: string; readonly side?: string }> }) {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const { q = '', side: rawSide } = await searchParams;
  const query = q.trim().slice(0, 80);
  const side = normalizeSide(rawSide);
  const history = await apiOrNull<{ trades: TradeRow[] }>('/api/v1/stocks/history');
  const visible = history?.trades.filter((trade) => {
    const matchesSide = side === 'all' || trade.side === side;
    const matchesQuery = !query || trade.symbol.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale));
    return matchesSide && matchesQuery;
  }) ?? [];

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="TRADE HISTORY" title={isEn ? 'My Stock Trade History' : '내 주식 거래 내역'}>
        {isEn ? 'Find past virtual-stock buys and sells by symbol or trade type.' : '과거 가상 주식 매수·매도 내역을 종목 코드와 거래 유형으로 빠르게 찾아보세요.'}
      </PageHeader>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/stocks">{isEn ? 'Back to market' : '거래소로 돌아가기'}</Link></Button><Button asChild variant="outline"><Link href="/stocks/watchlist">{isEn ? 'Watchlist' : '관심 종목'}</Link></Button></div>
      {history === null ? <EmptyState title={isEn ? 'Failed to load trade history.' : '거래 내역을 불러오지 못했어요.'} /> : history.trades.length === 0 ? <EmptyState title={isEn ? 'No trade history yet.' : '아직 거래 내역이 없습니다.'} /> : (
        <section className="grid gap-4" aria-labelledby="trade-history-results">
          <form method="get" role="search" className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Input name="q" defaultValue={query} maxLength={80} placeholder={isEn ? 'Search symbol' : '종목 코드 검색'} aria-label={isEn ? 'Search trade history by symbol' : '종목 코드로 거래 내역 검색'} />
            <select name="side" defaultValue={side} aria-label={isEn ? 'Filter by trade type' : '거래 유형 필터'} className="min-h-10 rounded-md border bg-background px-3 text-sm"><option value="all">{isEn ? 'All trades' : '전체 거래'}</option><option value="buy">{isEn ? 'Buys' : '매수'}</option><option value="sell">{isEn ? 'Sells' : '매도'}</option></select>
            <Button type="submit">{isEn ? 'Apply' : '적용'}</Button>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="trade-history-results" className="text-lg">{isEn ? `${visible.length} of ${history.trades.length} trades` : `전체 ${history.trades.length}건 중 ${visible.length}건`}</h2>{(query || side !== 'all') ? <Button asChild variant="outline"><Link href="/stocks/history">{isEn ? 'Clear filters' : '필터 초기화'}</Link></Button> : null}</div>
          {visible.length === 0 ? <EmptyState title={isEn ? 'No trades match these filters.' : '조건에 맞는 거래 내역이 없습니다.'} description={isEn ? 'Try another symbol or clear the filters.' : '다른 종목 코드를 입력하거나 필터를 초기화해 보세요.'} /> : <div className="grid gap-3">{visible.map((trade) => <Card key={trade.trade_id}><CardContent className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="grid gap-1"><div className="flex flex-wrap items-center gap-2"><Link href={`/stocks/${encodeURIComponent(trade.symbol)}`} className="font-mono font-semibold underline-offset-4 hover:underline">{trade.symbol}</Link><Badge variant={trade.side === 'buy' ? 'default' : 'outline'}>{trade.side === 'buy' ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도')}</Badge></div><p className="text-sm text-muted-foreground">{formatMoment(trade.created_at, isEn ? 'Checking...' : '기록 확인 중')}</p></div><div className="grid gap-1 text-sm sm:text-right"><p>{trade.quantity}{isEn ? ' shares' : '주'} × <Amount value={trade.unit_price} /></p><p className="text-muted-foreground">{isEn ? 'Gross' : '거래금액'} <Amount value={trade.gross_amount} /> · {isEn ? 'Tax' : '세금'} <Amount value={trade.tax_amount} /></p></div></CardContent></Card>)}</div>}
        </section>
      )}
    </div>
  );
}
