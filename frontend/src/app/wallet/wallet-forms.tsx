'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Amount } from '@/components/amount';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { TranslatedText as T } from '@/components/translated-text';
import { IDLE } from '@/lib/action-state';
import { formatDay } from '@/lib/money';
import { borrow, claimDaily, moveBank, repay, transfer } from './actions';

export interface RewardAvailability {
  readonly dailyAvailable: boolean;
  readonly dailyNextEligibleAt: string | null;
  readonly workAvailable: boolean;
  readonly workNextEligibleAt: string | null;
}

function unavailableHint(nextEligibleAt: string | null): string {
  if (!nextEligibleAt) return '지금은 보상을 받을 수 없어요.';
  const value = new Date(nextEligibleAt);
  if (Number.isNaN(value.valueOf())) return '지금은 보상을 받을 수 없어요.';
  return `다음 수령 가능: ${new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(value)}`;
}

export function RewardButtons({ availability }: { readonly availability: RewardAvailability | null }) {
  const [dailyState, daily] = useActionState(claimDaily, IDLE);
  const dailyClaimed = dailyState.status === 'ok' || availability?.dailyAvailable === false;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <form action={daily}>
          <SubmitButton disabled={dailyClaimed}>
            ✦ <T korean="오늘의 보상 받기" english="Claim Daily Reward" />
          </SubmitButton>
        </form>
        <Button asChild variant="outline">
          <Link href="/work">
            ◈ <T korean="직업 업무 수행하기" english="Do Career Work" />
          </Link>
        </Button>
      </div>
      {availability?.dailyAvailable === false && (
        <p className="text-xs text-muted-foreground">
          <T korean="오늘의 보상" english="Daily Reward" /> · {unavailableHint(availability.dailyNextEligibleAt)}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        <T
          korean="작업 보상은 이제 직업별 업무를 완료하는 즉시 WLD와 숙련도 EXP로 지급됩니다."
          english="Work rewards are now paid immediately as WLD and proficiency EXP when you complete career tasks."
        />
      </p>
      <ActionAlert state={dailyState} />
    </div>
  );
}

export function TransferForm({ currency }: { readonly currency: string }) {
  const [state, action] = useActionState(transfer, IDLE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <T korean="WLD 보내기" english="Transfer WLD" />
        </CardTitle>
        <CardDescription>
          <T korean="활동 지갑에서만 전송됩니다." english="Transferred exclusively from your active cash balance." />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <FieldGroup className="gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="recipientUserId">
                <T korean="받는 사람의 머니버스 ID" english="Recipient's Moneyverse ID" />
              </FieldLabel>
              <Input
                id="recipientUserId"
                name="recipientUserId"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={36}
                placeholder="UUID"
                required
              />
              <FieldDescription>
                <T
                  korean="이름·이메일·Discord ID로는 찾을 수 없어요. 상대가 공유한 정확한 ID를 입력해 주세요."
                  english="Cannot search by name or Discord tag. Please enter the recipient's exact 36-char ID."
                />
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="transfer-amount">
                <T korean="보낼" english="Amount in" /> {currency}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="transfer-amount"
                  name="amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="0"
                  required
                />
                <InputGroupAddon align="inline-end">{currency}</InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                <T
                  korean="송금 후에는 내 경제 원장에 기록됩니다. 받는 사람과 금액을 다시 확인해 주세요."
                  english="Recorded directly to the ledger upon sending. Double check the recipient and amount."
                />
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              <T korean={`1 ${currency} 이상 정수만 보낼 수 있어요.`} english={`Only whole integers of 1 ${currency} or more can be sent.`} />
            </p>
            <SubmitButton>
              <T korean="확인 →" english="Send WLD →" />
            </SubmitButton>
          </div>
          <ActionAlert state={state} />
        </form>
      </CardContent>
    </Card>
  );
}

export function BankPanel() {
  const [moveState, moveAction] = useActionState(moveBank, IDLE);
  const [borrowState, borrowAction] = useActionState(borrow, IDLE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <T korean="보관과 대출" english="Vault Savings & Loans" />
        </CardTitle>
        <CardDescription>
          <T
            korean="대출은 게임 안에서만 사용되며 이자는 5%입니다."
            english="Loans are used strictly inside the in-game economy with 5% fixed interest."
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <form action={moveAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="bank-move-amount">
              <T korean="입출금 WLD" english="Vault Deposit / Withdraw" />
            </FieldLabel>
            <AmountInput id="bank-move-amount" name="amount" placeholder="0" required />
          </Field>
          <div className="flex flex-wrap gap-2">
            <SubmitButton name="direction" value="deposit">
              <T korean="은행에 넣기" english="Deposit to Bank" />
            </SubmitButton>
            <SubmitButton name="direction" value="withdraw" variant="outline">
              <T korean="은행에서 꺼내기" english="Withdraw from Bank" />
            </SubmitButton>
          </div>
          <ActionAlert state={moveState} />
        </form>

        <form action={borrowAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="loan-principal">
              <T korean="대출 WLD (100~500,000)" english="Borrow WLD (100–500,000)" />
            </FieldLabel>
            <AmountInput id="loan-principal" name="principalAmount" placeholder="0" required />
            <FieldDescription>
              <T korean="대출 원금에 5% 이자가 더해집니다." english="5% fixed interest is added to the principal amount." />
            </FieldDescription>
          </Field>
          <SubmitButton className="w-fit">
            <T korean="대출 신청" english="Apply for Loan" />
          </SubmitButton>
          <ActionAlert state={borrowState} />
        </form>
      </CardContent>
    </Card>
  );
}

export interface LoanView {
  readonly loanId: string;
  readonly principalAmount: string;
  readonly interestAmount: string;
  readonly outstandingAmount: string;
  readonly status: 'active' | 'repaid' | 'overdue';
  readonly issuedAt: string;
  readonly repaidAt: string | null;
}

export function LoanList({ loans }: { readonly loans: readonly LoanView[] }) {
  const [state, action] = useActionState(repay, IDLE);

  return (
    <div className="grid gap-3">
      {loans.map((loan) => (
        <div key={loan.loanId} className="grid gap-2 border-b pb-3 last:border-b-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="grid gap-0.5">
              <p className="text-sm">
                <T korean="남은 상환액" english="Outstanding Balance" /> <Amount value={loan.outstandingAmount} className="font-medium" currency />
              </p>
              <p className="text-xs text-muted-foreground">
                <T korean="원금" english="Principal" /> <Amount value={loan.principalAmount} /> · <T korean="이자" english="Interest" />{' '}
                <Amount value={loan.interestAmount} /> · {formatDay(loan.issuedAt)}
              </p>
            </div>
            <Badge variant={loan.status === 'overdue' ? 'destructive' : loan.status === 'repaid' ? 'outline' : 'secondary'}>
              {loan.status === 'active' && <T korean="상환 중" english="Active" />}
              {loan.status === 'overdue' && <T korean="연체" english="Overdue" />}
              {loan.status === 'repaid' && <T korean="상환 완료" english="Repaid" />}
            </Badge>
          </div>

          {loan.status !== 'repaid' && (
            <form action={action} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="loanId" value={loan.loanId} />
              <AmountInput
                name="amount"
                className="w-40"
                placeholder="0"
                ariaLabel="상환할 WLD"
                required
              />
              <SubmitButton variant="outline">
                <T korean="상환" english="Repay" />
              </SubmitButton>
            </form>
          )}
        </div>
      ))}
      <ActionAlert state={state} />
    </div>
  );
}

export function MoneyverseId({ userId }: { readonly userId: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid gap-2">
      <code className="overflow-x-auto rounded-md border bg-muted px-3 py-2 font-mono text-xs">
        {userId}
      </code>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-fit"
        onClick={() => {
          void navigator.clipboard
            ?.writeText(userId)
            .then(() => setCopied(true))
            .catch(() => setCopied(false));
        }}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? <T korean="복사했어요" english="Copied!" /> : <T korean="ID 복사" english="Copy ID" />}
      </Button>
      <p aria-live="polite" className="sr-only">
        {copied ? '머니버스 ID를 복사했습니다.' : ''}
      </p>
    </div>
  );
}