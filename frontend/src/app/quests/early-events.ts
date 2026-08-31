import { groupDigits } from '@/lib/money';

/**
 * 16.1's daily event and its first-day flow, as the quests screen reads them.
 *
 * Pure, and outside `page.tsx` for the reason `quests.ts` and `early-game.ts`
 * are: a page cannot be rendered in a test, and the sentence a member reads
 * about why a button is disabled can.
 *
 * One thing here is worth stating twice, because it is the whole design: the
 * day's event is a function of the member and the Seoul date, so refreshing
 * does not change it, and the claim sends no event -- only the day it was
 * looking at. There is nothing on this side of the wire that could choose an
 * event, and there must not be.
 */

/** `public.early_event_today` (103), as the API returns it. */
export interface TodayEvent {
  /** The Seoul day the database named. It goes back with the claim unchanged. */
  readonly event_date: string;
  readonly event_code: string;
  readonly event_label: string;
  readonly event_detail: string;
  readonly claim_label: string;
  /** Bigints, and one of them is WLD. They stay strings. */
  readonly reward_amount: string;
  /** What claiming now would actually pay, not what the catalogue declares. */
  readonly reward_experience: string;
  readonly experience_blocked: boolean;
  readonly reward_item_name: string | null;
  readonly reward_item_quantity: number;
  /** What 16.1 asks this event to change that nothing changes yet. */
  readonly pending_effect: string | null;
  readonly claimed: boolean;
  readonly claimed_at: string | null;
  readonly claim_transaction_id: string | null;
  /** null, 'claimed' or 'needs_work'. */
  readonly claim_block: string | null;
}

/** `public.early_event_claim` (103). */
export interface EventReceipt {
  readonly event_code: string;
  readonly event_label: string;
  readonly reward_amount: string;
  readonly experience_amount: string;
  readonly item_name: string | null;
  readonly item_quantity: number;
  readonly transaction_id: string | null;
  readonly replayed: boolean;
}

/** `public.early_first_day_flow` (103). */
export interface FirstDayStep {
  readonly step_code: string;
  readonly step_label: string;
  readonly step_detail: string;
  readonly step_href: string;
  readonly step_metric: string;
  /** False for a step nothing records. It is rendered as a link, not a tick. */
  readonly step_verified: boolean;
  readonly step_target: string;
  readonly step_progress: string;
  readonly step_unit: string;
  readonly step_done: boolean;
}

const INTEGER = /^-?\d+$/;

function positive(amount: string): boolean {
  return INTEGER.test(amount) && BigInt(amount) > 0n;
}

/**
 * What an event pays, as the parts it actually pays.
 *
 * BigInt rather than Number, for the reason every amount here avoids Number.
 * A part worth nothing is left out rather than rendered as a zero: "0 WLD"
 * beside a reward reads as a broken payout, and the sentences below say which
 * of the two a member is looking at.
 */
export function rewardParts(reward: {
  readonly amount: string;
  readonly experience: string;
  readonly itemName: string | null;
  readonly itemQuantity: number;
}): readonly string[] {
  const parts: string[] = [];
  if (positive(reward.amount)) parts.push(`${groupDigits(reward.amount)} WLD`);
  if (positive(reward.experience)) parts.push(`경험치 ${groupDigits(reward.experience)}`);
  if (reward.itemName !== null && reward.itemQuantity > 0) {
    parts.push(`${reward.itemName} ${reward.itemQuantity}개`);
  }
  return parts;
}

/** "40 WLD · 경험치 20", or a dash when there is nothing left to pay. */
export function rewardLine(event: TodayEvent): string {
  const parts = rewardParts({
    amount: event.reward_amount,
    experience: event.reward_experience,
    itemName: event.reward_item_name,
    itemQuantity: event.reward_item_quantity,
  });
  return parts.length === 0 ? '—' : parts.join(' · ');
}

/**
 * Why the button is disabled, in the member's own terms. Null when it is not.
 *
 * The two reasons are different days: one is finished and one has not started,
 * and a single "받을 수 없어요" would send the second member away without the
 * one thing they could do about it.
 */
export function eventBlockMessage(event: TodayEvent): string | null {
  if (event.claim_block === 'claimed') {
    return '오늘 사건은 이미 받았어요. 내일 한국 시간 자정에 새 사건이 열려요.';
  }
  if (event.claim_block === 'needs_work') {
    return '이 사건은 작업 경험치만 주는 사건이라, 작업 보상을 한 번 받은 뒤부터 받을 수 있어요.';
  }
  return null;
}

/**
 * Said only when the experience is missing but the event is still worth
 * taking. When the experience was the whole reward the block message already
 * says it, and saying both would be telling a member twice.
 */
export function experienceNote(event: TodayEvent): string | null {
  return event.experience_blocked && event.claim_block !== 'needs_work'
    ? '아직 작업 보상을 받은 적이 없어서 경험치는 쌓이지 않아요. 작업을 한 번 마치면 다음 사건부터 함께 들어와요.'
    : null;
}

/**
 * What 16.1 asks this event to do that the database does not do yet.
 *
 * Printed rather than hidden, and without a subject particle -- the values are
 * a mix of 받침 endings and picking one would be wrong half the time.
 */
export function pendingEffectNote(event: TodayEvent): string | null {
  return event.pending_effect === null ? null : `아직 준비 중 · ${event.pending_effect}`;
}

/** What the claim actually handed over, for the sentence under the button. */
export function claimMessage(receipt: EventReceipt): string {
  const parts = rewardParts({
    amount: receipt.reward_amount,
    experience: receipt.experience_amount,
    itemName: receipt.item_name,
    itemQuantity: receipt.item_quantity,
  });
  const got = parts.length === 0 ? '기록으로 남았어요' : `${parts.join(' · ')} 받았어요`;
  return receipt.replayed
    ? `이미 받은 사건이에요. ${got}`
    : `${receipt.event_label} · ${got}`;
}

/**
 * "2 / 4종", or null for a step nothing counts.
 *
 * The space before a Latin unit is not decoration: 'WLD' is a word and reads
 * as one, while 종 and 개 are counters that attach to the number.
 */
export function stepFigure(step: FirstDayStep): string | null {
  if (!step.step_verified) return null;
  if (!INTEGER.test(step.step_progress) || !INTEGER.test(step.step_target)) return null;
  const separator = /^[A-Za-z]/.test(step.step_unit) ? ' ' : '';
  return `${groupDigits(step.step_progress)} / ${groupDigits(step.step_target)}${separator}${
    step.step_unit
  }`;
}

/**
 * How much of the first day is actually recorded.
 *
 * Counted over the verified steps alone, and labelled as such: two of the
 * seven are a member going and looking, and folding them into the same
 * fraction would claim the application knows something it does not.
 */
export function firstDaySummary(steps: readonly FirstDayStep[]): string {
  const counted = steps.filter((step) => step.step_verified);
  const done = counted.filter((step) => step.step_done).length;
  return `기록으로 확인된 단계 ${done} / ${counted.length}`;
}
