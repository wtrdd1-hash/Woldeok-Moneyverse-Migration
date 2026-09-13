import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import type { Overview } from '../wallet/sides';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '내 대시보드 — 월덕 머니버스',
  description: '내 WLD, 가상 주식 관심종목과 보유 현황, 최근 활동과 조건부 알림을 한곳에서 확인합니다.',
  robots: { index: false, follow: false },
};

interface WatchlistRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

interface HoldingRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly quantity: string;
  readonly market_value: string;
  readonly current_price: string;
}

interface TradeRow {
  readonly trade_id: string;
  readonly symbol: string;
  readonly side: string;
  readonly quantity: string;
  readonly gross_amount: string;
  readonly created_at: string;
}

interface AlertEvent {
  readonly event_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly trigger_price: string;
  readonly trigger_day_change_bps: number;
  readonly triggered_at: string;
}

export default async function DashboardPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const [wallet, watchlist, portfolio, history, alertEvents] = await Promise.all([
    apiOrNull<Overview>('/api/v1/wallet?recent=6'),
    apiOrNull<{ stocks: WatchlistRow[] }>('/api/v1/stocks/watchlist'),
    apiOrNull<{ holdings: HoldingRow[] }>('/api/v1/stocks/portfolio'),
    apiOrNull<{ trades: TradeRow[] }>('/api/v1/stocks/history'),
    apiOrNull<{ events: AlertEvent[] }>('/api/v1/stocks/alerts/events?limit=5'),
  ]);

  const watched = watchlist?.stocks ?? [];
  const holdings = portfolio?.holdings ?? [];
  const trades = history?.trades.slice(0, 5) ?? [];
  const events = alertEvents?.events ?? [];

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="MY MONEYVERSE" title={isEn ? 'Personal Dashboard' : '내 대시보드'}>
        {isEn
          ? 'Your ledger balance, virtual-stock activity and next actions in one member-only view.'
          : '원장 잔액, 가상 주식 활동과 다음 할 일을 회원 전용 화면에서 한 번에 확인합니다.'}
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={isEn ? 'Account summary' : '계정 요약'}>
        <SummaryCard title={isEn ? 'WLD balance' : 'WLD 보유'} value={wallet ? <><Amount value={wallet.balances.totalAvailableAmount} /> {wallet.balances.currency}</> : '—'} />
        <SummaryCard title={isEn ? 'Watched stocks' : '관심 종목'} value={String(watched.length)} />
        <SummaryCard title={isEn ? 'Holdings' : '보유 종목'} value={String(holdings.length)} />
        <SummaryCard title={isEn ? 'Recent alerts' : '최근 발생 알림'} value={String(events.length)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div><CardTitle>{isEn ? 'Watchlist' : '관심 종목'}</CardTitle><CardDescription>{isEn ? 'Virtual stocks you chose to follow.' : '직접 저장한 가상 주식 종목입니다.'}</CardDescription></div>
              <Button asChild variant="outline" size="sm"><Link href="/stocks">{isEn ? 'Market' : '시장 보기'}</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {watchlist === null ? <LoadFailure isEn={isEn} /> : watched.length === 0 ? <EmptyState title={isEn ? 'No watched stocks yet.' : '아직 관심 종목이 없어요.'} /> : watched.slice(0, 5).map((stock) => (
              <div key={stock.stock_id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <div><Badge variant="secondary" className="font-mono">{stock.symbol}</Badge><div className="mt-1 font-medium">{stock.name}</div></div>
                <div className="text-right"><Amount value={stock.current_price} /> WLD</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEn ? 'Portfolio' : '가상 주식 보유'}</CardTitle>
            <CardDescription>{isEn ? 'Authoritative server-side holdings, not real securities.' : '서버가 기록한 게임 내부 보유량이며 실제 증권이 아닙니다.'}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {portfolio === null ? <LoadFailure isEn={isEn} /> : holdings.length === 0 ? <EmptyState title={isEn ? 'No virtual-stock holdings.' : '보유 중인 가상 주식이 없어요.'} /> : holdings.slice(0, 5).map((holding) => (
              <div key={holding.stock_id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <div><div className="font-medium">{holding.symbol} · {holding.name}</div><div className="text-muted-foreground">{isEn ? 'Quantity' : '수량'} {holding.quantity}</div></div>
                <div className="text-right"><Amount value={holding.market_value} /> WLD</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{isEn ? 'Recent activity' : '최근 활동'}</CardTitle><CardDescription>{isEn ? 'Latest ledger movements and stock trades.' : '최근 원장 이동과 가상 주식 거래입니다.'}</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {wallet?.recentTransactions.slice(0, 3).map((entry) => <div key={entry.transactionId} className="rounded-md border p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{entry.label}</span><span><Amount value={entry.netAmount} /> WLD</span></div><time className="text-xs text-muted-foreground" dateTime={entry.occurredAt}>{formatMoment(entry.occurredAt)}</time></div>)}
            {trades.map((trade) => <div key={trade.trade_id} className="rounded-md border p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{trade.symbol} · {trade.side}</span><span>{trade.quantity} · <Amount value={trade.gross_amount} /> WLD</span></div><time className="text-xs text-muted-foreground" dateTime={trade.created_at}>{formatMoment(trade.created_at)}</time></div>)}
            {!wallet && history === null ? <LoadFailure isEn={isEn} /> : (wallet?.recentTransactions.length ?? 0) === 0 && trades.length === 0 ? <EmptyState title={isEn ? 'No recent activity.' : '최근 활동이 없어요.'} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{isEn ? 'Recent alert triggers' : '최근 조건부 알림'}</CardTitle><CardDescription>{isEn ? 'Server-recorded virtual-stock alert events.' : '서버가 기록한 가상 주식 조건 발생 내역입니다.'}</CardDescription></div><Button asChild variant="outline" size="sm"><Link href="/stocks/alerts">{isEn ? 'Manage' : '관리'}</Link></Button></div></CardHeader>
          <CardContent className="grid gap-2">
            {alertEvents === null ? <LoadFailure isEn={isEn} /> : events.length === 0 ? <EmptyState title={isEn ? 'No triggered alerts yet.' : '아직 발생한 알림이 없어요.'} /> : events.map((event) => <div key={event.event_id} className="rounded-md border p-3 text-sm"><div className="font-medium">{event.symbol} · {event.name}</div><div className="text-muted-foreground"><Amount value={event.trigger_price} /> WLD · {event.trigger_day_change_bps >= 0 ? '+' : ''}{(event.trigger_day_change_bps / 100).toFixed(2)}%</div><time className="text-xs text-muted-foreground" dateTime={event.triggered_at}>{formatMoment(event.triggered_at)}</time></div>)}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>{isEn ? 'Next actions' : '다음 활동'}</CardTitle><CardDescription>{isEn ? 'Jump back into the main member loops.' : '주요 회원 활동으로 바로 이동합니다.'}</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2"><Button asChild><Link href="/quests">{isEn ? 'Quests' : '퀘스트'}</Link></Button><Button asChild variant="outline"><Link href="/work">{isEn ? 'Work' : '작업'}</Link></Button><Button asChild variant="outline"><Link href="/wallet">{isEn ? 'Wallet' : '지갑'}</Link></Button><Button asChild variant="outline"><Link href="/stocks">{isEn ? 'Virtual stocks' : '가상 주식'}</Link></Button></CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value }: { readonly title: string; readonly value: React.ReactNode }) {
  return <Card><CardHeader className="pb-2"><CardDescription>{title}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>;
}

function LoadFailure({ isEn }: { readonly isEn: boolean }) {
  return <p className="text-sm text-muted-foreground">{isEn ? 'This section could not be loaded.' : '이 영역을 불러오지 못했어요.'}</p>;
}
