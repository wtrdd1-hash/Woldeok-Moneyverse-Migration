import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ServerClockPill } from '@/components/server-clock-pill';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { readWalletOverview } from '@/lib/wallet-overview';
import { COPY } from './copy';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: pick(locale, COPY.metaTitle),
    description: pick(locale, COPY.metaDescription),
    robots: { index: false, follow: false },
  };
}

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
  const t = (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy);

  const [wallet, watchlist, portfolio, history, alertEvents] = await Promise.all([
    apiOrNull<unknown>('/api/v1/wallet?recent=6').then(readWalletOverview),
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
    <div data-page="dashboard" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="MY MONEYVERSE" title={t(COPY.title)}>
        {t(COPY.intro)}
      </PageHeader>

      {/* GAMEYEAR.4: the API's server year and day-of-year, same component as the header. */}
      <ServerClockPill className="w-fit" />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={t(COPY.summaryLabel)}>
        <SummaryCard title={t(COPY.wldBalance)} value={wallet ? <><Amount value={wallet.balances.totalAvailableAmount} /> {wallet.balances.currency}</> : '—'} />
        <SummaryCard title={t(COPY.watchedCount)} value={String(watched.length)} />
        <SummaryCard title={t(COPY.holdingsCount)} value={String(holdings.length)} />
        <SummaryCard title={t(COPY.alertsCount)} value={String(events.length)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div><CardTitle>{t(COPY.watchlist)}</CardTitle><CardDescription>{t(COPY.watchlistDescription)}</CardDescription></div>
              <Button asChild variant="outline" size="sm"><Link href="/stocks">{t(COPY.market)}</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {watchlist === null ? <LoadFailure text={t(COPY.loadFailure)} /> : watched.length === 0 ? <EmptyState title={t(COPY.noWatched)} /> : watched.slice(0, 5).map((stock) => (
              <div key={stock.stock_id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <div><Badge variant="secondary" className="font-mono">{stock.symbol}</Badge><div className="mt-1 font-medium">{stock.name}</div></div>
                <div className="text-right"><Amount value={stock.current_price} /> WLD</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(COPY.portfolio)}</CardTitle>
            <CardDescription>{t(COPY.portfolioDescription)}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {portfolio === null ? <LoadFailure text={t(COPY.loadFailure)} /> : holdings.length === 0 ? <EmptyState title={t(COPY.noHoldings)} /> : holdings.slice(0, 5).map((holding) => (
              <div key={holding.stock_id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <div><div className="font-medium">{holding.symbol} · {holding.name}</div><div className="text-muted-foreground">{t(COPY.quantity)} {holding.quantity}</div></div>
                <div className="text-right"><Amount value={holding.market_value} /> WLD</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t(COPY.recentActivity)}</CardTitle><CardDescription>{t(COPY.recentActivityDescription)}</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {wallet?.recentTransactions.slice(0, 3).map((entry) => <div key={entry.transactionId} className="rounded-md border p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{entry.label}</span><span><Amount value={entry.netAmount} /> WLD</span></div><time className="text-xs text-muted-foreground" dateTime={entry.occurredAt}>{formatMoment(entry.occurredAt)}</time></div>)}
            {trades.map((trade) => <div key={trade.trade_id} className="rounded-md border p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{trade.symbol} · {trade.side}</span><span>{trade.quantity} · <Amount value={trade.gross_amount} /> WLD</span></div><time className="text-xs text-muted-foreground" dateTime={trade.created_at}>{formatMoment(trade.created_at)}</time></div>)}
            {!wallet && history === null ? <LoadFailure text={t(COPY.loadFailure)} /> : (wallet?.recentTransactions.length ?? 0) === 0 && trades.length === 0 ? <EmptyState title={t(COPY.noActivity)} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{t(COPY.recentAlerts)}</CardTitle><CardDescription>{t(COPY.recentAlertsDescription)}</CardDescription></div><Button asChild variant="outline" size="sm"><Link href="/stocks/alerts">{t(COPY.manage)}</Link></Button></div></CardHeader>
          <CardContent className="grid gap-2">
            {alertEvents === null ? <LoadFailure text={t(COPY.loadFailure)} /> : events.length === 0 ? <EmptyState title={t(COPY.noAlerts)} /> : events.map((event) => <div key={event.event_id} className="rounded-md border p-3 text-sm"><div className="font-medium">{event.symbol} · {event.name}</div><div className="text-muted-foreground"><Amount value={event.trigger_price} /> WLD · {event.trigger_day_change_bps >= 0 ? '+' : ''}{(event.trigger_day_change_bps / 100).toFixed(2)}%</div><time className="text-xs text-muted-foreground" dateTime={event.triggered_at}>{formatMoment(event.triggered_at)}</time></div>)}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>{t(COPY.nextActions)}</CardTitle><CardDescription>{t(COPY.nextActionsDescription)}</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2"><Button asChild><Link href="/quests">{t(COPY.quests)}</Link></Button><Button asChild variant="outline"><Link href="/work">{t(COPY.work)}</Link></Button><Button asChild variant="outline"><Link href="/wallet">{t(COPY.wallet)}</Link></Button><Button asChild variant="outline"><Link href="/stocks">{t(COPY.virtualStocks)}</Link></Button></CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value }: { readonly title: string; readonly value: React.ReactNode }) {
  return <Card><CardHeader className="pb-2"><CardDescription>{title}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>;
}

function LoadFailure({ text }: { readonly text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
