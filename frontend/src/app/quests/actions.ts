'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { claimMessage } from './early-events';
import type { EventReceipt } from './early-events';
import { npcOrderMessage, preferenceMessage } from './quests';
import type { NpcOrderReceipt } from './quests';

/**
 * The engagement loop's three writes.
 *
 * None of them sends a reward, a target or a count of anything the server can
 * read for itself. `engagement_record_progress` reads the catalogue entry
 * inside the same transaction that grants what it hands over, and
 * `engagement_record_npc_order` decides that an order is worth one point of
 * affinity and one step of `neighbour_help`. There is no parameter here
 * through which a member could influence either, and there must not be one.
 */

/**
 * The shape 081 puts a CHECK on for both `engagement_catalog.code` and
 * `npc_profiles.code`.
 *
 * Checked here because a code that does not match cannot have come from the
 * board or from `NPCS` -- it is a broken form rather than a mistyped field,
 * and sending it would cost a round trip to be told the same thing in
 * English. It is not a second opinion about which goals exist: that answer
 * belongs to the database, and an unknown-but-well-formed code still goes.
 */
const CODE = /^[a-z0-9_]{3,64}$/;

export async function orderFromNpc(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = String(formData.get('npcCode') ?? '');
  if (!CODE.test(code)) return { status: 'error', message: '주문을 받을 NPC를 확인할 수 없어요.' };

  try {
    const receipt = await mutate<NpcOrderReceipt>(
      `/api/v1/engagement/npcs/${encodeURIComponent(code)}/orders`,
      { body: { idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/quests');
    return { status: 'ok', message: npcOrderMessage(receipt) };
  } catch (error) {
    return failure(
      error,
      '지금은 주문을 받을 수 없어요. 오늘은 이 NPC의 주문이 닫혀 있을 수 있어요.',
    );
  }
}

/**
 * Whether the member hears about their goals.
 *
 * No idempotency key: this replaces one row keyed by the member rather than
 * recording an event, so sending it twice leaves the same preference behind.
 * The sentence is written from what the API answered rather than from what
 * the form sent, so a preference that did not change does not claim to have.
 */
export async function setNotifications(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const choice = String(formData.get('notificationsEnabled') ?? '');
  // Read strictly rather than as "anything but the empty string is on": an
  // unchecked box submits nothing at all, and treating an absent field as
  // false would turn a broken form into a silent opt-out.
  if (choice !== 'true' && choice !== 'false') {
    return { status: 'error', message: '알림 설정을 다시 선택해 주세요.' };
  }

  try {
    const saved = await mutate<{ notifications_enabled: boolean }>(
      '/api/v1/engagement/preferences',
      { method: 'PUT', body: { notificationsEnabled: choice === 'true' } },
    );
    revalidatePath('/quests');
    return { status: 'ok', message: preferenceMessage(saved.notifications_enabled) };
  } catch (error) {
    return failure(error, '알림 설정을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
}

/**
 * The shape of a Seoul day, as the read model hands it over.
 *
 * Checked here because a value that does not match cannot have come from the
 * card -- it is a broken form rather than a mistyped field. It is not a second
 * opinion about which day it is: that answer belongs to the database, which
 * refuses any day but today in Seoul.
 */
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Taking the day's random event.
 *
 * The form sends the day it was showing and nothing else. There is no event
 * field, and there must not be one: `early_event_claim` (103) draws the event
 * from a hash of the member and the Seoul date and pays what that draw
 * returns, so refreshing until a better one appears is not a thing this
 * screen -- or a hand-written request -- can do. The day is sent so that a
 * page left open across midnight is refused instead of quietly claiming a day
 * the member never saw.
 */
export async function claimTodayEvent(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventDate = String(formData.get('eventDate') ?? '');
  if (!DAY.test(eventDate)) {
    return { status: 'error', message: '오늘의 사건을 확인할 수 없어요. 새로고침해 주세요.' };
  }

  try {
    const receipt = await mutate<EventReceipt>('/api/v1/early-game/claims', {
      body: { idempotencyKey: idempotencyKey(), eventDate },
    });
    revalidatePath('/quests');
    revalidatePath('/wallet');
    return { status: 'ok', message: claimMessage(receipt) };
  } catch (error) {
    // 103 answers a second claim with 23505 and a not-yet-claimable event with
    // 22023, and both arrive as a conflict. Already taken is much the likelier
    // of the two, so it is the sentence a conflict gets.
    return failure(
      error,
      '오늘 사건은 이미 받았거나, 아직 받을 수 없어요. 화면을 새로고침해 확인해 주세요.',
    );
  }
}
