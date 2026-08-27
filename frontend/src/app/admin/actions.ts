'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';

/**
 * The operator console's writes.
 *
 * Every one of them reaches a database function that performs its own
 * operator check — `game_catalog_operator`, `admin_set_user_restriction`, and
 * so on. The guard on the controller decides who may call; the function
 * decides who may act. Neither this file nor the page it serves is part of
 * that decision, and the bounds repeated here exist only so an operator sees
 * which field is wrong rather than a validation document about a DTO.
 */

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function setUserRestriction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = text(formData.get('userId'));
  const restricted = formData.get('restricted') === 'true';
  const reason = text(formData.get('reason'));

  if (userId === '') return { status: 'error', message: '대상 사용자를 확인할 수 없어요.' };
  // The API requires a reason for both directions: lifting a restriction is
  // as much an audited act as applying one.
  if (reason === '' || reason.length > 2000) {
    return { status: 'error', message: '사유를 1~2000자로 입력해 주세요.' };
  }

  try {
    await mutate(`/api/v1/admin/users/${encodeURIComponent(userId)}/restriction`, {
      method: 'PUT',
      body: { restricted, reason },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: restricted ? '이용을 제한했어요.' : '제한을 해제했어요.' };
  } catch (error) {
    return failure(error, '제한 상태를 바꾸지 못했어요.');
  }
}

export async function createApproval(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const action = text(formData.get('action'));
  const rawPayload = text(formData.get('payload'));

  if (action === '' || action.length > 64) {
    return { status: 'error', message: '작업 키를 1~64자로 입력해 주세요.' };
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = rawPayload === '' ? {} : JSON.parse(rawPayload);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { status: 'error', message: 'payload는 JSON 객체여야 해요.' };
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return { status: 'error', message: 'payload의 JSON 형식을 확인해 주세요.' };
  }

  try {
    await mutate('/api/v1/admin/approvals', {
      body: { action, payload, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: '승인 요청을 등록했어요.' };
  } catch (error) {
    return failure(error, '승인 요청을 등록하지 못했어요.');
  }
}

export async function decideApproval(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const approvalRequestId = text(formData.get('approvalRequestId'));
  const decision = text(formData.get('decision'));
  const reason = text(formData.get('reason'));

  if (approvalRequestId === '') return { status: 'error', message: '요청을 확인할 수 없어요.' };
  if (decision !== 'approve' && decision !== 'reject') {
    return { status: 'error', message: '승인인지 반려인지 확인할 수 없어요.' };
  }

  try {
    await mutate(`/api/v1/admin/approvals/${encodeURIComponent(approvalRequestId)}/decisions`, {
      body: { decision, ...(reason === '' ? {} : { reason }) },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: decision === 'approve' ? '승인했어요.' : '반려했어요.' };
  } catch (error) {
    // A request the caller raised themselves is refused by the two-person
    // rule, which is the most common reason to land here.
    return failure(error, '처리하지 못했어요. 본인이 올린 요청은 본인이 승인할 수 없어요.');
  }
}

export async function createStock(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const symbol = text(formData.get('symbol'));
  const name = text(formData.get('name'));
  const description = text(formData.get('description'));
  const price = wholeAmount(formData.get('price'));

  if (symbol === '' || symbol.length > 12) {
    return { status: 'error', message: '종목 코드를 1~12자로 입력해 주세요.' };
  }
  if (name === '' || name.length > 100) {
    return { status: 'error', message: '종목명을 1~100자로 입력해 주세요.' };
  }
  if (price === null) return { status: 'error', message: '시작 가격은 1 이상 정수여야 해요.' };

  try {
    await mutate('/api/v1/admin/stocks', {
      body: { symbol, name, price, ...(description === '' ? {} : { description }) },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: `${symbol} 종목을 등록했어요.` };
  } catch (error) {
    return failure(error, '종목을 등록하지 못했어요. 코드가 이미 있는지 확인해 주세요.');
  }
}

export async function setStockActive(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const stockId = text(formData.get('stockId'));
  const active = formData.get('active') === 'true';
  if (stockId === '') return { status: 'error', message: '종목을 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/admin/stocks/${encodeURIComponent(stockId)}`, {
      method: 'PATCH',
      body: { active },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: active ? '거래를 재개했어요.' : '거래를 정지했어요.' };
  } catch (error) {
    return failure(error, '종목 상태를 바꾸지 못했어요.');
  }
}

export async function applyCorporateAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const stockId = text(formData.get('stockId'));
  const action = text(formData.get('action'));
  const factor = wholeAmount(formData.get('factor'));

  if (stockId === '') return { status: 'error', message: '종목을 확인할 수 없어요.' };
  if (action !== 'split' && action !== 'reverse_split') {
    return { status: 'error', message: '액면분할인지 병합인지 확인할 수 없어요.' };
  }
  if (factor === null) return { status: 'error', message: '비율은 1 이상 정수여야 해요.' };

  try {
    await mutate(`/api/v1/admin/stocks/${encodeURIComponent(stockId)}/corporate-actions`, {
      body: { action, factor, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: '기업 활동을 적용했어요.' };
  } catch (error) {
    return failure(error, '기업 활동을 적용하지 못했어요.');
  }
}

export async function setBusinessActive(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = text(formData.get('businessId'));
  const active = formData.get('active') === 'true';
  if (businessId === '') return { status: 'error', message: '사업을 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/admin/business-types/${encodeURIComponent(businessId)}`, {
      method: 'PATCH',
      body: { active },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: active ? '판매를 재개했어요.' : '판매를 중지했어요.' };
  } catch (error) {
    return failure(error, '사업 상태를 바꾸지 못했어요.');
  }
}

export async function createSeasonEvent(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = text(formData.get('title'));
  const description = text(formData.get('description'));
  const costWld = wholeAmount(formData.get('costWld'));
  const pointsPerEntry = wholeAmount(formData.get('pointsPerEntry'));

  if (title === '' || title.length > 100) {
    return { status: 'error', message: '제목을 1~100자로 입력해 주세요.' };
  }
  if (costWld === null) return { status: 'error', message: '참가비는 1 이상 정수여야 해요.' };
  if (pointsPerEntry === null) {
    return { status: 'error', message: '회당 점수는 1 이상 정수여야 해요.' };
  }

  try {
    await mutate('/api/v1/admin/season-events', {
      body: { title, costWld, pointsPerEntry, ...(description === '' ? {} : { description }) },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: '시즌 이벤트를 등록했어요.' };
  } catch (error) {
    return failure(error, '시즌 이벤트를 등록하지 못했어요.');
  }
}

export async function setSeasonEventActive(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventId = text(formData.get('eventId'));
  const active = formData.get('active') === 'true';
  if (eventId === '') return { status: 'error', message: '이벤트를 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/admin/season-events/${encodeURIComponent(eventId)}`, {
      method: 'PATCH',
      body: { active },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: active ? '이벤트를 재개했어요.' : '이벤트를 중지했어요.' };
  } catch (error) {
    return failure(error, '이벤트 상태를 바꾸지 못했어요.');
  }
}
