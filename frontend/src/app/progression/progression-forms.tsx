'use client';

import { useActionState } from 'react';
import { CircleAlert } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Amount } from '@/components/amount';
import { AmountInput } from '@/components/amount-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { IDLE } from '@/lib/action-state';
import { formatDay } from '@/lib/money';
import { LOAN_STANDING_LABELS, isRepayable, loanStanding, urgentFirst } from './credit';
import type { CreditLoan } from './credit';
import { refreshStage, repayLoan } from './actions';

/**
 * The write surface of the growth screen.
 *
 * Both controls are a `<form action={serverAction}>`, so they work before
 * hydration and no CSRF token is ever handed to the browser -- the action
 * fetches one on the server and spends it in the same call.
 */

export function RefreshButton({ label = '단계 새로고침' }: { readonly label?: string }) {
  const [state, action] = useActionState(refreshStage, IDLE);

  return (
    <div className="grid gap-2">
      <form action={action}>
        <SubmitButton variant="outline">◈ {label}</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

/**
 * The member's loans, the overdue one first.
 *
 * One `useActionState` for the whole list, as the wallet's loan list does:
 * the member repays one loan at a time, and one alert in one place is what
 * keeps the outcome where they are looking.
 */
export function LoanBoard({ loans }: { readonly loans: readonly CreditLoan[] }) {
  const [state, action] = useActionState(repayLoan, IDLE);

  return (
    <div className="grid gap-3">
      {urgentFirst(loans).map((loan) => {
        const standing = loanStanding(loan.status);
        const overdue = standing === 'overdue';
        const badge = overdue ? 'destructive' : standing === 'active' ? 'secondary' : 'outline';

        return (
          <div
            key={loan.loan_id}
            className={`grid gap-3 rounded-[14px] border p-4 ${
              // Colour is never the only signal here either: the badge, the
              // sentence and the icon below all say "overdue" as well.
              overdue ? 'border-clay bg-clay-soft/30' : 'bg-surface'
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="grid gap-0.5">
                <p className="text-sm">
                  남은 상환액 <Amount value={loan.outstanding_amount} className="font-medium" currency />
                </p>
                <p className="text-xs text-muted-foreground">
                  원금 <Amount value={loan.principal_amount} /> · 이자{' '}
                  <Amount value={loan.interest_amount} /> · {formatDay(loan.issued_at)} 실행
                  {loan.repaid_at && ` · ${formatDay(loan.repaid_at)} 상환 완료`}
                </p>
              </div>
              <Badge variant={badge}>{LOAN_STANDING_LABELS[standing]}</Badge>
            </div>

            {overdue && (
              <Alert>
                <CircleAlert className="text-clay-ink" />
                <AlertTitle>상환 기한이 지났어요.</AlertTitle>
                <AlertDescription>
                  연체 중에도 상환할 수 있어요. 남은 금액을 모두 갚으면 연체가 풀리고, 갚기 전까지는
                  새 대출을 신청할 수 없어요.
                </AlertDescription>
              </Alert>
            )}

            {standing === 'unknown' && (
              <p className="text-xs text-muted-foreground">
                이 대출의 상태를 화면에서 안내할 수 없어요. 내 지갑 기록에서 확인해 주세요.
              </p>
            )}

            {isRepayable(loan.status) && (
              <form action={action} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="loanId" value={loan.loan_id} />
                <AmountInput
                  name="amount"
                  className="w-40"
                  placeholder="상환할 WLD"
                  ariaLabel="상환할 WLD"
                  required
                />
                <SubmitButton variant={overdue ? 'default' : 'outline'}>상환</SubmitButton>
              </form>
            )}
          </div>
        );
      })}
      <ActionAlert state={state} />
    </div>
  );
}
