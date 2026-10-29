'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { api, apiBytes } from '@/lib/api';
import { failure, mutate } from '@/lib/mutate';

/**
 * Sending a photo to the gallery.
 *
 * Two calls to the API, one submission for the member. The bytes go first
 * because the route that takes them reads the body raw -- the server decides
 * from the magic numbers whether it is an image at all, so nothing may be
 * wrapped around it -- and a caption cannot ride inside a PNG. The record
 * that names the file follows.
 *
 * If the second call fails the first has still written a file, and that is
 * the safe direction: a key with no row behind it is bytes nobody can reach,
 * because `content_storage_key_visible` answers from `photos` and there is no
 * row to answer from. The reverse -- a row naming a file that was never
 * written -- would be a gallery entry that renders as a broken image.
 */

/** Four megabytes, the cap the API applies to the same route. */
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const CAPTION_MAX = 300;
/** The opaque key returned by PrivateImageStorage, not a user-supplied path. */
const STORAGE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** HTTP 201 is not proof of a persisted member-owned submission. */
function validSubmissionReceipt(receipt: unknown, id: string): receipt is {
  photo_id: string; submitted_at: string; replayed: boolean;
} {
  return isRecord(receipt)
    && receipt.photo_id === id
    && typeof receipt.replayed === 'boolean'
    && typeof receipt.submitted_at === 'string'
    && Number.isFinite(Date.parse(receipt.submitted_at));
}

function matchesOwnerSubmission(
  result: unknown, id: string, storageKey: string, caption: string, submittedAt: string,
): boolean {
  if (!isRecord(result) || !Array.isArray(result.submissions)) return false;
  return result.submissions.some((row: unknown) => isRecord(row)
    && row.photo_id === id
    && row.image_url === `/media/${storageKey}`
    && row.alt_text === caption
    && typeof row.published === 'boolean'
    && typeof row.submitted_at === 'string'
    && Number.isFinite(Date.parse(row.submitted_at))
    && Date.parse(row.submitted_at) === Date.parse(submittedAt));
}

const UNCONFIRMED = '사진 접수 여부를 확인할 수 없어요. 다시 보내기 전에 이 페이지를 새로고침해 내 제출 목록을 확인해 주세요.';

export async function submitPhoto(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get('photo');
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', message: '올릴 사진을 선택해 주세요.' };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { status: 'error', message: '사진은 4MB 이하여야 해요.' };
  }

  const altText = String(formData.get('altText') ?? '').trim();
  if (altText === '') {
    // Required, and not merely encouraged: `photos.alt_text` is NOT NULL, and
    // a gallery of images with no description is unreadable to anybody using
    // a screen reader.
    return { status: 'error', message: '사진 설명을 적어 주세요. 화면을 읽어 주는 도구가 이 문장을 대신 읽어요.' };
  }
  if (altText.length > CAPTION_MAX) {
    return { status: 'error', message: `설명은 ${CAPTION_MAX}자 이내로 적어 주세요.` };
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const upload = await apiBytes<unknown>(
      '/api/v1/photos/uploads',
      await file.arrayBuffer(),
      { contentType: file.type || 'application/octet-stream', csrfToken },
    );
    if (!isRecord(upload) || typeof upload.storageKey !== 'string'
      || !STORAGE_KEY.test(upload.storageKey)) {
      return { status: 'error', message: UNCONFIRMED };
    }
    const storageKey = upload.storageKey;
    const idempotencyKey = randomUUID();
    const receipt = await mutate<unknown>('/api/v1/photos', {
      body: { storageKey, altText, idempotencyKey },
    });
    if (!validSubmissionReceipt(receipt, idempotencyKey)) {
      return { status: 'error', message: UNCONFIRMED };
    }
    // This is the authenticated member's own SECURITY DEFINER read, not the
    // public gallery, where the draft must remain invisible until review.
    const owned = await api<unknown>('/api/v1/photos/mine');
    if (!matchesOwnerSubmission(owned, idempotencyKey, storageKey, altText, receipt.submitted_at)) {
      return { status: 'error', message: UNCONFIRMED };
    }

    revalidatePath('/gallery/submit');
    return {
      status: 'ok',
      message: receipt.replayed
        ? '이미 보낸 사진이에요.'
        : '사진을 보냈어요. 운영자가 확인한 뒤 사진 게시판에 올라가요.',
    };
  } catch (error) {
    return failure(
      error,
      '사진 처리 결과를 확인하지 못했어요. 다시 보내기 전에 내 제출 목록을 확인해 주세요. PNG · JPEG · WebP만 지원하며 하루에 5장까지예요.',
    );
  }
}
