import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CreditCard,
  Landmark,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { LiveRefresh } from '@/components/live-refresh';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { compareAmounts, groupDigits } from '@/lib/money';
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
  title: '가상 은행 & 금융 학습',
  description: '게임 전용 WLD 예금, 가상 신용, 상환, 가상 채권을 관리하는 월덕 머니버스 금융 학습 화면',
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

  const cash = standing.cash_balance;
  const bank = standing.bank_balance;
  const unclaimed = standing.unclaimed_interest;
  const creditLimit = standing.credit_limit;
  const activeLoan = standing.active_loan;
  const bonds = standing.bonds ?? [];

  const bondTotalPrincipal = bonds.reduce((acc, bond) => acc + BigInt(bond.principal_amount), 0n);
  const loanDebt = activeLoan ? BigInt(activeLoan.outstanding_amount) : 0n;
  const netFinancialWorth = (BigInt(cash) + BigInt(bank) + bondTotalPrincipal - loanDebt).toString();
  const minimumRepayment = activeLoan?.minimum_repayment ?? standing.loan_minimum_repayment;
  const canCoverMinimumRepayment = activeLoan ? compareAmounts(cash, minimumRepayment) >= 0 : true;
  const maturityLabel = activeLoan?.maturity_at
    ? new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(activeLoan.maturity_at))
    : null;

  return (
    <div className="grid gap-6">
      <LiveRefresh />

      <PageHeader title={<T korean="가상 은행 (월덕 파이낸스)" english="Virtual Bank & Finance" />}>
        <T
          korean="WLD 예금, 가상 신용·상환, 가상 채권을 한곳에서 관리하는 게임 경제 학습 화면입니다."
          english="Manage game-only WLD savings, virtual credit and repayment, and virtual bonds in one financial-learning surface."
        />
      </PageHeader>

      <Card className="border-sky-500/30 bg-sky-500/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <ShieldCheck className="size-5" />
            </div>
            <div className="grid gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold">
                  <T korean="게임 전용 금융 서비스" english="Game-only financial service" />
                </p>
                <Badge variant="outline">WLD · virtual / simulated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <T
                  korean="이 화면의 예금, 신용등급, 대출, 이자와 채권은 실제 은행·예금·신용평가·대출·증권 또는 투자상품이 아니며 현금 환전을 약속하지 않습니다."
                  english="Savings, credit grades, loans, interest and bonds here are virtual game mechanics, not real banking, deposits, credit reporting, lending, securities or investment products, and they do not promise cash redemption."
                />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
              <Amount value={netFinancialWorth} currency />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <T korean="현금+예금+가상 채권-가상 대출" english="Cash + Savings + Virtual Bonds - Virtual Debt" />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-blue-500/10 via-background to-muted/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                <T korean="게임 예금 잔액" english="Game Savings" />
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <PiggyBank className="size-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-blue-600 dark:text-blue-400 tabular">
              <Amount value={bank} currency />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <T korean={`현재 게임 이자율 일일 ${standing.daily_interest_rate_pct}%`} english={`Current game rate ${standing.daily_interest_rate_pct}% daily`} />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-muted/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                <T korean="정산 대기 게임 이자" english="Accrued Game Interest" />
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Sparkles className="size-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular">
              +{groupDigits(unclaimed)} <span className="text-xs font-normal">WLD</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <T korean="서버 기준 정산 가능 금액" english="Server-calculated claimable amount" />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-purple-500/10 via-background to-muted/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                <T korean="게임 신용 한도" english="Game Credit Limit" />
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <CreditCard className="size-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-purple-600 dark:text-purple-400 tabular">
              <Amount value={creditLimit} currency />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeLoan
                ? isEn
                  ? `Virtual debt outstanding (${groupDigits(loanDebt.toString())} WLD)`
                  : `가상 대출 잔액 (${groupDigits(loanDebt.toString())} WLD)`
                : isEn
                  ? 'No active virtual loan'
                  : '실행 중인 가상 대출 없음'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={activeLoan ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid gap-1">
            <p className="text-sm font-bold">
              <T korean="지금의 안전한 다음 행동" english="Recommended safe next action" />
            </p>
            {activeLoan ? (
              <p className="text-sm text-muted-foreground">
                {isEn
                  ? canCoverMinimumRepayment
                    ? `You have enough spendable cash for the current minimum repayment of ${groupDigits(minimumRepayment)} WLD. Review the repayment amount before taking on more virtual credit.${maturityLabel ? ` Maturity: ${maturityLabel}.` : ''}`
                    : `Your spendable cash is below the current minimum repayment of ${groupDigits(minimumRepayment)} WLD. Prioritize repayment planning before taking on more virtual credit.${maturityLabel ? ` Maturity: ${maturityLabel}.` : ''}`
                  : canCoverMinimumRepayment
                    ? `현재 사용 가능한 현금으로 최소 상환액 ${groupDigits(minimumRepayment)} WLD를 충당할 수 있습니다. 추가 가상 신용보다 상환 금액을 먼저 확인하세요.${maturityLabel ? ` 만기: ${maturityLabel}.` : ''}`
                    : `현재 사용 가능한 현금이 최소 상환액 ${groupDigits(minimumRepayment)} WLD보다 적습니다. 추가 가상 신용보다 상환 계획을 우선하세요.${maturityLabel ? ` 만기: ${maturityLabel}.` : ''}`}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <T
                  korean="실행 중인 가상 대출이 없습니다. 새 신용을 사용하기 전에 상환 총액과 현재 현금·예금 여유를 함께 확인하세요."
                  english="You have no active virtual loan. Before using new credit, compare the total repayment with your available cash and savings buffer."
                />
              </p>
            )}
          </div>
          <Button asChild variant={activeLoan ? 'default' : 'outline'} size="sm">
            <Link href={activeLoan ? '#bank-credit' : '/wallet'}>
              <T korean={activeLoan ? '상환 영역 보기' : '지갑 확인'} english={activeLoan ? 'Review repayment' : 'Review wallet'} />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="grid gap-6">
          <DepositWithdrawCard cashBalance={cash} bankBalance={bank} dailyRatePct={standing.daily_interest_rate_pct} />
          <CompoundInterestCard
            bankBalance={bank}
            unclaimedInterest={unclaimed}
            dailyRatePct={standing.daily_interest_rate_pct}
            annualYieldPct={standing.annual_yield_pct}
          />
        </div>

        <div id="bank-credit" className="grid scroll-mt-24 gap-6">
          <SmartLoanCard
            creditLimit={creditLimit}
            creditGrade={standing.credit_grade}
            loanInterestBps={standing.loan_interest_bps}
            loanTermDays={standing.loan_term_days}
            loanMinimumRepayment={standing.loan_minimum_repayment}
            activeLoan={activeLoan}
            cashBalance={cash}
          />
          <VirtualBondsCard bonds={bonds} cashBalance={cash} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <Landmark className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            <T
              korean="가상 금융 상태를 지갑, 주식, 사업 현황과 함께 확인해 과도한 게임 내 부채를 피하세요."
              english="Review virtual-finance state alongside your wallet, stocks, and businesses to avoid excessive in-game debt."
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
