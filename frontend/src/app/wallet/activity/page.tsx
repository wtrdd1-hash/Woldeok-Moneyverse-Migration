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
import { directionFromSearch } from './direction';
import type { WalletDirection } from './direction';
import { walletCategoryFromQuery } from './category-filter';
import { walletPeriodFromSearchParam } from './period-filter';
import { walletActivityApiPath, walletActivityPageHref } from './wallet-filters';

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
}: { readonly searchParams?: Promise<{ direction?: string | string[]; category?: string | string[]; period?: string | string[] }> }) {
  await requireMember();
  const raw = (await searchParams) ?? {};
  const direction = directionFromSearch(raw.direction);
  const category = walletCategoryFromQuery(raw.category);
  const period = walletPeriodFromSearchParam(raw.period);
  const filters = { direction, category, period };
  // Filters are applied by the owner-scoped SQL query before the latest-50 cap.
  const wallet = await apiOrNull<Overview>(walletActivityApiPath(filters));

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

      <nav aria-label="거래 방향 필터" className="flex flex-wrap gap-2">
        {([
          [undefined, '전체'],
          ['in', '들어온 WLD'],
          ['out', '나간 WLD'],
          ['neutral', '순변동 0'],
        ] as const satisfies readonly (readonly [WalletDirection | undefined, string])[]).map(([value, label]) => (
          <Button key={value ?? 'all'} asChild variant={direction === value ? 'default' : 'outline'} size="sm">
            <Link href={walletActivityPageHref({ ...filters, direction: value })} aria-current={direction === value ? 'page' : undefined}>
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      <nav aria-label="거래 기간 선택" className="flex flex-wrap gap-2">
        {([
          { value: null, label: '전체 기간' },
          { value: '7d', label: '최근 7일' },
          { value: '30d', label: '최근 30일' },
          { value: '90d', label: '최근 90일' },
        ] as const).map(({ value, label }) => (
          <Link
            key={value ?? 'all'}
            href={walletActivityPageHref({ ...filters, period: value })}
            aria-current={period === value ? 'page' : undefined}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-semibold"
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-muted-foreground">
        선택한 조건의 최근 기록 최대 50건만 표시합니다. 전체 거래내역을 모두 표시하는 것은 아닙니다.
      </p>
      <Card>
        <CardContent>
          <form method="get" action="/wallet/activity" className="mb-5 flex flex-wrap items-end gap-3">
            {direction && <input type="hidden" name="direction" value={direction} />}
            {period && <input type="hidden" name="period" value={period} />}
            <div className="grid gap-1.5">
              <label htmlFor="wallet-activity-category" className="text-sm font-medium">거래 종류</label>
              <select id="wallet-activity-category" name="category" defaultValue={category}
                className="min-h-11 rounded-md border border-border bg-background px-3 text-sm">
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
              title={direction || category || period ? '선택한 조건의 기록이 없어요.' : '아직 기록된 활동이 없어요.'}
              description={direction || category || period ? '다른 필터를 선택해 확인해 보세요.' : '보상을 받거나 WLD를 보내면 실제 원장 기록이 여기에 표시됩니다.'}
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
