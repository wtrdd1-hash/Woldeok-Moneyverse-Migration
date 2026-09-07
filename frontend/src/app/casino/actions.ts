'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { canonicalIntegerString, groupDigits } from '@/lib/money';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';
import {
  CLOSURE_COPY,
  absAmount,
  closureOf,
  faceLabel,
  isLockChoice,
  lockUntilIso,
  resultOf,
  selfLimitAmount,
} from './coin';
import type { PlayResult } from './coin';
import { faceRolled, isDieFace, isParityChoice, parityLabel } from './dice';


export interface CasinoPlayState extends ActionState {
  readonly result?: PlayResult;
  readonly netAmount?: string;
  readonly replayed?: boolean;
  readonly outcomeFace?: number;
  readonly coinOutcome?: string;
}

export const CASINO_IDLE: CasinoPlayState = { status: 'idle' };

function resultTone(result: PlayResult): NonNullable<ActionState['tone']> {
  if (result === 'win') return 'success';
  if (result === 'loss') return 'negative';
  return 'neutral';
}

/**
 * The coin game's two writes.
 *
 * Neither sends a price, a payout or an outcome. The browser sends a face and
 * a stake and nothing else; `casino_play_coin` draws the byte, decides the
 * result, posts both legs of the ledger entry and records the play inside one
 * transaction, and the receipt reports what it did. There is no parameter
 * here through which a member could influence the odds, and there must never
 * be one.
 */

/**
 * A closure is not a failure the member caused, so it does not go through
 * `failure()`.
 *
 * `failure()` decides its sentence from the status, and both of the casino's
 * closures collide with something else there: 403 would read as "you do not
 * have permission" and 503 as "the service is unstable". Neither is what
 * happened, and neither tells the member whether waiting will help. The API
 * sends a `code` for exactly this reason.
 */
function closedOr(error: unknown, fallback: string): CasinoPlayState {
  const closure = closureOf(error);
  if (closure) return { status: 'error', message: CLOSURE_COPY[closure].title };
  return failure(error, fallback);
}

interface PlayReceipt {
  readonly play_id: string;
  readonly outcome: string;
  readonly net_amount: unknown;
  readonly replayed: boolean;
}

export async function playCoin(_previous: CasinoPlayState, formData: FormData): Promise<CasinoPlayState> {
  const choice = String(formData.get('choice') ?? '');
  const stake = wholeAmount(formData.get('stake'));

  if (choice !== 'heads' && choice !== 'tails') {
    return { status: 'error', message: '앞면과 뒷면 중 하나를 골라 주세요.' };
  }
  // Only what the member can fix themselves. The minimum and the maximum live
  // in `casino_policy` and an operator moves them without a deploy, so copying
  // today's range here would start refusing stakes the policy allows.
  if (stake === null) {
    return { status: 'error', message: '1 WLD 이상 정수만 걸 수 있어요.' };
  }

  try {
    const receipt = await mutate<PlayReceipt>('/api/v1/casino/coin/plays', {
      body: { choice, stake, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/casino');

    // Every figure in the sentence is the one the database returned. The
    // stake that was sent is not reported back as the result: a replay
    // answers with the stored play, which may have been for a different
    // amount than the form currently holds.
    const face = faceLabel(receipt.outcome);
    const netAmount = canonicalIntegerString(receipt.net_amount);
    if (netAmount === null) throw new TypeError('casino coin receipt returned an invalid net amount');
    const amount = groupDigits(absAmount(netAmount));
    const result = resultOf(netAmount);
    const outcome =
      result === 'win'
        ? `${face}이 나왔어요. ${amount} WLD를 얻었어요.`
        : result === 'loss'
          ? `${face}이 나왔어요. ${amount} WLD를 잃었어요.`
          : `${face}이 나왔어요.`;

    return {
      status: 'ok',
      message: receipt.replayed ? `이미 처리된 판이에요. ${outcome}` : outcome,
      tone: resultTone(result),
      result,
      netAmount,
      replayed: receipt.replayed,
      coinOutcome: receipt.outcome,
    };
  } catch (error) {
    return closedOr(
      error,
      '이번 판은 받아들여지지 않았어요. 잔액과 오늘 남은 한도, 내가 건 잠금을 다시 확인해 주세요.',
    );
  }
}

interface SelfLimitReceipt {
  readonly daily_bet_limit: unknown;
  readonly daily_loss_limit: unknown;
  readonly locked_until: string | null;
}

/**
 * The member's own daily caps, and optionally a lock they cannot lift.
 *
 * No idempotency key: this is an upsert of one row keyed by the member rather
 * than an event, so sending it twice sets the same limits twice, which is the
 * same limits. The API takes the actor and the three values and nothing else.
 */
export async function setSelfLimit(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dailyBetLimit = selfLimitAmount(formData.get('dailyBetLimit'));
  const dailyLossLimit = selfLimitAmount(formData.get('dailyLossLimit'));
  const lock = String(formData.get('lock') ?? 'none');

  if (dailyBetLimit === null) {
    return { status: 'error', message: '하루 베팅 한도는 0 이상 정수로 입력해 주세요.' };
  }
  if (dailyLossLimit === null) {
    return { status: 'error', message: '하루 손실 한도는 0 이상 정수로 입력해 주세요.' };
  }
  if (!isLockChoice(lock)) {
    return { status: 'error', message: '잠금 기간을 다시 선택해 주세요.' };
  }

  const lockedUntil = lockUntilIso(lock, new Date());

  try {
    const receipt = await mutate<SelfLimitReceipt>('/api/v1/casino/self-limit', {
      method: 'PUT',
      body: {
        dailyBetLimit,
        dailyLossLimit,
        ...(lockedUntil === null ? {} : { lockedUntil }),
      },
    });
    revalidatePath('/casino');

    const stored =
      `하루 베팅 한도 ${groupDigits(receipt.daily_bet_limit)} WLD, ` +
      `하루 손실 한도 ${groupDigits(receipt.daily_loss_limit)} WLD로 저장했어요.`;
    return {
      status: 'ok',
      message: receipt.locked_until
        ? `${stored} 잠금이 풀릴 때까지 카지노 플레이와 한도 변경이 모두 차단돼요.`
        : stored,
    };
  } catch (error) {
    // A 409 here is most often the lock the member set earlier: the database
    // refuses to loosen a locked limit, which is the entire point of it.
    return closedOr(
      error,
      '한도를 바꾸지 못했어요. 이미 걸어 둔 잠금이 아직 풀리지 않았을 수 있어요.',
    );
  }
}

interface DiceReceipt {
  readonly play_id: string;
  readonly outcome_face: number;
  readonly net_amount: unknown;
  readonly replayed: boolean;
}

/**
 * One roll of the die, for whichever of the two games asked for it.
 *
 * The game is a parameter of this function and never a form field. Two exports
 * that each name their own game mean the game cannot be swapped by whatever
 * posts to the action, and the choice is still checked here against the rule
 * that game plays by -- `casino_dice_is_win` refuses the same pairs, and this
 * is only the sentence the member reads instead of a 409.
 */
async function rollDie(
  game: 'dice_parity' | 'dice_number',
  formData: FormData,
  choiceIsValid: (choice: string) => boolean,
  choiceHelp: string,
): Promise<CasinoPlayState> {
  const choice = String(formData.get('choice') ?? '');
  const stake = wholeAmount(formData.get('stake'));

  if (!choiceIsValid(choice)) {
    return { status: 'error', message: choiceHelp };
  }
  if (stake === null) {
    return { status: 'error', message: '1 WLD 이상 정수만 걸 수 있어요.' };
  }

  try {
    const receipt = await mutate<DiceReceipt>('/api/v1/casino/dice/plays', {
      body: { game, choice, stake, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/casino');

    // Every figure comes from the database's receipt. The stake that was sent
    // is never reported back as the result: a replay answers with the stored
    // roll, which may have been for a different amount than the form holds.
    const face = faceRolled(receipt.outcome_face);
    const netAmount = canonicalIntegerString(receipt.net_amount);
    if (netAmount === null) throw new TypeError('casino dice receipt returned an invalid net amount');
    const amount = groupDigits(absAmount(netAmount));
    const result = resultOf(netAmount);
    const outcome =
      result === 'win'
        ? `주사위는 ${face}이 나왔어요. ${amount} WLD를 얻었어요.`
        : result === 'loss'
          ? `주사위는 ${face}이 나왔어요. ${amount} WLD를 잃었어요.`
          : `주사위는 ${face}이 나왔어요.`;

    const outcomeFace =
      Number.isInteger(receipt.outcome_face) && receipt.outcome_face >= 1 && receipt.outcome_face <= 6
        ? receipt.outcome_face
        : null;
    return {
      status: 'ok',
      message: receipt.replayed ? `이미 처리된 판이에요. ${outcome}` : outcome,
      tone: resultTone(result),
      result,
      netAmount,
      replayed: receipt.replayed,
      ...(outcomeFace === null ? {} : { outcomeFace }),
    };
  } catch (error) {
    return closedOr(
      error,
      '이번 판은 받아들여지지 않았어요. 잔액과 오늘 남은 한도, 내가 건 잠금을 다시 확인해 주세요.',
    );
  }
}

export async function playDiceParity(
  _previous: CasinoPlayState,
  formData: FormData,
): Promise<CasinoPlayState> {
  return rollDie('dice_parity', formData, isParityChoice, '홀과 짝 중 하나를 골라 주세요.');
}

export async function playDiceNumber(
  _previous: CasinoPlayState,
  formData: FormData,
): Promise<CasinoPlayState> {
  return rollDie('dice_number', formData, isDieFace, '1부터 6 사이의 숫자를 골라 주세요.');
}

/** Re-exported so nothing else has to import two modules for one label. */
export { parityLabel };
