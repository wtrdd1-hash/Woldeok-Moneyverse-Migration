'use client';

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
import { IDLE } from '@/lib/action-state';
import { formatDay } from '@/lib/money';
import { borrow, claimDaily, claimWork, moveBank, repay, transfer } from './actions';

/**
 * The wallet's write surface.
 *
 * Every control here is a `<form action={serverAction}>`, so it works before
 * hydration and carries no CSRF token into the browser — the action fetches
 * one on the server and spends it in the same call.
 */

export function RewardButtons() {
  const [dailyState, daily] = useActionState(claimDaily, IDLE);
  const [workState, work] = useActionState(claimWork, IDLE);
  // A claim that reached the ledger (including an idempotent replay) must not
  // leave a live button behind. The server remains the authority for the next
  // eligible time; this stops an accidental second press in the same view.
  const dailyClaimed = dailyState.status === 'ok';
  const workClaimed = workState.status === 'ok';

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <form action={daily}>
          <SubmitButton disabled={dailyClaimed}>✦ 오늘의 보상 받기</SubmitButton>
        </form>
        <form action={work}>
          <SubmitButton disabled={workClaimed} variant="outline">
            ◈ 작업 보상 받기
          </SubmitButton>
        </form>
      </div>
      <ActionAlert state={dailyState} />
      <ActionAlert state={workState} />
    </div>
  );
}

export function TransferForm({ currency }: { readonly currency: string }) {
  const [state, action] = useActionState(transfer, IDLE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>WLD 보내기</CardTitle>
        <CardDescription>활동 지갑에서만 전송됩니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <FieldGroup className="gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="recipientUserId">받는 사람의 머니버스 ID</FieldLabel>
              <Input
                id="recipientUserId"
                name="recipientUserId"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={36}
                placeholder="상대가 공유한 머니버스 ID"
                required
              />
              <FieldDescription>
                이름·이메일·Discord ID로는 찾을 수 없어요. 상대가 공유한 정확한 ID를 입력해
                주세요.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="transfer-amount">보낼 {currency}</FieldLabel>
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
                송금 후에는 내 경제 원장에 기록됩니다. 받는 사람과 금액을 다시 확인해 주세요.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              1 {currency} 이상 정수만 보낼 수 있어요.
            </p>
            <SubmitButton>확인 →</SubmitButton>
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
        <CardTitle>보관과 대출</CardTitle>
        <CardDescription>대출은 게임 안에서만 사용되며 이자는 5%입니다.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <form action={moveAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="bank-move-amount">입출금 WLD</FieldLabel>
            <AmountInput id="bank-move-amount" name="amount" placeholder="0" required />
          </Field>
          <div className="flex flex-wrap gap-2">
            {/* One form, two intents. The direction is exactly what the
                controls differ by, and the API takes it as one field, so the
                button carries it rather than a duplicated form doing so. */}
            <SubmitButton name="direction" value="deposit">
              은행에 넣기
            </SubmitButton>
            <SubmitButton name="direction" value="withdraw" variant="outline">
              은행에서 꺼내기
            </SubmitButton>
          </div>
          <ActionAlert state={moveState} />
        </form>

        <form action={borrowAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="loan-principal">대출 WLD (100~500,000)</FieldLabel>
            <AmountInput id="loan-principal" name="principalAmount" placeholder="0" required />
            <FieldDescription>대출 원금에 5% 이자가 더해집니다.</FieldDescription>
          </Field>
          <SubmitButton className="w-fit">대출 신청</SubmitButton>
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
  /**
   * 076 gave a loan a third status. It is listed here because an overdue loan
   * that rendered as '상환 완료' would hide the repay form on the very loan
   * that most needs it -- and `bank_repay` accepts an overdue loan on purpose,
   * so that defaulting is never the better move.
   */
  readonly status: 'active' | 'repaid' | 'overdue';
  readonly issuedAt: string;
  readonly repaidAt: string | null;
}

interface LoanStandingWords {
  readonly label: string;
  readonly badge: 'secondary' | 'outline' | 'destructive';
}

const STANDING: Readonly<Record<LoanView['status'], LoanStandingWords>> = {
  active: { label: '상환 중', badge: 'secondary' },
  overdue: { label: '연체', badge: 'destructive' },
  repaid: { label: '상환 완료', badge: 'outline' },
};

export function LoanList({ loans }: { readonly loans: readonly LoanView[] }) {
  const [state, action] = useActionState(repay, IDLE);

  return (
    <div className="grid gap-3">
      {loans.map((loan) => (
        <div key={loan.loanId} className="grid gap-2 border-b pb-3 last:border-b-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="grid gap-0.5">
              <p className="text-sm">
                남은 상환액 <Amount value={loan.outstandingAmount} className="font-medium" currency />
              </p>
              <p className="text-xs text-muted-foreground">
                원금 <Amount value={loan.principalAmount} /> · 이자{' '}
                <Amount value={loan.interestAmount} /> · {formatDay(loan.issuedAt)} 실행
              </p>
            </div>
            <Badge variant={STANDING[loan.status].badge}>{STANDING[loan.status].label}</Badge>
          </div>

          {loan.status !== 'repaid' && (
            <form action={action} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="loanId" value={loan.loanId} />
              <AmountInput
                name="amount"
                className="w-40"
                placeholder="상환할 WLD"
                ariaLabel="상환할 WLD"
                required
              />
              <SubmitButton variant="outline">상환</SubmitButton>
            </form>
          )}
        </div>
      ))}
      <ActionAlert state={state} />
    </div>
  );
}

/**
 * The member's own id, with a copy control.
 *
 * A client component only because copying needs the clipboard. If the
 * clipboard is unavailable — an insecure origin, a browser that refuses —
 * the id itself is still on screen and selectable, so nothing is lost.
 */
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
        {copied ? '복사했어요' : 'ID 복사'}
      </Button>
      <p aria-live="polite" className="sr-only">
        {copied ? '머니버스 ID를 복사했습니다.' : ''}
      </p>
    </div>
  );
}
