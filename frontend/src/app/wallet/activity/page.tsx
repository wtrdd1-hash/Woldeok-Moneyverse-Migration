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
import { sides } from '../sides';
import type { WalletHistoryPage } from './types';
import { activityPeriod, activityPeriodUrl, activityCursorUrl, activityDirection } from './period';

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
  searchParams?: Promise<{ period?: string; cursor?: string; direction?: string }>;
}) {
  await requireMember();
  const params = await searchParams;
  const period = activityPeriod(params?.period);
  const direction = activityDirection(params?.direction);
  // The API verifies the opaque cursor against the current owner and session.
  const cursor = typeof params?.cursor === 'string' && params.cursor.length <= 2048 ? params.cursor : undefined;
  const history = await apiOrNull<WalletHistoryPage>(`/api/v1/wallet/activity?period=${period}&direction=${direction}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);


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
          <Button key={value} asChild variant={period === value ? 'default' : 'outline'} size="sm">
            <Link href={activityPeriodUrl(value, direction)} aria-current={period === value ? 'page' : undefined}>
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
            <Link href={activityPeriodUrl(period, value)} aria-current={direction === value ? 'page' : undefined}>{label}</Link>
          </Button>
        ))}
      </nav>
      <p className="text-sm text-muted-foreground">확정된 본인 원장 기록을 한 번에 최대 50건씩 표시합니다. 입출금은 내 현금·은행 계정의 합계 순변동 기준이며, 계정 간 이동은 순변동 없음에 표시됩니다. 필터는 서버에서 이전 기록까지 적용됩니다.</p>
      {history?.hasMore && <p role="status" className="text-sm text-muted-foreground">이전 기록이 더 있습니다.</p>}
      {cursor && <Button asChild variant="outline" size="sm" className="w-fit"><Link href={activityPeriodUrl(period, direction)}>처음부터 다시 보기</Link></Button>}
      <Card>
        <CardContent>
          {!history ? (
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
                <PostingStrip
                  key={entry.transactionId}
                  debit={debit}
                  credit={credit}
                  amount={entry.netAmount}
                  label={entry.label}
                  at={formatMoment(entry.occurredAt)}
                />
              );
            })
          )}
        </CardContent>
      </Card>
      {history?.hasMore && history.nextCursor && (
        <Button asChild variant="outline" className="w-fit">
          <Link href={activityCursorUrl(period, history.nextCursor, direction)}>이전 기록 50건 보기</Link>
        </Button>
      )}
      {history && <p className="text-xs text-muted-foreground">조회 기준: {formatMoment(history.asOf)} · 이전 페이지로 이동하면 현재 50건을 대체합니다. 전체 기록을 내려받은 것은 아닙니다.</p>}
    </div>
  );
}
