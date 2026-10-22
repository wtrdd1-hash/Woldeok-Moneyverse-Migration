import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CreditCard,
  Landmark,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { LiveRefresh } from '@/components/live-refresh';
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
import { SavingsGoalProgressRing } from './savings-progress-ring';
import { SavingPocketsCard } from './saving-pockets-card';
import { BankLiquidityCard } from './bank-liquidity-card';
import { CreditScoreCard, type CreditRatingData } from './credit-score-card';
import { SavingsPotCard } from '@/components/savings-pot-card';
import { TossBankHeroCard } from './toss-bank-hero-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BankStanding, SavingPocket } from './types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 은행 & 복리 예금',
  description: '매일 실시간 복리 이자가 붙는 월덕뱅크 가상 은행. WLD 정기예금, 저축 팟, 가상 신용 대출 시뮬레이션',
  robots: { index: false, follow: false },
};

export default async function BankPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const [standing, pockets, creditRating, memberIdentity] = await Promise.all([
    apiOrNull<BankStanding>('/api/v1/banking/standing'),
    apiOrNull<SavingPocket[]>('/api/v1/banking/pockets'),
    apiOrNull<CreditRatingData>('/api/v1/banking/credit-rating'),
    apiOrNull<{ userId: string }>('/api/v1/wallet?recent=1'),
  ]);

  if (!standing) {
    return (
      <div data-page="bank" className="min-h-screen pb-24 space-y-6">
        <EmptyState
          title={isEn ? 'Cannot load banking services right now.' : '지금은 은행 서비스를 불러올 수 없어요.'}
          description={isEn ? 'Please try again in a few moments.' : '잠시 후 다시 접속해 주세요.'}
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

  return (
    <div data-page="bank" className="min-h-screen pb-24 space-y-6">
      <LiveRefresh />

      {/* 1. 상단 토스뱅크형 단일 통장 원카드 (실시간 이자 라이브 카운팅 & 채우기/보내기) */}
      <TossBankHeroCard
        bankBalance={bank}
        cashBalance={cash}
        unclaimedInterest={unclaimed}
        dailyRatePct={standing.daily_interest_rate_pct}
        annualYieldPct={standing.annual_yield_pct}
        isEn={isEn}
      />

      {/* 2. 안전 고지 가이드 (군더더기 없는 슬림 칩 형태) */}
      <div className="flex items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-muted/30 border border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-sky-500 shrink-0" />
          <span>
            {isEn
              ? 'WLD Virtual Banking: Game simulator only. Not actual financial products.'
              : '월덕뱅크는 게임 내 모의 금융 서비스이며, 실제 화폐 또는 금융상품이 아닙니다.'}
          </span>
        </div>
        <Link href="/guide/virtual-banking" className="font-semibold text-primary hover:underline shrink-0 hidden sm:inline">
          {isEn ? 'Guide' : '가이드 보기'}
        </Link>
      </div>

      {/* 3. 3대 핵심 서브 탭 UI (저축/모으기, 대출/신용, 통계/자산분석) */}
      <Tabs defaultValue="savings" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md w-full h-11 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="savings" className="rounded-lg text-xs sm:text-sm font-semibold">
            {isEn ? 'Savings & Pockets' : '저축 & 모으기'}
          </TabsTrigger>
          <TabsTrigger value="loan" className="rounded-lg text-xs sm:text-sm font-semibold">
            {isEn ? 'Loans & Credit' : '대출 & 신용'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg text-xs sm:text-sm font-semibold">
            {isEn ? 'Net Worth' : '순자산 분석'}
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: 저축 & 모으기 (스마트 정기예금 저축팟, 저축 목표 링, 목적별 포켓) */}
        <TabsContent value="savings" className="space-y-6 focus-visible:outline-none">
          {/* 중앙은행 스마트 복리 포켓 & 정기예금 카드 */}
          <SavingsPotCard userId={memberIdentity?.userId ?? 'guest-local'} />

          {/* 스마트 저축 목표 & 채권 수익 시뮬레이터 위젯 */}
          <div className="toss-card p-6">
            <SavingsGoalProgressRing
              bankBalance={bank}
              cashBalance={cash}
              bondsTotal={bondTotalPrincipal.toString()}
            />
          </div>

          {/* 목적별 저축 포켓 (Saving Pockets) 관리 카드 */}
          <div className="toss-card p-6">
            <SavingPocketsCard
              pockets={pockets ?? []}
              cashBalance={cash}
              bankBalance={bank}
            />
          </div>

          {/* 복리 이자 계산기 카드 */}
          <CompoundInterestCard
            bankBalance={bank}
            unclaimedInterest={unclaimed}
            dailyRatePct={standing.daily_interest_rate_pct}
            annualYieldPct={standing.annual_yield_pct}
          />
        </TabsContent>

        {/* 탭 2: 대출 & 신용 (스마트 대출 한도 및 상환, 신용평가 리포트, 가상 국채) */}
        <TabsContent value="loan" className="space-y-6 focus-visible:outline-none">
          {/* 대출 상태 안내 배너 */}
          {activeLoan && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs space-y-1">
              <span className="font-bold text-amber-500 block">
                {isEn ? 'Active Virtual Loan in Progress' : '실행 중인 가상 대출이 있습니다'}
              </span>
              <p className="text-muted-foreground">
                {canCoverMinimumRepayment
                  ? (isEn ? `You have sufficient cash for minimum repayment of ${groupDigits(minimumRepayment)} WLD.` : `현재 보유 현금으로 최소 상환액 ${groupDigits(minimumRepayment)} WLD를 충당할 수 있습니다.`)
                  : (isEn ? `Your cash is below minimum repayment of ${groupDigits(minimumRepayment)} WLD.` : `최소 상환액 ${groupDigits(minimumRepayment)} WLD를 충당하기 위한 현금이 부족합니다.`)}
              </p>
            </div>
          )}

          {/* 스마트 가상 대출 카드 */}
          <SmartLoanCard
            creditLimit={creditLimit}
            creditGrade={standing.credit_grade}
            loanInterestBps={standing.loan_interest_bps}
            loanTermDays={standing.loan_term_days}
            loanMinimumRepayment={standing.loan_minimum_repayment}
            activeLoan={activeLoan}
            cashBalance={cash}
          />

          {/* 개인 신용 평가 리포트 */}
          <div className="toss-card p-6">
            <CreditScoreCard
              initialRating={creditRating ?? undefined}
              standingCreditLimit={creditLimit}
              standingCreditGrade={standing.credit_grade}
              standingLoanInterestBps={standing.loan_interest_bps}
              standingLoanTermDays={standing.loan_term_days}
            />
          </div>

          {/* KTB 기획재정국채 발행 창구 */}
          <VirtualBondsCard bonds={bonds} cashBalance={cash} />
        </TabsContent>

        {/* 탭 3: 순자산 분석 & 건전성 (4대 지표 카드 + Kinked 점프 이자율 곡선) */}
        <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            <div className="toss-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{isEn ? 'Net Worth' : '순 금융 자산'}</span>
              <div className="font-fintech text-lg sm:text-2xl font-black text-foreground">
                <Amount value={netFinancialWorth} currency />
              </div>
              <span className="text-[10px] text-muted-foreground/80 block">현금+예금+채권-대출</span>
            </div>

            <div className="toss-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{isEn ? 'Cash' : '사용 가능 현금'}</span>
              <div className="font-fintech text-lg sm:text-2xl font-black text-sky-400">
                <Amount value={cash} currency />
              </div>
              <span className="text-[10px] text-muted-foreground/80 block">지갑 보유 잔액</span>
            </div>

            <div className="toss-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{isEn ? 'Savings' : '예금 잔액'}</span>
              <div className="font-fintech text-lg sm:text-2xl font-black text-emerald-400">
                <Amount value={bank} currency />
              </div>
              <span className="text-[10px] text-muted-foreground/80 block">일일 {standing.daily_interest_rate_pct}% 복리</span>
            </div>

            <div className="toss-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{isEn ? 'Credit Limit' : '신용 대출 한도'}</span>
              <div className="font-fintech text-lg sm:text-2xl font-black text-purple-400">
                <Amount value={creditLimit} currency />
              </div>
              <span className="text-[10px] text-muted-foreground/80 block">등급 {standing.credit_grade}</span>
            </div>
          </div>

          {/* 바젤 III 건전성 & Kinked 점프 이자율 곡선 */}
          <div className="toss-card p-6">
            <BankLiquidityCard
              bankBalance={bank}
              loanDebt={loanDebt.toString()}
              creditLimit={creditLimit}
              isEn={isEn}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* 하단 퀵 내비게이션 바 */}
      <div className="toss-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Landmark className="size-4" />
          <span>자산 포트폴리오를 주식 및 사업과 함께 균형 있게 분산하세요.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/wallet">{isEn ? 'Wallet' : '내 지갑'}</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/stocks">{isEn ? 'Stocks' : '주식 거래소'}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
