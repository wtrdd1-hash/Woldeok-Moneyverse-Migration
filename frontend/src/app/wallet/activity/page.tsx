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
import { ACTIVITY_CATEGORIES, activityCategory, activityCategoryHref } from './category';

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
}: { searchParams: Promise<{ category?: string | string[] }> }) {
  await requireMember();
  const category = activityCategory((await searchParams).category);
  // 50 is the API's ceiling for this list, so this page shows everything it
  // will give rather than a page size chosen here.
  const wallet = await apiOrNull<Overview>(
    `/api/v1/wallet?recent=50${category === 'all' ? '' : `&category=${category}`}`,
  );

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

      <nav aria-label="최근 거래 종류 필터" className="flex flex-wrap gap-2">
        {ACTIVITY_CATEGORIES.map((item) => (
          <Button key={item.value} asChild size="sm" variant={category === item.value ? 'default' : 'outline'}>
            <Link href={activityCategoryHref(item.value)} aria-current={category === item.value ? 'page' : undefined}>
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <p className="text-xs text-muted-foreground">
        최근 최대 50건의 거래만 분류합니다. 전체 거래내역이나 기간별 합계가 아닙니다.
      </p>

      <Card>
        <CardContent>
          {!wallet ? (
            <EmptyState title="지금은 기록을 불러올 수 없어요." />
          ) : wallet.recentTransactions.length === 0 ? (
            <EmptyState
              title={category === 'all' ? '아직 기록된 활동이 없어요.' : '선택한 종류의 최근 거래가 없어요.'}
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
