import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PostingStrip } from '@/components/posting-strip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { verifiedWalletPageSummary } from '@/lib/wallet-page-summary';
import { requireMember } from '@/lib/session';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
import { verifiedWalletCalendarPage } from '@/lib/wallet-calendar-proof';
import { sides } from '../sides';
import { fill } from '../copy';
import { COPY } from './copy';
import { dayKeyOf, parseGameClock, passbookDate } from '@/lib/game-calendar';
import type { WalletHistoryPage } from './types';
import { activityPeriod, activityPeriodUrl, activityCursorUrl, activityDirection, activityCalendarRange } from './period';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: pick(locale, COPY.metaTitle),
    robots: { index: false, follow: false },
  };
}

/**
 * The whole recent ledger, on its own.
 *
 * The wallet screen carries the five most recent entries under the balance,
 * because that is what a member opens it to see. A ledger is a list that only
 * grows, and pushing the balance, the bank panel and the transfer form off
 * the top of the screen to make room for it was the wrong trade — so the rest
 * of it lives here.
 */
export default async function WalletActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string; cursor?: string; direction?: string; from?: string | string[]; to?: string | string[] }>;
}) {
  await requireMember();
  const locale = await getServerLocale();
  const t = (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy);
  const params = await searchParams;
  const period = activityPeriod(params?.period);
  const direction = activityDirection(params?.direction);
  let range: ReturnType<typeof activityCalendarRange> = null;
  let rangeError: string | null = null;
  try {
    range = activityCalendarRange(params?.from, params?.to);
    if (range && period !== 'all') rangeError = t(COPY.rangeConflict);
  } catch {
    rangeError = t(COPY.rangeInvalid);
  }
  // The API verifies the opaque cursor against the current owner and session.
  const cursor = typeof params?.cursor === 'string' && params.cursor.length <= 2048 ? params.cursor : undefined;
  const unverifiedHistory = rangeError ? null : await apiOrNull<WalletHistoryPage>(
    `/api/v1/wallet/activity?period=${period}&direction=${direction}${range ? `&from=${range.from}&to=${range.to}` : ''}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
  );
  const history = range && !verifiedWalletCalendarPage(unverifiedHistory, range, direction) ? null : unverifiedHistory;
  // Passbook date column (redesign 2026-11-26): each line's game date from the server calendar.
  const gameClock = history ? parseGameClock(await apiOrNull<unknown>('/api/v1/game-clock')) : null;
  const pageSummary = history ? verifiedWalletPageSummary(history) : null;


  return (
    <div data-page="wallet-activity" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/wallet">
          <ArrowLeft />
          {t(COPY.backToWallet)}
        </Link>
      </Button>

      <PageHeader eyebrow="RECENT ACTIVITY" title={t(COPY.title)}>
        {t(COPY.intro)}
      </PageHeader>

      <nav aria-label={t(COPY.periodNav)} className="flex flex-wrap gap-2">
        {([
          ['all', t(COPY.periodAll)],
          ['7d', t(COPY.period7d)],
          ['30d', t(COPY.period30d)],
        ] as const).map(([value, label]) => (
          <Button key={value} asChild variant={!range && period === value ? 'default' : 'outline'} size="sm">
            <Link href={activityPeriodUrl(value, direction)} aria-current={!range && period === value ? 'page' : undefined}>
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      <nav aria-label={t(COPY.directionNav)} className="flex flex-wrap gap-2">
        {([
          ['all', t(COPY.directionAll)], ['in', t(COPY.directionIn)], ['out', t(COPY.directionOut)], ['neutral', t(COPY.directionNeutral)],
        ] as const).map(([value, label]) => (
          <Button key={value} asChild variant={direction === value ? 'default' : 'outline'} size="sm">
            <Link href={activityPeriodUrl(period, value, range)} aria-current={direction === value ? 'page' : undefined}>{label}</Link>
          </Button>
        ))}
      </nav>
      <form action="/wallet/activity" method="get" aria-label={t(COPY.rangeForm)} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="direction" value={direction} />
        <label className="grid gap-1 text-sm" htmlFor="wallet-activity-from">{t(COPY.rangeFrom)}
          <input id="wallet-activity-from" type="date" name="from" required defaultValue={range?.from ?? ''} className="rounded-md border bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm" htmlFor="wallet-activity-to">{t(COPY.rangeTo)}
          <input id="wallet-activity-to" type="date" name="to" required defaultValue={range?.to ?? ''} className="rounded-md border bg-background px-3 py-2" />
        </label>
        <Button type="submit" variant="secondary">{t(COPY.rangeApply)}</Button>
        <Button asChild variant="outline"><Link href={activityPeriodUrl('all', direction)}>{t(COPY.rangeClear)}</Link></Button>
      </form>
      {range && <p className="text-sm text-muted-foreground">{fill(t(COPY.rangeSelected), { from: range.from, to: range.to })}</p>}
      {rangeError && <p role="alert" className="text-sm text-destructive">{rangeError}</p>}
      <p className="text-sm text-muted-foreground">{t(COPY.listNote)}</p>
      {history && (
        <section aria-label={t(COPY.summaryRegion)} className="rounded-xl border bg-card p-4 space-y-2">
          {pageSummary ? (
            <>
              <h2 className="text-sm font-semibold">{fill(t(COPY.summaryHeading), { n: String(pageSummary.transactionCount) })}</h2>
              <dl className="grid gap-2 sm:grid-cols-3 text-sm">
                <div><dt className="text-muted-foreground">{t(COPY.cashDelta)}</dt><dd className="font-mono break-all">{groupDigits(pageSummary.cashDelta)} WLD</dd></div>
                <div><dt className="text-muted-foreground">{t(COPY.bankDelta)}</dt><dd className="font-mono break-all">{groupDigits(pageSummary.bankDelta)} WLD</dd></div>
                <div><dt className="text-muted-foreground">{t(COPY.netDelta)}</dt><dd className="font-mono break-all">{groupDigits(pageSummary.netDelta)} WLD</dd></div>
              </dl>
              <p className="text-xs text-muted-foreground">{t(COPY.summaryScope)}</p>
            </>
          ) : <p role="status" className="text-sm text-muted-foreground">{t(COPY.summaryUnverified)}</p>}
        </section>
      )}
      {history?.hasMore && <p role="status" className="text-sm text-muted-foreground">{t(COPY.hasMore)}</p>}
      {cursor && <Button asChild variant="outline" size="sm" className="w-fit"><Link href={activityPeriodUrl(period, direction, range)}>{t(COPY.restart)}</Link></Button>}
      <Card>
        <CardContent>
          {rangeError ? (
            <EmptyState title={t(COPY.rangeRetry)} />
          ) : !history ? (
            <EmptyState title={t(COPY.loadError)} />
          ) : history.transactions.length === 0 ? (
            <EmptyState
              title={t(COPY.empty)}
              description={t(COPY.emptyHint)}
            />
          ) : (
            history.transactions.map((entry) => {
              const { debit, credit } = sides(entry, locale);
              return (
                <div key={entry.transactionId} className="grid gap-1 border-b border-[var(--g1-line)] py-1 last:border-b-0 sm:grid-cols-[5.5rem_1fr] sm:items-center sm:gap-3">
                {(() => {
                  const key = gameClock ? dayKeyOf(gameClock, entry.occurredAt) : null;
                  return key ? (
                    <time dateTime={entry.occurredAt} className="mv-print text-[12px] text-[var(--g1-gold)]" title={t(COPY.gameDateTitle)}>
                      {passbookDate(key)}
                    </time>
                  ) : <span aria-hidden />;
                })()}
                <PostingStrip
                  debit={debit}
                  credit={credit}
                  amount={entry.netAmount}
                  label={entry.label}
                  at={formatMoment(entry.occurredAt)}
                />
                {process.env.WALLET_TRANSACTION_DETAIL_ENABLED === 'true' &&
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(entry.transactionId) && (
                    <Link className="min-h-11 w-fit px-3 py-2 text-sm underline underline-offset-4" href={`/wallet/activity/transactions/${entry.transactionId}`}>
                      {t(COPY.detailLink)}
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      {history?.hasMore && history.nextCursor && (
        <Button asChild variant="outline" className="w-fit">
          <Link href={activityCursorUrl(period, history.nextCursor, direction, range)}>{t(COPY.olderPage)}</Link>
        </Button>
      )}
      {history && <p className="text-xs text-muted-foreground">{fill(t(COPY.asOfNote), { at: formatMoment(history.asOf) })}</p>}
    </div>
  );
}
