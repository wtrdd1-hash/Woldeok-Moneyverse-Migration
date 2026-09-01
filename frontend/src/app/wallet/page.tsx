import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { LiveRefresh } from '@/components/live-refresh';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { PostingStrip } from '@/components/posting-strip';
import { TruncatedList } from '@/components/truncated-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { sides } from './sides';
import type { Overview } from './sides';
import {
  BankPanel,
  RewardButtons,
  LoanList,
  MoneyverseId,
  TransferForm,
} from './wallet-forms';
import type { LoanView } from './wallet-forms';
import type { RewardAvailability } from './wallet-forms';

/** Per-member data. Never cached, and never offered to a crawler. */
export const dynamic = 'force-dynamic';

/**
 * How many ledger entries stay on the wallet screen. Enough to answer "did
 * that go through?", short enough that the balance and the transfer form stay
 * on the first screen.
 *
 * The rest of what the API sends is no longer a page away: it is behind the
 * 더보기 control under the list. /wallet/activity is still a real URL and
 * still linked, because a bookmark, a shared link and a reload are things a
 * dialog cannot be — but answering "what else happened" should not cost a
 * navigation and a navigation back.
 */
const LATEST_ON_WALLET = 5;

export const metadata: Metadata = {
  title: '내 지갑',
  robots: { index: false, follow: false },
};

export default async function WalletPage() {
  await requireMember();

  const [wallet, loanData, rewardAvailability] = await Promise.all([
    // 50 is the API's ceiling for this list and what /wallet/activity asks
    // for. The screen still shows five; the other forty-five are what the
    // 더보기 dialog opens onto, so opening it asks the server nothing. The
    // default of ten would have made "the rest" mean five more.
    apiOrNull<Overview>('/api/v1/wallet?recent=50'),
    apiOrNull<{ loans: LoanView[] }>('/api/v1/bank/loans'),
    apiOrNull<RewardAvailability>('/api/v1/rewards/availability'),
  ]);

  if (!wallet) {
    return (
      <div className="grid gap-4">
        <PageHeader title="내 지갑" />
        <EmptyState
          title="지금은 지갑을 불러올 수 없어요."
          description="잔액을 추정해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
        />
      </div>
    );
  }

  const { balances, recentTransactions, userId } = wallet;
  const loans = loanData?.loans ?? [];

  return (
    <div className="grid gap-6">
      {/* Balances move without the reader doing anything — a sale settles,
          interest accrues, somebody sends WLD — so the page asks again rather
          than showing what was true when it loaded. */}
      <LiveRefresh />
      <PageHeader title="내 지갑">
        WLD는 게임 안에서만 사용하는 가상 데이터입니다. 실제 화폐가 아닙니다.
      </PageHeader>

      <Alert>
        <AlertTitle>경제 원장 기준</AlertTitle>
        <AlertDescription>
          잔액과 최근 내역은 내 지갑의 기록을 기준으로 표시됩니다.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardDescription>보유 {balances.currency}</CardDescription>
          <CardTitle className="text-3xl">
            <Amount value={balances.totalAvailableAmount} />{' '}
            <span className="text-base font-normal text-muted-foreground">
              {balances.currency}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Pocket
              term="활동 지갑"
              detail="송금과 구매에 바로 쓰이는 잔액"
              amount={balances.cash.availableAmount}
            />
            <Pocket
              term="보관함"
              detail="은행에 넣어 둔 잔액"
              amount={balances.bank.availableAmount}
            />
          </dl>
          <RewardButtons availability={rewardAvailability} />
        </CardContent>
      </Card>

      <BankPanel />

      <Card>
        <CardHeader>
          <CardTitle>내 대출</CardTitle>
          <CardDescription>
            {loanData === null
              ? '대출 정보를 확인할 수 없어요.'
              : '원금과 이자를 합한 금액을 상환합니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <EmptyState title="진행 중인 대출이 없어요." />
          ) : (
            <LoanList loans={loans} />
          )}
        </CardContent>
      </Card>

      <TransferForm currency={balances.currency} />

      <section aria-labelledby="activity-title" className="grid gap-3">
        <SectionHeader
          eyebrow="RECENT ACTIVITY"
          title="내 지갑 기록"
          id="activity-title"
          action={
            <Link href="/wallet/activity" className="shrink-0 text-sm font-extrabold text-clay-ink">
              전체 보기 →
            </Link>
          }
        />
        {/* The transaction list is the ledger, so it renders as postings
            rather than as rows with badges: each entry shows what the money
            left, what it reached, and the amount that balanced them. */}
        <Card>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <EmptyState
                title="아직 기록된 활동이 없어요."
                description="보상을 받거나 WLD를 보내면 실제 원장 기록이 여기에 표시됩니다."
              />
            ) : (
              <TruncatedList
                title="내 지갑 기록"
                visibleCount={LATEST_ON_WALLET}
                rows={recentTransactions.map((entry) => {
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
                })}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>내 머니버스 ID</CardDescription>
            <CardTitle className="text-base">지갑 식별 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyverseId userId={userId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>지갑 안내</CardDescription>
            <CardTitle className="text-base">안전하게 사용하기</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Guide title="송금 전 확인" detail="받는 사람의 ID와 금액을 확인해 주세요." />
            <Guide title="원장 기록" detail="모든 변동은 내 지갑 기록에서 확인할 수 있어요." />
            <Guide title="이용 기준" detail="WLD는 현금이나 환전 수단이 아닙니다." />
            <Button asChild variant="ghost" className="w-fit">
              <Link href="/terms">이용 기준 보기 →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Pocket({
  term,
  detail,
  amount,
}: {
  readonly term: string;
  readonly detail: string;
  readonly amount: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="text-xl font-medium">
        <Amount value={amount} />
      </dd>
      <dd className="text-xs text-muted-foreground">{detail}</dd>
    </div>
  );
}

function Guide({ title, detail }: { readonly title: string; readonly detail: string }) {
  return (
    <p className="text-sm">
      <b className="font-medium">{title}</b>
      <span className="block text-xs text-muted-foreground">{detail}</span>
    </p>
  );
}
