import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { LiveRefresh } from '@/components/live-refresh';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { PostingStrip } from '@/components/posting-strip';
import { TruncatedList } from '@/components/truncated-list';
import { TranslatedText as T } from '@/components/translated-text';
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

export const dynamic = 'force-dynamic';

const LATEST_ON_WALLET = 5;

export const metadata: Metadata = {
  title: '내 지갑',
  robots: { index: false, follow: false },
};

export default async function WalletPage() {
  await requireMember();

  const [wallet, loanData, rewardAvailability] = await Promise.all([
    apiOrNull<Overview>('/api/v1/wallet?recent=50'),
    apiOrNull<{ loans: LoanView[] }>('/api/v1/bank/loans'),
    apiOrNull<RewardAvailability>('/api/v1/rewards/availability'),
  ]);

  if (!wallet) {
    return (
      <div className="grid gap-4">
        <PageHeader title={<T korean="내 지갑" english="My Wallet" />} />
        <EmptyState
          title={<T korean="지금은 지갑을 불러올 수 없어요." english="Cannot load wallet at this time." />}
          description={<T korean="잠시 후 다시 확인해 주세요." english="Please try again in a few moments." />}
        />
      </div>
    );
  }

  const { balances, recentTransactions, userId } = wallet;
  const loans = loanData?.loans ?? [];

  return (
    <div className="grid gap-6">
      <LiveRefresh />
      <PageHeader title={<T korean="내 지갑" english="My Wallet" />}>
        <T
          korean="WLD는 게임 안에서만 사용하는 가상 데이터입니다. 실제 화폐가 아닙니다."
          english="WLD is virtual game currency used only inside the community economy. It is not real money."
        />
      </PageHeader>

      <Alert>
        <AlertTitle>
          <T korean="경제 원장 기준" english="Ledger-backed Balance" />
        </AlertTitle>
        <AlertDescription>
          <T
            korean="잔액과 최근 내역은 내 지갑의 기록을 기준으로 표시됩니다."
            english="Balances and transaction history are verified against the real-time community ledger."
          />
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardDescription>
            <T korean="보유" english="Total" /> {balances.currency}
          </CardDescription>
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
              term={<T korean="활동 지갑" english="Active Cash" />}
              detail={<T korean="송금과 구매에 바로 쓰이는 잔액" english="Balance ready for transfers and shop purchases" />}
              amount={balances.cash.availableAmount}
            />
            <Pocket
              term={<T korean="보관함" english="Bank Vault" />}
              detail={<T korean="은행에 넣어 둔 잔액" english="Safe savings deposited in the bank vault" />}
              amount={balances.bank.availableAmount}
            />
          </dl>
          <RewardButtons availability={rewardAvailability} />
        </CardContent>
      </Card>

      <BankPanel />

      <Card>
        <CardHeader>
          <CardTitle>
            <T korean="내 대출" english="My Loans" />
          </CardTitle>
          <CardDescription>
            {loanData === null ? (
              <T korean="대출 정보를 확인할 수 없어요." english="Unable to retrieve loan information." />
            ) : (
              <T korean="원금과 이자를 합한 금액을 상환합니다." english="Repay the principal amount plus 5% fixed interest." />
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <EmptyState title={<T korean="진행 중인 대출이 없어요." english="No active loans." />} />
          ) : (
            <LoanList loans={loans} />
          )}
        </CardContent>
      </Card>

      <TransferForm currency={balances.currency} />

      <section aria-labelledby="activity-title" className="grid gap-3">
        <SectionHeader
          eyebrow="RECENT ACTIVITY"
          title={<T korean="내 지갑 기록" english="Transaction History" />}
          id="activity-title"
          action={
            <Link href="/wallet/activity" className="shrink-0 text-sm font-extrabold text-clay-ink">
              <T korean="전체 보기 →" english="View All →" />
            </Link>
          }
        />
        <Card>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <EmptyState
                title={<T korean="아직 기록된 활동이 없어요." english="No activity recorded yet." />}
                description={<T korean="보상을 받거나 WLD를 보내면 실제 원장 기록이 여기에 표시됩니다." english="When you claim rewards or transfer WLD, entries appear here." />}
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
            <CardDescription>
              <T korean="내 머니버스 ID" english="My Moneyverse ID" />
            </CardDescription>
            <CardTitle className="text-base">
              <T korean="지갑 식별 정보" english="Wallet Identity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyverseId userId={userId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>
              <T korean="지갑 안내" english="Wallet Guide" />
            </CardDescription>
            <CardTitle className="text-base">
              <T korean="안전하게 사용하기" english="Safe Usage" />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Guide
              title={<T korean="송금 전 확인" english="Verify Before Sending" />}
              detail={<T korean="받는 사람의 ID와 금액을 확인해 주세요." english="Double-check the recipient ID and transfer amount." />}
            />
            <Guide
              title={<T korean="원장 기록" english="Ledger History" />}
              detail={<T korean="모든 변동은 내 지갑 기록에서 확인할 수 있어요." english="Every balance change is permanently verified." />}
            />
            <Guide
              title={<T korean="이용 기준" english="Terms of Use" />}
              detail={<T korean="WLD는 현금이나 환전 수단이 아닙니다." english="WLD cannot be exchanged for cash or real currency." />}
            />
            <Button asChild variant="ghost" className="w-fit">
              <Link href="/terms">
                <T korean="이용 기준 보기 →" english="View Terms →" />
              </Link>
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
  readonly term: React.ReactNode;
  readonly detail: React.ReactNode;
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

function Guide({ title, detail }: { readonly title: React.ReactNode; readonly detail: React.ReactNode }) {
  return (
    <p className="text-sm">
      <b className="font-medium">{title}</b>
      <span className="block text-xs text-muted-foreground">{detail}</span>
    </p>
  );
}