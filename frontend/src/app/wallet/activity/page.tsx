import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PostingStrip } from '@/components/posting-strip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { verifiedWalletCalendarPage } from '@/lib/wallet-calendar-proof';
import { verifiedWalletAmountPage } from '@/lib/wallet-amount-proof';
import { sides } from '../sides';
import type { WalletHistoryPage } from './types';
import { activityPeriod, activityPeriodUrl, activityCursorUrl, activityDirection, activityCalendarRange, activityMinAmount } from './period';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 지갑 기록',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
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
  searchParams?: Promise<{ period?: string; cursor?: string; direction?: string; from?: string | string[]; to?: string | string[]; minAmount?: string | string[] }>;
}) {
  await requireMember();
  const params = await searchParams;
  const period = activityPeriod(params?.period);
  const direction = activityDirection(params?.direction);
  let minAmount: string | null = null;
  let amountError: string | null = null;
  try { minAmount = activityMinAmount(params?.minAmount); }
  catch { amountError = '최소 금액은 1~30자리의 양의 WLD 정수로 입력해 주세요.'; }
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
  const unverifiedHistory = rangeError || amountError ? null : await apiOrNull<WalletHistoryPage>(
    `/api/v1/wallet/activity?period=${period}&direction=${direction}${range ? `&from=${range.from}&to=${range.to}` : ''}${minAmount ? `&minAmount=${encodeURIComponent(minAmount)}` : ''}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
  );
  const history = (range && !verifiedWalletCalendarPage(unverifiedHistory, range, direction)) ||
    (minAmount && !verifiedWalletAmountPage(unverifiedHistory, minAmount, direction)) ? null : unverifiedHistory;


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
            <Link href={activityPeriodUrl(value, direction, null, minAmount)} aria-current={!range && period === value ? 'page' : undefined}>
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
            <Link href={activityPeriodUrl(period, value, range, minAmount)} aria-current={direction === value ? 'page' : undefined}>{label}</Link>
          </Button>
        ))}
      </nav>
      <form action="/wallet/activity" method="get" aria-label="한국 시간 날짜 범위" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="direction" value={direction} />
        {minAmount && <input type="hidden" name="minAmount" value={minAmount} />}
        <label className="grid gap-1 text-sm" htmlFor="wallet-activity-from">시작 날짜 (한국 시간)
          <input id="wallet-activity-from" type="date" name="from" required defaultValue={range?.from ?? ''} className="rounded-md border bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm" htmlFor="wallet-activity-to">종료 날짜 (한국 시간)
          <input id="wallet-activity-to" type="date" name="to" required defaultValue={range?.to ?? ''} className="rounded-md border bg-background px-3 py-2" />
        </label>
        <Button type="submit" variant="secondary">날짜 적용</Button>
        <Button asChild variant="outline"><Link href={activityPeriodUrl('all', direction, null, minAmount)}>날짜 지우기</Link></Button>
      </form>
      <form action="/wallet/activity" method="get" aria-label="지갑 최소 WLD 순변동 검색" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="direction" value={direction} />
        {!range && period !== 'all' && <input type="hidden" name="period" value={period} />}
        {range && <><input type="hidden" name="from" value={range.from} /><input type="hidden" name="to" value={range.to} /></>}
        <label className="grid gap-1 text-sm" htmlFor="wallet-min-amount">최소 순변동 금액 (WLD, 절댓값)
          <input id="wallet-min-amount" name="minAmount" type="text" inputMode="numeric" pattern="[1-9][0-9]{0,29}" maxLength={30} defaultValue={minAmount ?? ''} className="rounded-md border bg-background px-3 py-2" />
        </label>
        <Button type="submit" variant="secondary">금액 적용</Button>
        <Button asChild variant="outline"><Link href={activityPeriodUrl(period, direction, range)}>금액 지우기</Link></Button>
      </form>
      {amountError && <p role="alert" className="text-sm text-destructive">{amountError}</p>}
      {minAmount && <p className="text-sm text-muted-foreground">순변동 절댓값 {minAmount} WLD 이상만 표시합니다. 현금↔은행 이동의 순변동 0은 제외됩니다.</p>}
      {range && <p className="text-sm text-muted-foreground">선택한 한국 시간 날짜: {range.from} ~ {range.to} (양 끝 날짜 포함)</p>}
      {rangeError && <p role="alert" className="text-sm text-destructive">{rangeError}</p>}
      <p className="text-sm text-muted-foreground">확정된 본인 원장 기록을 한 번에 최대 50건씩 표시합니다. 입출금은 내 현금·은행 계정의 합계 순변동 기준이며, 계정 간 이동은 순변동 없음에 표시됩니다. 필터는 서버에서 이전 기록까지 적용됩니다.</p>
      {history?.hasMore && <p role="status" className="text-sm text-muted-foreground">이전 기록이 더 있습니다.</p>}
      {cursor && <Button asChild variant="outline" size="sm" className="w-fit"><Link href={activityPeriodUrl(period, direction, range, minAmount)}>처음부터 다시 보기</Link></Button>}
      <Card>
        <CardContent>
          {rangeError || amountError ? (
            <EmptyState title="검색 조건을 다시 확인해 주세요." />
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
          <Link href={activityCursorUrl(period, history.nextCursor, direction, range, minAmount)}>이전 기록 50건 보기</Link>
        </Button>
      )}
      {history && <p className="text-xs text-muted-foreground">조회 기준: {formatMoment(history.asOf)} · 이전 페이지로 이동하면 현재 50건을 대체합니다. 전체 기록을 내려받은 것은 아닙니다.</p>}
    </div>
  );
}
