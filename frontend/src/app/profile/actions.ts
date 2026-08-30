'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';
import type { ProfileSettings } from './profile';
import {
  DISPLAY_NAME_MAX,
  IMAGE_URL_MAX,
  NO_TITLE,
  VISIBILITY_FIELDS,
  characters,
  fieldInputName,
  fieldVisibilityFrom,
  isImageAddress,
  isTitleCode,
  isVisibility,
  savedSentence,
} from './profile';

/**
 * The profile's one write.
 *
 * It carries no idempotency key, and that is not an omission. Every
 * money-moving function in this product takes one because a repeated request
 * would post a second ledger entry; `member_update_profile` is an upsert of
 * one row keyed by the member, so sending it twice stores the same settings
 * twice, which is the same settings. The DTO is validated with
 * `forbidNonWhitelisted`, so a key sent anyway would be answered 400 rather
 * than ignored -- `setSelfLimit` in `app/casino/actions.ts` is the same shape
 * for the same reason.
 *
 * It is a replacement and not a patch. 080 upserts every column from its
 * arguments, so a field this form leaves empty is *cleared*, not kept, and
 * the screen has to send the whole profile every time. That is why the form
 * is pre-filled from the read rather than starting blank.
 */
export async function saveProfile(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const visibility = String(formData.get('visibility') ?? '');
  if (!isVisibility(visibility)) {
    return { status: 'error', message: '공개 범위를 다시 선택해 주세요.' };
  }

  const displayName = String(formData.get('displayName') ?? '').trim();
  if (characters(displayName) > DISPLAY_NAME_MAX) {
    return { status: 'error', message: `이름은 ${DISPLAY_NAME_MAX}자 이내로 적어 주세요.` };
  }

  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  if (characters(imageUrl) > IMAGE_URL_MAX) {
    return { status: 'error', message: '이미지 주소가 너무 길어요.' };
  }
  // Checked here as well as in the API, which is the authority. A 400 from
  // there reads as "입력한 내용을 다시 확인해 주세요" and never says which of
  // the five fields it meant.
  if (imageUrl !== '' && !isImageAddress(imageUrl)) {
    return {
      status: 'error',
      message: '이미지 주소는 http로 시작하는 주소이거나 이 사이트의 경로여야 해요.',
    };
  }

  const featuredTitle = String(formData.get('featuredTitle') ?? NO_TITLE);
  if (featuredTitle !== NO_TITLE && !isTitleCode(featuredTitle)) {
    return { status: 'error', message: '대표 칭호를 다시 선택해 주세요.' };
  }

  // `as const` so the tuple overload of `fromEntries` applies: without it the
  // entries are `string[][]`, TypeScript falls through to the `any` overload
  // and the map below loses its type on the way into the action.
  const chosen = Object.fromEntries(
    VISIBILITY_FIELDS.map(
      (field) => [field.key, String(formData.get(fieldInputName(field.key)) ?? '')] as const,
    ),
  );
  const fieldVisibility = fieldVisibilityFrom(chosen);
  if (fieldVisibility === null) {
    return { status: 'error', message: '항목별 공개 범위를 다시 선택해 주세요.' };
  }

  try {
    const { settings } = await mutate<{ settings: ProfileSettings }>('/api/v1/profile', {
      method: 'PUT',
      body: {
        visibility,
        fieldVisibility,
        // Omitted rather than sent empty: the DTO takes a string or nothing,
        // and nothing is how a cleared field reaches the function as NULL.
        ...(displayName === '' ? {} : { displayName }),
        ...(imageUrl === '' ? {} : { imageUrl }),
        ...(featuredTitle === NO_TITLE ? {} : { featuredTitle }),
      },
    });
    revalidatePath('/profile');
    return { status: 'ok', message: savedSentence(settings) };
  } catch (error) {
    // A 409 here is almost always the title: 080 refuses one the member has
    // never been awarded, and no granted function lists the ones they have,
    // so the control cannot rule it out before sending.
    return failure(
      error,
      '프로필을 저장하지 못했어요. 받은 적이 없는 칭호를 골랐는지 확인해 주세요.',
    );
  }
}
