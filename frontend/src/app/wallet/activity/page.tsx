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
import { verifiedWalletCalendarPage } from '@/lib/wallet-calendar-proof';
import { sides } from '../sides';
import type { WalletHistoryPage } from './types';
import { activityPeriod, activityPeriodUrl, activityCursorUrl, activityDirection, activityCalendarRange } from './period';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 지갑 기록',
  robots: { index: false, follow: false },
};

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
  const params = await searchParams;
  const period = activityPeriod(params?.period);
  const direction = activityDirection(params?.direction);
  let range: ReturnType<typeof activityCalendarRange> = null;
  let rangeError: string | null = null;
  try {
    range = activityCalendarRange(params?.from, params?.to);
    if (range && period !== 'all') rangeError = '날짜 범위와 최근 기간을 동시에 선택할 수 없습니다.';
  } catch {
    rangeError = '날짜 범위를 확인해 주세요. 시작일과 종료일은 1~366일 이내이며 미래 날짜를 포함할 수 없습니다.';
  }
  // The API verifies the opaque cursor against the current owner and session.
  const cursor = typeof params?.cursor === 'string' && params.cursor.length <= 2048 ? params.cursor : undefined;
  const unverifiedHistory = rangeError ? null : await apiOrNull<WalletHistoryPage>(
    `/api/v1/wallet/activity?period=${period}&direction=${direction}${range ? `&from=${range.from}&to=${range.to}` : ''}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
  );
  const history = range && !verifiedWalletCalendarPage(unverifiedHistory, range, direction) ? null : unverifiedHistory;
  const pageSummary = history ? verifiedWalletPageSummary(history) : null;


  return (
    <div data-page="wallet-activity" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/wallet">
          <ArrowLeft />
          내 지갑
        </Link>
      </Button>

      <PageHeader eyebrow="RECENT ACTIVITY" title="내 지갑 기록">
        내 지갑을 거쳐 간 최근 기록입니다. 각 줄은 돈이 어디서 나와 어디로 갔는지와, 그 둘을
        맞춘 금액을 보여 줍니다.
      </PageHeader>

      <nav aria-label="지갑 기록 기간" className="flex flex-wrap gap-2">
        {([
          ['all', '전체 기간'],
          ['7d', '최근 7일'],
          ['30d', '최근 30일'],
        ] as const).map(([value, label]) => (
          <Button key={value} asChild variant={!range && period === value ? 'default' : 'outline'} size="sm">
            <Link href={activityPeriodUrl(value, direction)} aria-current={!range && period === value ? 'page' : undefined}>
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      <nav aria-label="지갑 기록 입출금 방향" className="flex flex-wrap gap-2">
        {([
          ['all', '전체 방향'], ['in', '입금'], ['out', '출금'], ['neutral', '순변동 없음'],
        ] as const).map(([value, label]) => (
          <Button key={value} asChild variant={direction === value ? 'default' : 'outline'} size="sm">
            <Link href={activityPeriodUrl(period, value, range)} aria-current={direction === value ? 'page' : undefined}>{label}</Link>
          </Button>
        ))}
      </nav>
      <form action="/wallet/activity" method="get" aria-label="한국 시간 날짜 범위" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="direction" value={direction} />
        <label className="grid gap-1 text-sm" htmlFor="wallet-activity-from">시작 날짜 (한국 시간)
          <input id="wallet-activity-from" type="date" name="from" required defaultValue={range?.from ?? ''} className="rounded-md border bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm" htmlFor="wallet-activity-to">종료 날짜 (한국 시간)
          <input id="wallet-activity-to" type="date" name="to" required defaultValue={range?.to ?? ''} className="rounded-md border bg-background px-3 py-2" />
        </label>
        <Button type="submit" variant="secondary">날짜 적용</Button>
        <Button asChild variant="outline"><Link href={activityPeriodUrl('all', direction)}>날짜 지우기</Link></Button>
      </form>
      {range && <p className="text-sm text-muted-foreground">선택한 한국 시간 날짜: {range.from} ~ {range.to} (양 끝 날짜 포함)</p>}
      {rangeError && <p role="alert" className="text-sm text-destructive">{rangeError}</p>}
      <p className="text-sm text-muted-foreground">확정된 본인 원장 기록을 한 번에 최대 50건씩 표시합니다. 입출금은 내 현금·은행 계정의 합계 순변동 기준이며, 계정 간 이동은 순변동 없음에 표시됩니다. 필터는 서버에서 이전 기록까지 적용됩니다.</p>
      {history && (
        <section aria-label="현재 지갑 기록 페이지 합계" className="rounded-xl border bg-card p-4 space-y-2">
          {pageSummary ? (
            <>
              <h2 className="text-sm font-semibold">현재 화면 {pageSummary.transactionCount}건 · 검증된 WLD 변동</h2>
              <dl className="grid gap-2 sm:grid-cols-3 text-sm">
                <div><dt className="text-muted-foreground">현금 증감</dt><dd className="font-mono break-all">{groupDigits(pageSummary.cashDelta)} WLD</dd></div>
                <div><dt className="text-muted-foreground">은행 증감</dt><dd className="font-mono break-all">{groupDigits(pageSummary.bankDelta)} WLD</dd></div>
                <div><dt className="text-muted-foreground">순변동</dt><dd className="font-mono break-all">{groupDigits(pageSummary.netDelta)} WLD</dd></div>
              </dl>
              <p className="text-xs text-muted-foreground">이전 페이지와 전체 기간 합계가 아닙니다. 거래 정산 완료 증명도 아닙니다.</p>
            </>
          ) : <p role="status" className="text-sm text-muted-foreground">현재 화면 합계를 검증할 수 없습니다. 거래별 기록만 확인해 주세요.</p>}
        </section>
      )}
      {history?.hasMore && <p role="status" className="text-sm text-muted-foreground">이전 기록이 더 있습니다.</p>}
      {cursor && <Button asChild variant="outline" size="sm" className="w-fit"><Link href={activityPeriodUrl(period, direction, range)}>처음부터 다시 보기</Link></Button>}
      <Card>
        <CardContent>
          {rangeError ? (
            <EmptyState title="날짜 범위를 다시 확인해 주세요." />
          ) : !history ? (
            <EmptyState title="지금은 기록을 불러올 수 없어요." />
          ) : history.transactions.length === 0 ? (
            <EmptyState
              title="아직 기록된 활동이 없어요."
              description="보상을 받거나 WLD를 보내면 실제 원장 기록이 여기에 표시됩니다."
            />
          ) : (
            history.transactions.map((entry) => {
              const { debit, credit } = sides(entry);
              return (
                <div key={entry.transactionId} className="grid gap-1">
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
                      거래 상세 보기
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
          <Link href={activityCursorUrl(period, history.nextCursor, direction, range)}>이전 기록 50건 보기</Link>
        </Button>
      )}
      {history && <p className="text-xs text-muted-foreground">조회 기준: {formatMoment(history.asOf)} · 이전 페이지로 이동하면 현재 50건을 대체합니다. 전체 기록을 내려받은 것은 아닙니다.</p>}
    </div>
  );
}
