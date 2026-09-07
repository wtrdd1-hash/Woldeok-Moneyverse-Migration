'use client';

import { useActionState, useState } from 'react';
import {
  Coins,
  CreditCard,
  Landmark,
  PiggyBank,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Amount } from '@/components/amount';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { TranslatedText as T } from '@/components/translated-text';
import { IDLE } from '@/lib/action-state';
import { compareAmounts, groupDigits } from '@/lib/money';
import type { BankBond, BankLoan } from './types';
import {
  borrowAction,
  claimInterestAction,
  depositAction,
  purchaseBondAction,
  redeemBondAction,
  repayAction,
  withdrawAction,
} from './actions';

function minAmount(left: string, right: string): string {
  return compareAmounts(left, right) <= 0 ? left : right;
}

function halfAmount(amount: string): string {
  return (BigInt(amount) / 2n).toString();
}

function percentOf(amount: string, total: string): number {
  const denominator = BigInt(total);
  if (denominator <= 0n) return 0;
  const numerator = BigInt(amount);
  const rounded = (numerator * 100n + denominator / 2n) / denominator;
  return Math.min(100, Math.max(0, Number(rounded)));
}

function bondMaturityAmount(amount: string, yieldBps: number): string {
  if (!/^\d+$/.test(amount) || amount === '0') return '0';
  const principal = BigInt(amount);
  const interest = (principal * BigInt(yieldBps) + 5_000n) / 10_000n;
  return (principal + interest).toString();
}

export function DepositWithdrawCard({
  cashBalance,
  bankBalance,
}: {
  readonly cashBalance: string;
  readonly bankBalance: string;
}) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositState, doDeposit] = useActionState(depositAction, IDLE);
  const [withdrawState, doWithdraw] = useActionState(withdrawAction, IDLE);
  const [amountStr, setAmountStr] = useState<string>('');

  const cash = cashBalance;
  const bank = bankBalance;

  const handleQuickPreset = (val: number) => {
    setAmountStr(String(val));
  };

  const handleMax = () => {
    if (tab === 'deposit') {
      setAmountStr(cash);
    } else {
      setAmountStr(bank);
    }
  };

  return (
    <Card className="border-border/60 bg-background/80 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <PiggyBank className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <T korean="입금 / 출금 창구" english="Deposit & Withdrawal" />
              </CardTitle>
              <CardDescription>
                <T
                  korean="현금과 복리 예금 계좌 간 WLD를 자유롭게 입출금하세요."
                  english="Transfer WLD between your cash wallet and compound deposit account."
                />
              </CardDescription>
            </div>
          </div>
          <div className="flex rounded-lg border border-border/60 bg-muted/40 p-1">
            <Button
              type="button"
              variant={tab === 'deposit' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3 text-xs font-bold"
              onClick={() => {
                setTab('deposit');
                setAmountStr('');
              }}
            >
              <T korean="예금 입금" english="Deposit" />
            </Button>
            <Button
              type="button"
              variant={tab === 'withdraw' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3 text-xs font-bold"
              onClick={() => {
                setTab('withdraw');
                setAmountStr('');
              }}
            >
              <T korean="현금 출금" english="Withdraw" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground"><T korean="보유 현금" english="Cash Balance" /></span>
            <div className="font-bold">
              <Amount value={cash} currency />
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground"><T korean="예금 잔액" english="Savings Balance" /></span>
            <div className="font-bold text-blue-600 dark:text-blue-400">
              <Amount value={bank} currency />
            </div>
          </div>
        </div>

        {tab === 'deposit' ? (
          <form action={doDeposit} className="grid gap-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="deposit-amount">
                  <T korean="입금할 WLD 금액" english="Deposit Amount" />
                </FieldLabel>
                <AmountInput
                  id="deposit-amount"
                  name="amount"
                  placeholder="예: 10,000"
                  defaultValue={amountStr}
                  required
                />
                <FieldDescription>
                  <T
                    korean="입금 즉시 일일 0.05% (연 약 20%) 복리 이자가 발생합니다."
                    english="Daily 0.05% compound interest starts accruing immediately."
                  />
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleQuickPreset(1000)}>
                +1,000
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleQuickPreset(10000)}>
                +10,000
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleQuickPreset(50000)}>
                +50,000
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs font-bold" onClick={handleMax}>
                <T korean="최대 전액" english="MAX" />
              </Button>
            </div>

            <SubmitButton className="w-full font-bold">
              <T korean="복리 예금에 입금하기" english="Deposit to Compound Savings" />
            </SubmitButton>
            <ActionAlert state={depositState} />
          </form>
        ) : (
          <form action={doWithdraw} className="grid gap-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="withdraw-amount">
                  <T korean="출금할 WLD 금액" english="Withdrawal Amount" />
                </FieldLabel>
                <AmountInput
                  id="withdraw-amount"
                  name="amount"
                  placeholder="예: 5,000"
                  defaultValue={amountStr}
                  required
                />
                <FieldDescription>
                  <T
                    korean="예금에서 출금되어 즉시 사용 가능한 현금(USER_CASH)으로 전환됩니다."
                    english="Transfers funds from savings to your spendable cash balance."
                  />
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleQuickPreset(1000)}>
                +1,000
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleQuickPreset(10000)}>
                +10,000
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleQuickPreset(50000)}>
                +50,000
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs font-bold" onClick={handleMax}>
                <T korean="최대 전액" english="MAX" />
              </Button>
            </div>

            <SubmitButton variant="outline" className="w-full font-bold">
              <T korean="현금으로 출금하기" english="Withdraw to Cash" />
            </SubmitButton>
            <ActionAlert state={withdrawState} />
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function CompoundInterestCard({
  bankBalance,
  unclaimedInterest,
  dailyRatePct,
  annualYieldPct,
}: {
  readonly bankBalance: string;
  readonly unclaimedInterest: string;
  readonly dailyRatePct: number;
  readonly annualYieldPct: number;
}) {
  const [state, doClaim] = useActionState(claimInterestAction, IDLE);
  const unclaimed = unclaimedInterest;
  const bank = bankBalance;

  return (
    <Card className="border-border/60 bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <T korean="일일 복리 이자 정산소" english="Compound Interest Station" />
              </CardTitle>
              <CardDescription>
                <T
                  korean="예금 잔액에 비례해 온디맨드로 정산받는 고수익 복리 이자"
                  english="Claim accrued compound interest directly into your savings balance."
                />
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            연 {annualYieldPct}% 복리
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <T korean="현재 정산 대기 이자" english="Accrued Unclaimed Interest" />
          </div>
          <div className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular">
            +{groupDigits(unclaimed)} <span className="text-base text-muted-foreground font-normal">WLD</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            일일 {dailyRatePct}% (시간당 실시간 분할 적립) · 최소 30분 예치 후 수령 가능
          </p>
        </div>

        <form action={doClaim}>
          <SubmitButton
            disabled={compareAmounts(bank, '0') <= 0 || compareAmounts(unclaimed, '1') < 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-sm"
          >
            <Sparkles className="mr-2 size-4" />
            <T korean="복리 이자 원클릭 정산 수령" english="Claim Accrued Interest" />
          </SubmitButton>
        </form>
        <ActionAlert state={state} />

        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">💡 가상 은행 복리 시스템 안내</p>
          <p>• 수령한 이자는 예금 계좌로 즉시 재예치되어 원금에 합산되는 자동 복리 구조입니다.</p>
          <p>• 출금 시에도 직전까지 누적된 이자는 손실 없이 보존되며 언제든 정산할 수 있습니다.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SmartLoanCard({
  creditLimit,
  activeLoan,
  cashBalance,
}: {
  readonly creditLimit: string;
  readonly activeLoan: BankLoan | null;
  readonly cashBalance: string;
}) {
  const [borrowState, doBorrow] = useActionState(borrowAction, IDLE);
  const [repayState, doRepay] = useActionState(repayAction, IDLE);
  const [repayAmountStr, setRepayAmountStr] = useState<string>('');

  const limit = creditLimit;
  const cash = cashBalance;
  const hasActiveLoan = Boolean(activeLoan && activeLoan.status === 'active');

  const outstanding = hasActiveLoan && activeLoan ? activeLoan.outstanding_amount : '0';
  const principal = hasActiveLoan && activeLoan ? activeLoan.principal_amount : '0';
  const interest = hasActiveLoan && activeLoan ? activeLoan.interest_amount : '0';

  return (
    <Card className="border-border/60 bg-background/80 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <CreditCard className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <T korean="스마트 동적 신용 대출" english="Smart Dynamic Credit Loan" />
              </CardTitle>
              <CardDescription>
                <T
                  korean="보유 직업 숙련도(Lv.1~10) 및 사업체 자산 가치를 반영한 무담보 신용 한도"
                  english="Collateral-free credit limit dynamically evaluated by your job levels and business equity."
                />
              </CardDescription>
            </div>
          </div>
          <Badge variant={hasActiveLoan ? 'destructive' : 'secondary'} className="font-bold">
            {hasActiveLoan ? '대출 실행 중' : '대출 가능'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">나의 평가 신용 한도</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400">
              <Amount value={limit} currency />
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: hasActiveLoan ? `${percentOf(principal, limit)}%` : '0%',
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>직업·사업 연동 스마트 신용평가</span>
            <span>한도 소진율: {hasActiveLoan ? percentOf(principal, limit) : 0}%</span>
          </div>
        </div>

        {hasActiveLoan && activeLoan ? (
          <div className="grid gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-destructive flex items-center gap-1.5">
                <ShieldAlert className="size-4" /> 실행 중인 대출 명세
              </span>
              <span className="text-xs text-muted-foreground">
                발행: {new Date(activeLoan.issued_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-destructive/10">
              <div>
                <span className="text-muted-foreground">대출 원금</span>
                <p className="font-bold mt-0.5">{groupDigits(principal)} WLD</p>
              </div>
              <div>
                <span className="text-muted-foreground">약정 이자 (1.4%)</span>
                <p className="font-bold text-amber-600 mt-0.5">+{groupDigits(interest)} WLD</p>
              </div>
              <div>
                <span className="text-muted-foreground">총 상환 잔액</span>
                <p className="font-extrabold text-destructive mt-0.5">{groupDigits(outstanding)} WLD</p>
              </div>
            </div>

            <form action={doRepay} className="grid gap-3 pt-2">
              <input type="hidden" name="loanId" value={activeLoan.loan_id} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="repay-amount">
                    <T korean="상환할 금액 (현금 차감)" english="Repay Amount" />
                  </FieldLabel>
                  <AmountInput
                    id="repay-amount"
                    name="amount"
                    defaultValue={repayAmountStr}
                    placeholder={`최대 ${groupDigits(outstanding)}`}
                    required
                  />
                </Field>
              </FieldGroup>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setRepayAmountStr(minAmount(cash, halfAmount(outstanding)))}
                >
                  반액 상환
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs font-bold"
                  onClick={() => setRepayAmountStr(minAmount(cash, outstanding))}
                >
                  전액 상환 (Full)
                </Button>
              </div>
              <SubmitButton className="w-full font-bold">
                <T korean="대출금 상환하기" english="Repay Loan" />
              </SubmitButton>
              <ActionAlert state={repayState} />
            </form>
          </div>
        ) : (
          <form action={doBorrow} className="grid gap-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="loan-amount">
                  <T korean="신청할 대출 금액" english="Loan Amount" />
                </FieldLabel>
                <AmountInput
                  id="loan-amount"
                  name="amount"
                  placeholder={`최대 ${groupDigits(limit)} WLD`}
                  required
                />
                <FieldDescription>
                  <T
                    korean="만기 14일, 일일 0.1% (총 1.4%), 중도상환 수수료 0% 즉시 지급"
                    english="14-day tenure, 0.1% daily interest (1.4% total), 0% early repayment fee."
                  />
                </FieldDescription>
              </Field>
            </FieldGroup>

            <SubmitButton className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
              <T korean="신용 대출 신청 및 즉시 입금" english="Apply & Receive Smart Loan" />
            </SubmitButton>
            <ActionAlert state={borrowState} />
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function VirtualBondsCard({
  bonds,
  cashBalance,
}: {
  readonly bonds: readonly BankBond[];
  readonly cashBalance: string;
}) {
  const [selectedBond, setSelectedBond] = useState<'BOND_7D' | 'BOND_30D'>('BOND_7D');
  const [purchaseState, doPurchase] = useActionState(purchaseBondAction, IDLE);
  const [redeemState, doRedeem] = useActionState(redeemBondAction, IDLE);
  const [amountStr, setAmountStr] = useState<string>('10000');

  const cash = cashBalance;

  return (
    <Card className="border-border/60 bg-background/80 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Landmark className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <T korean="가상 국채 / 정기 채권 투자" english="Virtual Sovereign Bonds" />
              </CardTitle>
              <CardDescription>
                <T
                  korean="약정 기간 동안 WLD를 락업하여 확정 만기 고수익을 달성하세요."
                  english="Lock up WLD for a fixed tenure to earn guaranteed high maturity yields."
                />
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
            <T korean={`보유 현금 ${groupDigits(cash)} WLD`} english={`Cash ${groupDigits(cash)} WLD`} />
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            onClick={() => setSelectedBond('BOND_7D')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedBond === 'BOND_7D'
                ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                : 'border-border/60 bg-muted/20 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm"><T korean="7일 만기 단기 국채" english="7-Day Virtual Bond" /></span>
              <Badge className="bg-amber-500 text-black font-extrabold">+3.0%</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground"><T korean="만기 7일 후 원금 + 3% 확정 수익 지급" english="Principal + 3% fixed yield paid upon 7-day maturity" /></p>
            <div className="mt-2 text-xs font-semibold text-muted-foreground">
              <T korean="최소 매입: 1,000 WLD" english="Min: 1,000 WLD" />
            </div>
          </div>

          <div
            onClick={() => setSelectedBond('BOND_30D')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedBond === 'BOND_30D'
                ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                : 'border-border/60 bg-muted/20 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm"><T korean="30일 만기 프리미엄 국채" english="30-Day Premium Bond" /></span>
              <Badge className="bg-amber-500 text-black font-extrabold">+15.0%</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground"><T korean="만기 30일 후 원금 + 15% 확정 수익 지급" english="Principal + 15% fixed yield paid upon 30-day maturity" /></p>
            <div className="mt-2 text-xs font-semibold text-muted-foreground">
              <T korean="최소 매입: 5,000 WLD" english="Min: 5,000 WLD" />
            </div>
          </div>
        </div>

        <form action={doPurchase} className="grid gap-3 rounded-xl border border-border/60 bg-muted/10 p-4">
          <input type="hidden" name="bondCode" value={selectedBond} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bond-amount">
                <T
                  korean={`${selectedBond === 'BOND_7D' ? '7일 국채 (+3%)' : '30일 국채 (+15%)'} 매입 금액`}
                  english="Bond Purchase Amount"
                />
              </FieldLabel>
              <AmountInput
                id="bond-amount"
                name="amount"
                defaultValue={amountStr}
                placeholder="예: 50,000"
                required
              />
              <FieldDescription>
                <T
                  korean={`만기 시 예상 수령액: ${groupDigits(
                    bondMaturityAmount(amountStr, selectedBond === 'BOND_7D' ? 300 : 1500),
                  )} WLD`}
                  english="Estimated payout at maturity"
                />
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAmountStr('10000')}>
              10,000
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAmountStr('50000')}>
              50,000
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAmountStr('100000')}>
              100,000
            </Button>
          </div>

          <SubmitButton className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">
            <T korean="가상 국채 매입 신청" english="Purchase Virtual Bond" />
          </SubmitButton>
          <ActionAlert state={purchaseState} />
        </form>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold"><T korean={`나의 보유 국채 목록 (${bonds.length}건)`} english={`My Virtual Bonds (${bonds.length})`} /></span>
          </div>

          {bonds.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
              <T korean="현재 보유 중인 가상 국채가 없습니다. 위의 국채 상품에 투자해 보세요." english="You do not hold any virtual treasury bonds. Invest in the bonds above to earn interest." />
            </div>
          ) : (
            <div className="grid gap-2">
              {bonds.map((bond) => (
                <div
                  key={bond.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
                    bond.is_matured
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-border/60 bg-muted/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{bond.bond_name}</span>
                      <Badge variant={bond.is_matured ? 'default' : 'secondary'} className="text-[11px] font-bold">
                        {bond.is_matured ? <T korean="만기 도래 (수령 가능)" english="Matured (Claimable)" /> : <T korean="락업 운용 중" english="Locked (Active)" />}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span><T korean="원금: " english="Principal: " />{groupDigits(bond.principal_amount)} WLD</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        <T korean="만기 수령액: " english="Maturity Payout: " />{groupDigits(bond.maturity_amount)} WLD (+{bond.yield_bps / 100}%)
                      </span>
                      <span><T korean="만기일: " english="Maturity Date: " />{new Date(bond.maturity_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {bond.is_matured && (
                    <form action={doRedeem} className="shrink-0">
                      <input type="hidden" name="bondId" value={bond.id} />
                      <SubmitButton size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9">
                        <Coins className="mr-1.5 size-4" />
                        <T korean="만기 원리금 수령" english="Claim Payout" />
                      </SubmitButton>
                    </form>
                  )}
                </div>
              ))}
              <ActionAlert state={redeemState} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
