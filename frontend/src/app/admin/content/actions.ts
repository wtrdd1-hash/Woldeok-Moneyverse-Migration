'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { api, apiBytes } from '@/lib/api';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

/**
 * The content desk's writes.
 *
 * Saving and publishing are two records on purpose, exactly as the original
 * had them: a draft is a draft until someone publishes it, and the audit
 * trail should show which act happened when. "저장 후 바로 공개" is therefore
 * two calls, not a flag on one.
 */

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function setPublication(
  kind: 'announcements' | 'photos',
  id: string,
  publish: boolean,
): Promise<void> {
  await mutate(`/api/v1/admin/${kind}/${encodeURIComponent(id)}/publication`, {
    method: 'PUT',
    body: { publish, idempotencyKey: idempotencyKey() },
  });
}

export async function saveAnnouncement(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = text(formData.get('title'));
  const body = text(formData.get('body'));
  const announcementId = text(formData.get('announcementId'));
  const publishNow = formData.get('publishNow') === 'on';
  const file = formData.get('file');
  const rawImageAltText = text(formData.get('imageAltText'));
  const imageAltText = rawImageAltText || title.slice(0, 100);

  if (title === '' || title.length > 160) {
    return { status: 'error', message: '제목을 1~160자로 입력해 주세요.' };
  }
  if (body === '' || body.length > 12_000) {
    return { status: 'error', message: '내용을 1~12000자로 입력해 주세요.' };
  }
  if (file instanceof File && file.size > 0 && imageAltText.length > 300) {
    return { status: 'error', message: '이미지 대체 텍스트를 300자 이내로 입력해 주세요.' };
  }

  try {
    const receipt = await mutate<{ announcementId: string }>('/api/v1/admin/announcements', {
      body: {
        title,
        body,
        idempotencyKey: idempotencyKey(),
        ...(announcementId === '' ? {} : { announcementId }),
      },
    });
    if (file instanceof File && file.size > 0) {
      const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
      const uploaded = await apiBytes<{ storageKey: string }>(
        '/api/v1/admin/photos',
        await file.arrayBuffer(),
        { contentType: file.type || 'application/octet-stream', csrfToken },
      );
      await mutate(
        '/api/v1/admin/announcements/' + encodeURIComponent(receipt.announcementId) + '/image',
        {
          method: 'PUT',
          body: {
            storageKey: uploaded.storageKey,
            altText: imageAltText,
            idempotencyKey: idempotencyKey(),
          },
        },
      );
    }
    if (publishNow) await setPublication('announcements', receipt.announcementId, true);
    revalidatePath('/admin/content');
    revalidatePath('/announcements');
    return {
      status: 'ok',
      message: `공지를 ${publishNow ? '저장하고 공개했어요' : '초안으로 저장했어요'}. ID ${receipt.announcementId}`,
    };
  } catch (error) {
    return failure(error, '공지를 저장하지 못했어요.');
  }
}

export async function savePhoto(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get('file');
  const altText = text(formData.get('altText'));
  const imageUrl = text(formData.get('imageUrl'));
  const photoId = text(formData.get('photoId'));
  const publishNow = formData.get('publishNow') === 'on';
  let storageKey = text(formData.get('storageKey'));

  if (altText === '' || altText.length > 300) {
    return { status: 'error', message: '대체 텍스트를 1~300자로 입력해 주세요.' };
  }
  // Structural only. The authoritative hostname allowlist lives in
  // PostgreSQL, outside this application's role, and it decides.
  if (!imageUrl.startsWith('https://') || imageUrl.length > 2048) {
    return { status: 'error', message: '승인된 HTTPS 이미지 주소를 입력해 주세요.' };
  }

  try {
    // Upload first when a file was chosen: the store generates the key, so
    // the metadata record cannot be written before the bytes exist.
    if (file instanceof File && file.size > 0) {
      const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
      const uploaded = await apiBytes<{ storageKey: string }>(
        '/api/v1/admin/photos',
        await file.arrayBuffer(),
        { contentType: file.type || 'application/octet-stream', csrfToken },
      );
      storageKey = uploaded.storageKey;
    }

    if (storageKey === '') {
      return { status: 'error', message: '사진 파일을 올리거나 내부 보관 키를 입력해 주세요.' };
    }

    const receipt = await mutate<{ photoId: string }>('/api/v1/admin/photos/metadata', {
      body: {
        storageKey,
        imageUrl,
        altText,
        idempotencyKey: idempotencyKey(),
        ...(photoId === '' ? {} : { photoId }),
      },
    });
    if (publishNow) await setPublication('photos', receipt.photoId, true);
    revalidatePath('/admin/content');
    revalidatePath('/gallery');
    return {
      status: 'ok',
      message: `사진을 ${publishNow ? '등록하고 공개했어요' : '초안으로 등록했어요'}. ID ${receipt.photoId}`,
    };
  } catch (error) {
    return failure(error, '사진을 등록하지 못했어요.');
  }
}

export async function changePublication(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const kind = text(formData.get('kind'));
  const itemId = text(formData.get('itemId'));
  const publish = text(formData.get('publish')) === 'true';

  if (kind !== 'announcements' && kind !== 'photos') {
    return { status: 'error', message: '항목 종류를 확인할 수 없어요.' };
  }
  if (itemId === '') return { status: 'error', message: '항목 ID를 입력해 주세요.' };

  try {
    await setPublication(kind, itemId, publish);
    revalidatePath('/admin/content');
    revalidatePath(kind === 'announcements' ? '/announcements' : '/gallery');
    return { status: 'ok', message: publish ? '공개로 기록했어요.' : '비공개로 기록했어요.' };
  } catch (error) {
    return failure(error, '공개 상태를 바꾸지 못했어요.');
  }
}
