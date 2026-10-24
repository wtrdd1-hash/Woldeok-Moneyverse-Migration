'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLOTS = new Set(['frame', 'background', 'effect', 'nameplate', 'title', 'badge_1', 'badge_2', 'badge_3']);

interface EquipReceipt {
  readonly success: boolean;
  readonly catalog_id: string;
  readonly slot: string;
  readonly is_equipped: boolean;
}

/** The database-owned inventory_equip_item receipt, never a client-side optimistic success. */
export async function equipHeldItem(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const catalogId = formData.get('catalogId');
  const slot = formData.get('slot');
  const rawEquip = formData.get('equip');
  if (
    typeof catalogId !== 'string' || !UUID.test(catalogId) ||
    typeof slot !== 'string' || !SLOTS.has(slot) ||
    (rawEquip !== 'true' && rawEquip !== 'false')
  ) {
    return { status: 'error', message: '장착할 아이템과 위치를 확인해 주세요.' };
  }

  const equip = rawEquip === 'true';
  try {
    // mutate obtains a one-use CSRF token and relays the caller's session from Next to NestJS.
    const receipt = await mutate<EquipReceipt>(
      `/api/v1/shop/holdings/${encodeURIComponent(catalogId)}/equip`,
      { body: { slot, equip } },
    );
    if (
      receipt?.success !== true ||
      typeof receipt.catalog_id !== 'string' ||
      receipt.catalog_id.toLowerCase() !== catalogId.toLowerCase() ||
      receipt.slot !== slot || receipt.is_equipped !== equip
    ) {
      return { status: 'error', message: '서버에서 장착 결과를 확인하지 못했어요. 보관함을 새로고침해 주세요.' };
    }
    revalidatePath('/inventory');
    revalidatePath('/profile');
    return { status: 'ok', message: equip ? '서버에서 장착을 확인했어요.' : '서버에서 장착 해제를 확인했어요.' };
  } catch (error) {
    return failure(error, '지금은 장착 상태를 변경할 수 없어요. 잠시 후 다시 시도해 주세요.');
  }
}
