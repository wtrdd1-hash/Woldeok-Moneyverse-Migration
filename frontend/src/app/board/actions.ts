'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

export async function createPost(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  // Mirrors the API's own limits so a member is told which field is wrong
  // instead of receiving a validation document about a DTO.
  if (title === '' || title.length > 120) {
    return { status: 'error', message: '제목은 1~120자로 입력해 주세요.' };
  }
  if (body === '' || body.length > 5000) {
    return { status: 'error', message: '내용은 1~5000자로 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/board/posts', {
      body: { title, body, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/board');
    return { status: 'ok', message: '글을 등록했어요.' };
  } catch (error) {
    return failure(error, '지금은 글을 등록할 수 없어요.');
  }
}

export async function deletePost(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const postId = String(formData.get('postId') ?? '');
  if (postId === '') return { status: 'error', message: '삭제할 글을 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/board/posts/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/board');
    return { status: 'ok', message: '글을 삭제했어요.' };
  } catch (error) {
    return failure(error, '지금은 글을 삭제할 수 없어요.');
  }
}
