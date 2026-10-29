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

/** A success response is not proof that privacy controls were stored. */
function matchesProfileSettings(
  value: unknown,
  expected: ProfileSettings,
): value is ProfileSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const actual = value as Record<string, unknown>;
  if (
    actual.visibility !== expected.visibility ||
    actual.display_name !== expected.display_name ||
    actual.image_url !== expected.image_url ||
    actual.featured_title !== expected.featured_title
  )
    return false;
  const fields = actual.field_visibility;
  if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) return false;
  const map = fields as Record<string, unknown>;
  const keys = Object.keys(map);
  return (
    keys.length === Object.keys(expected.field_visibility).length &&
    keys.every(
      (key) =>
        Object.hasOwn(expected.field_visibility, key) &&
        map[key] === expected.field_visibility[key],
    )
  );
}

const UNVERIFIED_PROFILE_SAVE =
  '프로필 공개 설정의 저장 결과를 확인하지 못했어요. 새로고침 후 실제 공개 범위를 확인해 주세요.';

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
    const expected: ProfileSettings = {
      visibility,
      display_name: displayName || null,
      image_url: imageUrl || null,
      field_visibility: fieldVisibility,
      featured_title: featuredTitle === NO_TITLE ? null : featuredTitle,
    };
    const receipt = await mutate<{ settings: unknown }>('/api/v1/profile', {
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
    if (!matchesProfileSettings(receipt?.settings, expected)) {
      return { status: 'error', message: UNVERIFIED_PROFILE_SAVE };
    }
    // This owner-only read is served by member_profile_settings, not the
    // public profile view, which intentionally hides the per-field controls.
    let persisted: { settings: unknown };
    try {
      persisted = await api<{ settings: unknown }>('/api/v1/profile/settings');
    } catch {
      return { status: 'error', message: UNVERIFIED_PROFILE_SAVE };
    }
    if (!matchesProfileSettings(persisted?.settings, expected)) {
      return { status: 'error', message: UNVERIFIED_PROFILE_SAVE };
    }
    revalidatePath('/profile');
    return { status: 'ok', message: savedSentence(persisted.settings) };
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

// The server generates a UUID storage key; do not trust an HTTP success body
// to name an external image, or to prove that the owner row was changed.
const STORED_IMAGE_PATH = /^\/media\/profile\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:png|jpg|webp)$/;

async function ownerImageReadback(): Promise<string | null> {
  const response: unknown = await api<unknown>('/api/v1/profile/settings');
  if (typeof response !== 'object' || response === null || !('settings' in response) ||
    typeof response.settings !== 'object' || response.settings === null ||
    !('image_url' in response.settings)) {
    throw new Error('owner profile image readback is unavailable');
  }
  const stored = response.settings.image_url;
  if (stored !== null && typeof stored !== 'string') {
    throw new Error('owner profile image readback has an invalid value');
  }
  return stored;
}

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
    const receipt: unknown = await apiBytes<unknown>('/api/v1/profile/image', await file.arrayBuffer(), {
      contentType: file.type || 'application/octet-stream',
      csrfToken,
    });
    if (typeof receipt !== 'object' || receipt === null || !('imagePath' in receipt) ||
      typeof receipt.imagePath !== 'string' || !STORED_IMAGE_PATH.test(receipt.imagePath)) {
      throw new Error('profile image upload receipt is invalid');
    }
    if (await ownerImageReadback() !== receipt.imagePath) {
      throw new Error('profile image upload was not confirmed by owner settings');
    }
    revalidatePath('/profile');
    return { status: 'ok', message: '프로필 사진을 바꿨어요.' };
  } catch (error) {
    return failure(error, '사진 변경을 확인할 수 없어요. 새로고침 후 프로필 사진을 확인해 주세요.');
  }
}

export async function removeProfileImage(
  _previous: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    await mutate('/api/v1/profile/image', { method: 'DELETE' });
    if (await ownerImageReadback() !== null) {
      throw new Error('profile image removal was not confirmed by owner settings');
    }
    revalidatePath('/profile');
    return { status: 'ok', message: '프로필 사진을 내렸어요.' };
  } catch (error) {
    return failure(error, '사진 삭제를 확인할 수 없어요. 새로고침 후 프로필 사진을 확인해 주세요.');
  }
}
