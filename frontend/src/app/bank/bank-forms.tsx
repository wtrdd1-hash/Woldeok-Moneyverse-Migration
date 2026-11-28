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
import { IDLE } from '@/lib/action-state';
import { compareAmounts, groupDigits } from '@/lib/money';
import type { BankBond, BankLoan } from './types';
import { RepayImpactPreview } from './repay-impact-preview';
import { INTL_LOCALE } from './copy';
import { useBankCopy } from './use-bank-copy';
import {
  borrowAction,
  claimInterestAction,
  depositAction,
  purchaseBondAction,
  redeemBondAction,
  repayAction,
  withdrawAction,
} from './actions';
import { VirtualBondSimulatorDialog } from './virtual-bond-simulator-dialog';

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
  dailyRatePct,
}: {
  readonly cashBalance: string;
  readonly bankBalance: string;
  readonly dailyRatePct: number;
}) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositState, doDeposit] = useActionState(depositAction, IDLE);
  const [withdrawState, doWithdraw] = useActionState(withdrawAction, IDLE);
  const [amountStr, setAmountStr] = useState<string>('');
  const { c } = useBankCopy();

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
    <Card id="bank-real-deposit" className="scroll-mt-24 border-border/60 bg-background/80 backdrop-blur-md mb-8 sm:mb-12">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <PiggyBank className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {c('formsDepositTitle')}
              </CardTitle>
              <CardDescription>
                {c('formsDepositDescription')}
              </CardDescription>
            </div>
          </div>
          <div className="flex w-full rounded-lg border border-border/60 bg-muted/40 p-1 sm:w-auto">
            <Button
              type="button"
              variant={tab === 'deposit' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 flex-1 px-3 text-xs font-bold sm:flex-none"
              onClick={() => {
                setTab('deposit');
                setAmountStr('');
              }}
            >
              {c('formsDepositTab')}
            </Button>
            <Button
              type="button"
              variant={tab === 'withdraw' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 flex-1 px-3 text-xs font-bold sm:flex-none"
              onClick={() => {
                setTab('withdraw');
                setAmountStr('');
              }}
            >
              {c('formsWithdrawTab')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">{c('cashBalance')}</span>
            <div className="font-bold">
              <Amount value={cash} currency />
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{c('formsSavingsBalance')}</span>
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
                  {c('formsDepositAmount')}
                </FieldLabel>
                <AmountInput
                  id="deposit-amount"
                  name="amount"
                  placeholder={c('formsDepositPlaceholder')}
                  defaultValue={amountStr}
                  required
                />
                <FieldDescription>
                  {c('formsDepositHint', { rate: `${dailyRatePct}` })}
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
                {c('formsMax')}
              </Button>
            </div>

            <SubmitButton className="w-full font-bold">
              {c('formsDepositSubmit')}
            </SubmitButton>
            <ActionAlert state={depositState} />
          </form>
        ) : (
          <form action={doWithdraw} className="grid gap-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="withdraw-amount">
                  {c('formsWithdrawAmount')}
                </FieldLabel>
                <AmountInput
                  id="withdraw-amount"
                  name="amount"
                  placeholder={c('formsWithdrawPlaceholder')}
                  defaultValue={amountStr}
                  required
                />
                <FieldDescription>
                  {c('formsWithdrawHint')}
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
                {c('formsMax')}
              </Button>
            </div>

            <SubmitButton variant="outline" className="w-full font-bold">
              {c('formsWithdrawSubmit')}
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
  const { c } = useBankCopy();
  const unclaimed = unclaimedInterest;
  const bank = bankBalance;

  return (
    <Card className="border-border/60 bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 backdrop-blur-md">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {c('formsInterestTitle')}
              </CardTitle>
              <CardDescription>
                {c('formsInterestDescription')}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            {c('formsInterestBadge', { annual: `${annualYieldPct}` })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {c('formsInterestPending')}
          </div>
          <div className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular">
            +{groupDigits(unclaimed)} <span className="text-base text-muted-foreground font-normal">WLD</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {c('formsInterestRateNote', { rate: `${dailyRatePct}` })}
          </p>
        </div>

        <form action={doClaim}>
          <SubmitButton
            disabled={compareAmounts(bank, '0') <= 0 || compareAmounts(unclaimed, '1') < 0}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11 shadow-sm"
          >
            <Sparkles className="mr-2 size-4" />
            {c('formsInterestClaim')}
          </SubmitButton>
        </form>
        <ActionAlert state={state} />

        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">{c('formsInterestGuideTitle')}</p>
          <p>{c('formsInterestGuide1')}</p>
          <p>{c('formsInterestGuide2')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SmartLoanCard({
  creditLimit,
  creditGrade,
  loanInterestBps,
  loanTermDays,
  loanMinimumRepayment,
  activeLoan,
  cashBalance,
}: {
  readonly creditLimit: string;
  readonly creditGrade: string;
  readonly loanInterestBps: number;
  readonly loanTermDays: number;
  readonly loanMinimumRepayment: string;
  readonly activeLoan: BankLoan | null;
  readonly cashBalance: string;
}) {
  const [borrowState, doBorrow] = useActionState(borrowAction, IDLE);
  const [repayState, doRepay] = useActionState(repayAction, IDLE);
  const [repayAmountStr, setRepayAmountStr] = useState<string>('');
  const { c, locale } = useBankCopy();

  const limit = creditLimit;
  const cash = cashBalance;
  const hasActiveLoan = Boolean(activeLoan && (activeLoan.status === 'active' || activeLoan.status === 'overdue'));
  const loanRatePct = (loanInterestBps / 100).toFixed(loanInterestBps % 100 === 0 ? 0 : 2);

  const outstanding = hasActiveLoan && activeLoan ? activeLoan.outstanding_amount : '0';
  const principal = hasActiveLoan && activeLoan ? activeLoan.principal_amount : '0';
  const interest = hasActiveLoan && activeLoan ? activeLoan.interest_amount : '0';

  return (
    <Card className="border-border/60 bg-background/80 backdrop-blur-md">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <CreditCard className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {c('formsLoanTitle')}
              </CardTitle>
              <CardDescription>
                {c('formsLoanDescription')}
              </CardDescription>
            </div>
          </div>
          <Badge variant={hasActiveLoan ? 'destructive' : 'secondary'} className="font-bold">
            {hasActiveLoan ? c('formsLoanActive') : c('formsLoanAvailable')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{c('formsLoanLimit')}</span>
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
            <span>{c('formsLoanScoring')}</span>
            <span>{c('formsLoanUsage', { pct: `${hasActiveLoan ? percentOf(principal, limit) : 0}` })}</span>
          </div>
        </div>

        {hasActiveLoan && activeLoan ? (
          <div className="grid gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-destructive flex items-center gap-1.5">
                <ShieldAlert className="size-4" /> {c('formsLoanStatement')}
              </span>
              <span className="text-xs text-muted-foreground">
                {c('formsLoanIssued', { date: new Date(activeLoan.issued_at).toLocaleDateString(INTL_LOCALE[locale]) })}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-center text-xs py-2 border-y border-destructive/10 min-[480px]:grid-cols-3">
              <div>
                <span className="text-muted-foreground">{c('formsLoanPrincipal')}</span>
                <p className="font-bold mt-0.5">{groupDigits(principal)} WLD</p>
              </div>
              <div>
                <span className="text-muted-foreground">{c('formsLoanInterest')}</span>
                <p className="font-bold text-amber-600 mt-0.5">+{groupDigits(interest)} WLD</p>
              </div>
              <div>
                <span className="text-muted-foreground">{c('formsLoanOutstanding')}</span>
                <p className="font-extrabold text-destructive mt-0.5">{groupDigits(outstanding)} WLD</p>
              </div>
            </div>

            <form action={doRepay} className="grid gap-3 pt-2">
              <input type="hidden" name="loanId" value={activeLoan.loan_id} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="repay-amount">
                    {c('formsRepayAmount')}
                  </FieldLabel>
                  <AmountInput
                    id="repay-amount"
                    name="amount"
                    value={repayAmountStr}
                    onChange={setRepayAmountStr}
                    placeholder={c('formsRepayPlaceholder', { amount: groupDigits(outstanding) })}
                    required
                  />
                </Field>
              </FieldGroup>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setRepayAmountStr(minAmount(cash, halfAmount(outstanding)))}
                >
                  {c('formsRepayHalf')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs font-bold"
                  onClick={() => setRepayAmountStr(minAmount(cash, outstanding))}
                >
                  {c('formsRepayFull')}
                </Button>
              </div>
              <RepayImpactPreview
                key={`${activeLoan.loan_id}:${repayAmountStr}`}
                loanId={activeLoan.loan_id}
                amount={repayAmountStr}
                repayComplete={repayState.status === 'ok'}
              />
              <SubmitButton className="w-full font-bold">
                {c('formsRepaySubmit')}
              </SubmitButton>
              <ActionAlert state={repayState} />
            </form>
          </div>
        ) : (
          <form action={doBorrow} className="grid gap-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="loan-amount">
                  {c('formsBorrowAmount')}
                </FieldLabel>
                <AmountInput
                  id="loan-amount"
                  name="amount"
                  placeholder={c('formsBorrowPlaceholder', { amount: groupDigits(limit) })}
                  required
                />
                <FieldDescription>
                  {c('formsBorrowTerms', {
                    grade: creditGrade,
                    days: `${loanTermDays}`,
                    rate: loanRatePct,
                    minimum: groupDigits(loanMinimumRepayment),
                  })}
                </FieldDescription>
              </Field>
            </FieldGroup>

            <SubmitButton className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold">
              {c('formsBorrowSubmit')}
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
  const { c } = useBankCopy();

  const cash = cashBalance;

  return (
    <Card className="border-border/60 bg-background/80 backdrop-blur-md">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Landmark className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {c('formsBondsTitle')}
              </CardTitle>
              <CardDescription>
                {c('formsBondsDescription')}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <VirtualBondSimulatorDialog
              onApply={(code, amount) => {
                setSelectedBond(code);
                setAmountStr(amount);
              }}
            />
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
              {c('formsBondsCash', { amount: groupDigits(cash) })}
            </Badge>
          </div>
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
              <span className="font-bold text-sm">{c('bond7Name')}</span>
              <Badge className="bg-amber-500 text-black font-extrabold">+3.0%</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c('formsBond7Detail')}</p>
            <div className="mt-2 text-xs font-semibold text-muted-foreground">
              {c('formsBond7Min')}
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
              <span className="font-bold text-sm">{c('bond30Name')}</span>
              <Badge className="bg-amber-500 text-black font-extrabold">+15.0%</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c('formsBond30Detail')}</p>
            <div className="mt-2 text-xs font-semibold text-muted-foreground">
              {c('formsBond30Min')}
            </div>
          </div>
        </div>

        <form action={doPurchase} className="grid gap-3 rounded-xl border border-border/60 bg-muted/10 p-4">
          <input type="hidden" name="bondCode" value={selectedBond} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bond-amount">
                {c('formsBondPurchaseLabel', {
                  bond: selectedBond === 'BOND_7D' ? c('formsBond7Short') : c('formsBond30Short'),
                })}
              </FieldLabel>
              <AmountInput
                id="bond-amount"
                name="amount"
                defaultValue={amountStr}
                placeholder={c('formsBondPlaceholder')}
                required
              />
              <FieldDescription>
                {c('formsBondPayout', {
                  amount: groupDigits(bondMaturityAmount(amountStr, selectedBond === 'BOND_7D' ? 300 : 1500)),
                })}
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

          <SubmitButton className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold">
            {c('formsBondSubmit')}
          </SubmitButton>
          <ActionAlert state={purchaseState} />
        </form>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{c('formsBondList', { count: `${bonds.length}` })}</span>
          </div>

          {bonds.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
              {c('formsBondEmpty')}
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
                        {bond.is_matured ? c('formsBondMatured') : c('formsBondLocked')}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{c('formsBondPrincipal')}{groupDigits(bond.principal_amount)} WLD</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {c('formsBondMaturityPayout')}{groupDigits(bond.maturity_amount)} WLD (+{bond.yield_bps / 100}%)
                      </span>
                      <span>{c('formsBondMaturityDate')}{new Date(bond.maturity_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {bond.is_matured && (
                    <form action={doRedeem} className="shrink-0">
                      <input type="hidden" name="bondId" value={bond.id} />
                      <SubmitButton size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-9">
                        <Coins className="mr-1.5 size-4" />
                        {c('formsBondClaim')}
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
