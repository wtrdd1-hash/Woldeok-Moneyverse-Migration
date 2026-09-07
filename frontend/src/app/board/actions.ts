'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiBytes } from '@/lib/api';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

/**
 * Mirrors the API's own limits so a member is told which field is wrong
 * instead of receiving a validation document about a DTO.
 */
function checkPost(title: string, body: string): ActionState | null {
  if (title === '' || title.length > 120) {
    return { status: 'error', message: '제목은 1~120자로 입력해 주세요.' };
  }
  if (body === '' || body.length > 5000) {
    return { status: 'error', message: '내용은 1~5000자로 입력해 주세요.' };
  }
  return null;
}

export async function createPost(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const photo = formData.get('photo');
  const imageAltText = String(formData.get('imageAltText') ?? '').trim();

  const invalid = checkPost(title, body);
  if (invalid) return invalid;
  if (photo instanceof File && photo.size > 4 * 1024 * 1024) {
    return { status: 'error', message: '사진은 4MB 이하여야 해요.' };
  }
  if (
    photo instanceof File &&
    photo.size > 0 &&
    (imageAltText === '' || imageAltText.length > 300)
  ) {
    return { status: 'error', message: '사진 설명은 1~300자로 입력해 주세요.' };
  }

  try {
    let imageStorageKey: string | undefined;
    if (photo instanceof File && photo.size > 0) {
      const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
      const upload = await apiBytes<{ storageKey: string }>(
        '/api/v1/board/images/uploads',
        await photo.arrayBuffer(),
        { contentType: photo.type || 'application/octet-stream', csrfToken },
      );
      imageStorageKey = upload.storageKey;
    }
    await mutate('/api/v1/board/posts', {
      body: {
        title,
        body,
        idempotencyKey: idempotencyKey(),
        ...(imageStorageKey ? { imageStorageKey, imageAltText } : {}),
      },
    });
    revalidatePath('/board');
    return { status: 'ok', message: '글을 등록했어요.' };
  } catch (error) {
    return failure(error, '지금은 글을 등록할 수 없어요.');
  }
}

export async function updatePost(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const postId = String(formData.get('postId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (postId === '') return { status: 'error', message: '수정할 글을 확인할 수 없어요.' };
  const invalid = checkPost(title, body);
  if (invalid) return invalid;

  try {
    await mutate(`/api/v1/board/posts/${encodeURIComponent(postId)}`, {
      method: 'PUT',
      body: { title, body, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/board');
    revalidatePath(`/board/${postId}`);
    return { status: 'ok', message: '글을 수정했어요.' };
  } catch (error) {
    return failure(error, '지금은 글을 수정할 수 없어요.');
  }
}

/**
 * Deletes, then leaves — the page this was submitted from no longer exists.
 *
 * `redirect` signals by throwing, so it is called after the try block rather
 * than inside it; a catch would swallow the signal and the member would sit
 * on a deleted post.
 */
export async function deletePost(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const postId = String(formData.get('postId') ?? '');
  if (postId === '') return { status: 'error', message: '삭제할 글을 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/board/posts/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
      body: { idempotencyKey: idempotencyKey() },
    });
  } catch (error) {
    return failure(error, '지금은 글을 삭제할 수 없어요.');
  }

  revalidatePath('/board');
  redirect('/board');
}

export async function createComment(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const postId = String(formData.get('postId') ?? '');
  const body = String(formData.get('body') ?? '').trim();

  if (postId === '') return { status: 'error', message: '댓글을 남길 글을 확인할 수 없어요.' };
  if (body === '' || body.length > 1000) {
    return { status: 'error', message: '댓글은 1~1000자로 입력해 주세요.' };
  }

  try {
    await mutate(`/api/v1/board/posts/${encodeURIComponent(postId)}/comments`, {
      body: { body, idempotencyKey: idempotencyKey() },
    });
    revalidatePath(`/board/${postId}`);
    return { status: 'ok', message: '댓글을 남겼어요.' };
  } catch (error) {
    return failure(error, '지금은 댓글을 남길 수 없어요.');
  }
}

export async function deleteComment(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const postId = String(formData.get('postId') ?? '');
  const commentId = String(formData.get('commentId') ?? '');
  if (postId === '' || commentId === '') {
    return { status: 'error', message: '삭제할 댓글을 확인할 수 없어요.' };
  }

  try {
    await mutate(
      `/api/v1/board/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
      { method: 'DELETE', body: { idempotencyKey: idempotencyKey() } },
    );
    revalidatePath(`/board/${postId}`);
    return { status: 'ok', message: '댓글을 삭제했어요.' };
  } catch (error) {
    return failure(error, '지금은 댓글을 삭제할 수 없어요.');
  }
}
