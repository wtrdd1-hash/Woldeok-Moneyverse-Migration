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
import { walletPeriodFromSearchParam, walletPeriodHref } from './period-filter';

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
}: { searchParams?: Promise<{ period?: string | string[] }> }) {
  await requireMember();
  const period = walletPeriodFromSearchParam((await searchParams)?.period);
  // 50 is the API's ceiling for this list, so this page shows everything it
  // will give rather than a page size chosen here.
  const wallet = await apiOrNull<Overview>(`/api/v1/wallet?recent=50${period ? `&period=${period}` : ''}`);

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

      <nav aria-label="거래 기간 선택" className="flex flex-wrap gap-2">
        {([
          { value: null, label: '전체 (최근 50건)' },
          { value: '7d', label: '최근 7일' },
          { value: '30d', label: '최근 30일' },
          { value: '90d', label: '최근 90일' },
        ] as const).map((option) => (
          <Link
            key={option.value ?? 'all'}
            href={walletPeriodHref(option.value)}
            aria-current={period === option.value ? 'page' : undefined}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-semibold"
          >
            {option.label}
          </Link>
        ))}
      </nav>
      <p className="text-sm text-muted-foreground">
        {period ? '선택한 기간의 거래 중 최신 최대 50건을 표시합니다.' : '최근 거래 최대 50건을 표시합니다.'}
      </p>
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
