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
export default async function WalletActivityPage() {
  await requireMember();
  // 50 is the API's ceiling for this list, so this page shows everything it
  // will give rather than a page size chosen here.
  const wallet = await apiOrNull<Overview>('/api/v1/wallet?recent=50');

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

      <Card>
        <CardContent className="grid gap-3 py-4">
          <h2 className="font-semibold">이전 거래 참조번호로 조회</h2>
          <p className="text-sm text-muted-foreground">최근 50건보다 오래된 거래도 원장 참조번호로 본인 기록을 확인할 수 있습니다.</p>
          <form action="/wallet/activity/lookup" method="get" className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="wallet-transaction-reference" className="sr-only">거래 참조번호(UUID)</label>
            <input id="wallet-transaction-reference" name="transactionId" type="text" required maxLength={36}
              pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
              placeholder="거래 참조번호(UUID)" autoComplete="off"
              className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
            <Button type="submit">거래 확인</Button>
          </form>
        </CardContent>
      </Card>

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
                <Link key={entry.transactionId} href={`/wallet/activity/${encodeURIComponent(entry.transactionId)}`}
                  className="block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label={`${entry.label} 거래 참조번호 확인`}>
                  <PostingStrip
                    debit={debit}
                    credit={credit}
                    amount={entry.netAmount}
                    label={entry.label}
                    at={formatMoment(entry.occurredAt)}
                  />
                  <span className="block px-3 pb-2 text-xs text-muted-foreground">거래 확인 →</span>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
