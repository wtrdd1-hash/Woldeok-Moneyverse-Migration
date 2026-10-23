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
import { walletCategoryApiPath, walletCategoryFromQuery } from './category-filter';

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
}: { readonly searchParams: Promise<{ category?: string | string[] }> }) {
  await requireMember();
  const category = walletCategoryFromQuery((await searchParams).category);
  // 50 is the API's ceiling for this list, so this page shows everything it
  // will give rather than a page size chosen here.
  const wallet = await apiOrNull<Overview>(walletCategoryApiPath(category));

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
        <CardContent>
          <form method="get" action="/wallet/activity" className="mb-5 flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="wallet-activity-category" className="text-sm font-medium">거래 종류</label>
              <select
                id="wallet-activity-category"
                name="category"
                defaultValue={category}
                className="min-h-11 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">전체 거래</option>
                <option value="transfer">송금·계정 통합</option>
                <option value="bank">은행 입출금·대출·이자</option>
                <option value="reward">보상·지급</option>
              </select>
            </div>
            <Button type="submit" variant="outline" className="min-h-11">조회</Button>
          </form>
          {!wallet ? (
            <EmptyState title="지금은 기록을 불러올 수 없어요." />
          ) : wallet.recentTransactions.length === 0 ? (
            <EmptyState
              title={category ? "선택한 종류의 최근 거래가 없어요." : "아직 기록된 활동이 없어요."}
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
