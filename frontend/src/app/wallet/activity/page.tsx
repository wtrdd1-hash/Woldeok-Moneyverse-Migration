import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { pocketHistoryHref, selectedPocket, selectedPocketDelta } from '../pocket-history';
import type { Overview, TransactionView } from '../sides';

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
  readonly searchParams: Promise<{ pocket?: string | string[] }>;
}) {
  await requireMember();
  const pocket = selectedPocket((await searchParams).pocket);
  if (!pocket) notFound();
  // Each pocket is filtered in PostgreSQL BEFORE its independent 50-row cap.
  // The all-pocket view intentionally retains the original wallet overview.
  const transactions = pocket === 'all'
    ? (await apiOrNull<Overview>('/api/v1/wallet?recent=50'))?.recentTransactions
    : (await apiOrNull<{ transactions: TransactionView[] }>(
      `/api/v1/wallet/transactions?pocket=${pocket}&recent=50`,
    ))?.transactions;

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

      <nav aria-label="거래 지갑 선택" className="flex flex-wrap gap-2">
        {([
          ['all', '전체 거래'],
          ['cash', '활동 지갑'],
          ['bank', '은행 보관함'],
        ] as const).map(([key, label]) => (
          <Button key={key} asChild variant={pocket === key ? 'default' : 'outline'} size="sm">
            <Link href={pocketHistoryHref(key)} aria-current={pocket === key ? 'page' : undefined}>
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      <p className="text-xs text-muted-foreground">
        {pocket === 'all'
          ? '전체 지갑의 최근 거래 최대 50건입니다. 전체 기간 거래내역은 아닙니다.'
          : `${pocket === 'cash' ? '활동 지갑' : '은행 보관함'}에서 실제 금액이 변동된 최근 거래 최대 50건입니다. 내부 이동은 두 지갑에 모두 표시됩니다.`}
      </p>

      <Card>
        <CardContent>
          {!transactions ? (
            <EmptyState title="지금은 기록을 불러올 수 없어요." />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="아직 기록된 활동이 없어요."
              description="보상을 받거나 WLD를 보내면 실제 원장 기록이 여기에 표시됩니다."
            />
          ) : (
            transactions.map((entry) => {
              const { debit, credit } = sides(entry);
              const amount = selectedPocketDelta(entry, pocket);
              if (amount === null) {
                return <EmptyState key={entry.transactionId} title="거래 금액을 검증할 수 없어요." />;
              }
              return (
                <PostingStrip
                  key={entry.transactionId}
                  debit={debit}
                  credit={credit}
                  amount={amount}
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
