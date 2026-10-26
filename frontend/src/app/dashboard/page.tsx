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
import { isCanonicalWld, type Overview } from '../wallet/sides';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '내 대시보드',
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

/** API JSON is untrusted at runtime even when the TypeScript client has a type argument. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function verifiedRows<T>(
  response: unknown,
  key: string,
  valid: (row: unknown) => row is T,
): T[] | null {
  if (!isRecord(response) || !Array.isArray(response[key])) return null;
  const rows: unknown[] = response[key];
  return rows.every(valid) ? rows as T[] : null;
}

function isWatchlistRow(value: unknown): value is WatchlistRow {
  return isRecord(value) && isText(value.stock_id) && isText(value.symbol)
    && isText(value.name) && isCanonicalWld(value.current_price);
}

function isHoldingRow(value: unknown): value is HoldingRow {
  return isRecord(value) && isText(value.stock_id) && isText(value.symbol)
    && isText(value.name) && isCanonicalWld(value.quantity)
    && isCanonicalWld(value.market_value);
}

function isTradeRow(value: unknown): value is TradeRow {
  return isRecord(value) && isText(value.trade_id) && isText(value.symbol)
    && (value.side === 'buy' || value.side === 'sell' || value.side === 'BUY' || value.side === 'SELL')
    && isCanonicalWld(value.quantity) && isCanonicalWld(value.gross_amount)
    && isText(value.created_at);
}

function isAlertEvent(value: unknown): value is AlertEvent {
  return isRecord(value) && isText(value.event_id) && isText(value.symbol)
    && isText(value.name) && isCanonicalWld(value.trigger_price)
    && typeof value.trigger_day_change_bps === 'number'
    && Number.isFinite(value.trigger_day_change_bps) && isText(value.triggered_at);
}

function isWalletOverview(value: unknown): value is Overview {
  if (!isRecord(value) || !isRecord(value.balances)
    || !isCanonicalWld(value.balances.totalAvailableAmount)
    || value.balances.currency !== 'WLD'
    || !Array.isArray(value.recentTransactions)) return false;
  return value.recentTransactions.every((entry: unknown) =>
    isRecord(entry) && isText(entry.transactionId) && isText(entry.label)
    && isCanonicalWld(entry.netAmount) && isText(entry.occurredAt));
}

export default async function DashboardPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const [walletResponse, watchlistResponse, portfolioResponse, historyResponse, alertsResponse] = await Promise.all([
    apiOrNull<unknown>('/api/v1/wallet?recent=6'),
    apiOrNull<unknown>('/api/v1/stocks/watchlist'),
    apiOrNull<unknown>('/api/v1/stocks/portfolio'),
    apiOrNull<unknown>('/api/v1/stocks/history'),
    apiOrNull<unknown>('/api/v1/stocks/alerts/events?limit=5'),
  ]);

  const wallet = isWalletOverview(walletResponse) ? walletResponse : null;
  const watchlist = verifiedRows(watchlistResponse, 'stocks', isWatchlistRow);
  const portfolio = verifiedRows(portfolioResponse, 'holdings', isHoldingRow);
  const history = verifiedRows(historyResponse, 'trades', isTradeRow);
  const alertEvents = verifiedRows(alertsResponse, 'events', isAlertEvent);
  const watched = watchlist ?? [];
  const holdings = portfolio ?? [];
  const trades = history?.slice(0, 5) ?? [];
  const events = alertEvents ?? [];

  return (
    <div data-page="dashboard" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="MY MONEYVERSE" title={isEn ? 'Personal Dashboard' : '내 대시보드'}>
        {isEn
          ? 'Your ledger balance, virtual-stock activity and next actions in one member-only view.'
          : '원장 잔액, 가상 주식 활동과 다음 할 일을 회원 전용 화면에서 한 번에 확인합니다.'}
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={isEn ? 'Account summary' : '계정 요약'}>
        <SummaryCard title={isEn ? 'WLD balance' : 'WLD 보유'} value={wallet ? <><Amount value={wallet.balances.totalAvailableAmount} /> {wallet.balances.currency}</> : null} isEn={isEn} />
        <SummaryCard title={isEn ? 'Watched stocks' : '관심 종목'} value={watchlist === null ? null : String(watched.length)} isEn={isEn} />
        <SummaryCard title={isEn ? 'Holdings' : '보유 종목'} value={portfolio === null ? null : String(holdings.length)} isEn={isEn} />
        <SummaryCard title={isEn ? 'Recent alerts' : '최근 발생 알림'} value={alertEvents === null ? null : String(events.length)} isEn={isEn} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div><CardTitle>{isEn ? 'Watchlist' : '관심 종목'}</CardTitle><CardDescription>{isEn ? 'Virtual stocks you chose to follow.' : '직접 저장한 가상 주식 종목입니다.'}</CardDescription></div>
              <Button asChild variant="outline" size="sm" className="min-h-11"><Link href="/stocks">{isEn ? 'Market' : '시장 보기'}</Link></Button>
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
            {(wallet === null || history === null) && <LoadFailure isEn={isEn} />}
            {wallet !== null && history !== null && wallet.recentTransactions.length === 0 && trades.length === 0
              ? <EmptyState title={isEn ? 'No recent activity.' : '최근 활동이 없어요.'} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{isEn ? 'Recent alert triggers' : '최근 조건부 알림'}</CardTitle><CardDescription>{isEn ? 'Server-recorded virtual-stock alert events.' : '서버가 기록한 가상 주식 조건 발생 내역입니다.'}</CardDescription></div><Button asChild variant="outline" size="sm" className="min-h-11"><Link href="/stocks/alerts">{isEn ? 'Manage' : '관리'}</Link></Button></div></CardHeader>
          <CardContent className="grid gap-2">
            {alertEvents === null ? <LoadFailure isEn={isEn} /> : events.length === 0 ? <EmptyState title={isEn ? 'No triggered alerts yet.' : '아직 발생한 알림이 없어요.'} /> : events.map((event) => <div key={event.event_id} className="rounded-md border p-3 text-sm"><div className="font-medium">{event.symbol} · {event.name}</div><div className="text-muted-foreground"><Amount value={event.trigger_price} /> WLD · {event.trigger_day_change_bps >= 0 ? '+' : ''}{(event.trigger_day_change_bps / 100).toFixed(2)}%</div><time className="text-xs text-muted-foreground" dateTime={event.triggered_at}>{formatMoment(event.triggered_at)}</time></div>)}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>{isEn ? 'Next actions' : '다음 활동'}</CardTitle><CardDescription>{isEn ? 'Jump back into the main member loops.' : '주요 회원 활동으로 바로 이동합니다.'}</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2"><Button asChild className="min-h-11"><Link href="/quests">{isEn ? 'Quests' : '퀘스트'}</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href="/work">{isEn ? 'Work' : '작업'}</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href="/wallet">{isEn ? 'Wallet' : '지갑'}</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href="/stocks">{isEn ? 'Virtual stocks' : '가상 주식'}</Link></Button></CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, isEn }: { readonly title: string; readonly value: React.ReactNode | null; readonly isEn: boolean }) {
  return <Card><CardHeader className="pb-2"><CardDescription>{title}</CardDescription><CardTitle className="text-2xl">{value === null ? <span aria-label={isEn ? 'Unavailable' : '조회 불가'}>—</span> : value}</CardTitle></CardHeader></Card>;
}

function LoadFailure({ isEn }: { readonly isEn: boolean }) {
  return <p role="status" className="text-sm text-muted-foreground">{isEn ? 'This section could not be loaded.' : '이 영역을 불러오지 못했어요.'}</p>;
}
