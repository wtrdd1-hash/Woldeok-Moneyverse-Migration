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
import type { Overview } from '../sides';
import { activityPeriod, activityPeriodUrl, activityCompletenessNotice } from './period';

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
  searchParams?: Promise<{ period?: string }>;
}) {
  await requireMember();
  const period = activityPeriod((await searchParams)?.period);
  // Filtering happens in PostgreSQL before the 50-entry cap, never on a
  // truncated client-side list. The default remains the existing 50 entries.
  const wallet = await apiOrNull<Overview>(`/api/v1/wallet?recent=50${period === 'all' ? '' : `&period=${period}`}`);

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
          ['all', '최근 50건'],
          ['7d', '최근 7일'],
          ['30d', '최근 30일'],
        ] as const).map(([value, label]) => (
          <Button key={value} asChild variant={period === value ? 'default' : 'outline'} size="sm">
            <Link href={activityPeriodUrl(value)} aria-current={period === value ? 'page' : undefined}>
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      <p className="text-sm text-muted-foreground">최대 50건의 확정된 원장 기록을 표시합니다. 기간 필터는 서버에서 적용됩니다.</p>
      {wallet && activityCompletenessNotice(wallet.recentTransactionsHasMore) && (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-300">
          {activityCompletenessNotice(wallet.recentTransactionsHasMore)}
        </p>
      )}
      <Card>
        <CardContent>
          {!wallet ? (
            <EmptyState title="지금은 기록을 불러올 수 없어요." />
          ) : wallet.recentTransactions.length === 0 ? (
            <EmptyState
              title="아직 기록된 활동이 없어요."
              description="보상을 받거나 WLD를 보내면 실제 원장 기록이 여기에 표시됩니다."
            />
          ) : (
            wallet.recentTransactions.map((entry) => {
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
    </div>
  );
}
