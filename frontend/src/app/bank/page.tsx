import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CreditCard,
  Landmark,
  PiggyBank,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { LiveRefresh } from '@/components/live-refresh';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale';
import { groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import {
  CompoundInterestCard,
  DepositWithdrawCard,
  SmartLoanCard,
  VirtualBondsCard,
} from './bank-forms';
import type { BankStanding } from './types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 은행 & 핀테크 포털',
  description: '월덕 머니버스 복리 예금, 스마트 신용 대출, 가상 국채 투자 서비스',
  robots: { index: false, follow: false },
};

export default async function BankPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const standing = await apiOrNull<BankStanding>('/api/v1/banking/standing');

  if (!standing) {
    return (
      <div className="grid gap-4">
        <PageHeader title={<T korean="가상 은행 (월덕 파이낸스)" english="Virtual Banking" />} />
        <EmptyState
          title={<T korean="지금은 은행 서비스를 불러올 수 없어요." english="Cannot load banking services right now." />}
          description={<T korean="잠시 후 다시 접속해 주세요." english="Please try again in a few moments." />}
        />
      </div>
    );
  }

  const cash = Number(standing.cash_balance) || 0;
  const bank = Number(standing.bank_balance) || 0;
  const unclaimed = Number(standing.unclaimed_interest) || 0;
  const creditLimit = Number(standing.credit_limit) || 5000;
  const activeLoan = standing.active_loan;
  const bonds = standing.bonds ?? [];

  const bondTotalPrincipal = bonds.reduce((acc, b) => acc + (Number(b.principal_amount) || 0), 0);
  const loanDebt = activeLoan ? Number(activeLoan.outstanding_amount) || 0 : 0;
  const netFinancialWorth = cash + bank + bondTotalPrincipal - loanDebt;

  return (
    <div className="grid gap-6">
      <LiveRefresh />

      {/* Page Header */}
      <PageHeader title={<T korean="가상 은행 (월덕 파이낸스)" english="Virtual Bank & Finance" />}>
        <T
          korean="일일 0.05% (연 약 20%) 복리 예금, 직업·사업 연동 무담보 신용 대출, 최대 15% 확정 수익 가상 국채"
          english="0.05% daily compound deposit, dynamic credit loans, and up to 15% fixed yield sovereign bonds."
        />
      </PageHeader>

      {/* Hero Financial Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-muted/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                <T korean="순 금융 자산" english="Net Financial Assets" />
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold tabular">
              <Amount value={String(netFinancialWorth)} currency />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <T korean="현금+예금+국채-대출" english="Cash + Savings + Bonds - Debt" />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-blue-500/10 via-background to-muted/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                <T korean="복리 예금 잔액" english="Compound Savings" />
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <PiggyBank className="size-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-blue-600 dark:text-blue-400 tabular">
              <Amount value={String(bank)} currency />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <T korean="일일 0.05% 복리 적립" english="0.05% daily compound interest" />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-muted/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                <T korean="정산 대기 복리 이자" english="Accrued Interest" />
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Sparkles className="size-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular">
              +{groupDigits(String(unclaimed))} <span className="text-xs font-normal">WLD</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <T korean="온디맨드 즉시 정산 가능" english="Instant on-demand claim" />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-purple-500/10 via-background to-muted/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                <T korean="평가 신용 한도" english="Credit Limit" />
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <CreditCard className="size-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-purple-600 dark:text-purple-400 tabular">
              <Amount value={String(creditLimit)} currency />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeLoan
                ? isEn
                  ? `Active Loan (${groupDigits(String(loanDebt))} WLD)`
                  : `대출 실행 중 (${groupDigits(String(loanDebt))} WLD)`
                : isEn
                ? 'Instant Loan Available'
                : '즉시 대출 가능'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Banking Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Savings & Compound Interest */}
        <div className="grid gap-6">
          <DepositWithdrawCard cashBalance={cash} bankBalance={bank} />
          <CompoundInterestCard
            bankBalance={bank}
            unclaimedInterest={unclaimed}
            dailyRatePct={standing.daily_interest_rate_pct}
            annualYieldPct={standing.annual_yield_pct}
          />
        </div>

        {/* Right Column: Smart Dynamic Loans & Virtual Bonds */}
        <div className="grid gap-6">
          <SmartLoanCard creditLimit={creditLimit} activeLoan={activeLoan} cashBalance={cash} />
          <VirtualBondsCard bonds={bonds} cashBalance={cash} />
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <Landmark className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            <T
              korean="연계 금융 서비스: 현금 지갑 관리와 주식 투자, 사업체 확장을 함께 활용해 보세요."
              english="Integrated Financial Services: Manage your cash wallet, stock investments, and business ventures together."
            />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/wallet">
              <T korean="내 지갑 가기" english="Go to Wallet" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/stocks">
              <T korean="가상 주식 거래소" english="Virtual Stock Exchange" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/businesses">
              <T korean="사업 관리" english="Business Ventures" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
