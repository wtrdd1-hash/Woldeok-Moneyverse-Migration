'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';
import { stageLabel } from './stages';

/**
 * The two writes this screen can make.
 *
 * Neither of them sends a figure the server can read for itself: the stage is
 * recomputed from the member's own record, and a repayment sends only how
 * much the member typed -- `bank_repay` re-reads the outstanding balance
 * inside the transaction that posts the ledger entry and pays down no more
 * than that.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Recomputes the growth stage.
 *
 * The only write in this application that carries no idempotency key, and the
 * reason is that `progression_refresh` posts nothing: it settles on a stage
 * from work receipts, job level and businesses, never takes a stage back, and
 * leaves `reached_at` where it was unless the member actually moved up.
 * Running it twice is the same as running it once, so there is no receipt for
 * a key to return.
 *
 * It is also the only thing that ever creates a `user_progression` row, which
 * is why the button exists at all rather than the page refreshing silently:
 * a member with no row has no stage, and this is what gives them one.
 */
export async function refreshStage(_previous: ActionState): Promise<ActionState> {
  try {
    const receipt = await mutate<{ progression: { stage_code: string } | null }>(
      '/api/v1/progression/refreshes',
    );
    revalidatePath('/progression');
    return {
      status: 'ok',
      // The stage the database settled on, not the one the page was showing.
      message: receipt.progression
        ? `단계를 다시 계산했어요. 지금은 ‘${stageLabel(receipt.progression.stage_code)}’ 단계예요.`
        : '단계를 다시 계산했어요.',
    };
  } catch (error) {
    return failure(error, '지금은 단계를 다시 계산할 수 없어요.');
  }
}

/**
 * Pays down a loan, from the screen that shows it is overdue.
 *
 * The same route the wallet uses, because there is one repayment command and
 * `POST /api/v1/bank/loans/{id}/repayments` is it. Both pages are
 * revalidated: the loan the member just paid appears on each of them, and
 * leaving the other showing the old outstanding amount is how somebody comes
 * to pay twice.
 */
export async function repayLoan(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const loanId = String(formData.get('loanId') ?? '');
  const amount = wholeAmount(formData.get('amount'));

  if (!UUID.test(loanId)) return { status: 'error', message: '상환할 대출을 확인할 수 없어요.' };
  if (amount === null) return { status: 'error', message: '1 WLD 이상 정수만 상환할 수 있어요.' };

  try {
    const receipt = await mutate<{
      paidAmount: string;
      outstandingAmount: string;
      replayed: boolean;
    }>(`/api/v1/bank/loans/${encodeURIComponent(loanId)}/repayments`, {
      body: { amount, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/progression');
    revalidatePath('/wallet');

    // Both figures come back from the function. The amount actually taken is
    // capped at what was left, so reporting the number the member typed would
    // overstate a final payment.
    const paid = groupDigits(receipt.paidAmount);
    const left = groupDigits(receipt.outstandingAmount);
    if (receipt.replayed) {
      return {
        status: 'ok',
        message: `이미 처리된 상환 기록을 다시 확인했어요. 남은 상환액은 ${left} WLD예요.`,
      };
    }
    return {
      status: 'ok',
      message:
        receipt.outstandingAmount === '0'
          ? `${paid} WLD를 상환하고 대출을 모두 갚았어요.`
          : `${paid} WLD를 상환했어요. 남은 상환액은 ${left} WLD예요.`,
    };
  } catch (error) {
    return failure(error, '상환이 거절되었어요.');
  }
}
