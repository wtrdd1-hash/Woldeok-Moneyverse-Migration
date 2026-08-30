'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { api, apiBytes } from '@/lib/api';
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
      message: '이미지 주소는 https로 시작하는 주소이거나 이 사이트의 경로여야 해요.',
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

/** Four megabytes, the cap the API applies to the same route. */
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;

/**
 * Uploading a picture instead of naming one.
 *
 * Its own action and its own form: the settings form replaces every column
 * from what it holds, and a file input inside it would mean choosing a
 * picture and saving a display name were one submission that half-failed
 * together. This one writes a single column and leaves the rest alone.
 *
 * Bytes rather than JSON, through `apiBytes`, the way the gallery's upload
 * goes -- the API reads this route's body raw and decides from the magic
 * numbers whether it is an image at all.
 */
export async function uploadProfileImage(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', message: '올릴 이미지 파일을 선택해 주세요.' };
  }
  // Checked here so the member is told before four megabytes travel, and
  // again by the API, which is the one that decides.
  if (file.size > IMAGE_MAX_BYTES) {
    return { status: 'error', message: '이미지는 4MB 이하여야 해요.' };
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    await apiBytes<{ imagePath: string }>('/api/v1/profile/image', await file.arrayBuffer(), {
      contentType: file.type || 'application/octet-stream',
      csrfToken,
    });
    revalidatePath('/profile');
    return { status: 'ok', message: '프로필 사진을 바꿨어요.' };
  } catch (error) {
    return failure(error, '사진을 올리지 못했어요. PNG · JPEG · WebP만 올릴 수 있어요.');
  }
}

export async function removeProfileImage(
  _previous: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    await mutate('/api/v1/profile/image', { method: 'DELETE' });
    revalidatePath('/profile');
    return { status: 'ok', message: '프로필 사진을 내렸어요.' };
  } catch (error) {
    return failure(error, '사진을 내리지 못했어요.');
  }
}
