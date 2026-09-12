'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { api, apiBytes } from '@/lib/api';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

export async function createStockAwarePost(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const stockSymbol = String(formData.get('stockSymbol') ?? '').trim().toUpperCase();
  const category = String(formData.get('category') ?? 'question');
  const stance = String(formData.get('stance') ?? 'none');
  const positionDisclosure = String(formData.get('positionDisclosure') ?? 'undisclosed');
  const photo = formData.get('photo');
  const imageAltText = String(formData.get('imageAltText') ?? '').trim();
  if (!title || title.length > 120 || !body || body.length > 5000) return { status: 'error', message: '제목과 내용을 확인해 주세요.' };
  if (stockSymbol && !/^[A-Z0-9._-]{1,16}$/.test(stockSymbol)) return { status: 'error', message: '종목코드를 확인해 주세요.' };
  if (stockSymbol && category === 'analysis' && positionDisclosure === 'undisclosed') return { status: 'error', message: '분석 글은 보유 관계를 공개해 주세요.' };
  if (photo instanceof File && photo.size > 4 * 1024 * 1024) return { status: 'error', message: '사진은 4MB 이하여야 해요.' };
  if (photo instanceof File && photo.size > 0 && (!imageAltText || imageAltText.length > 300)) return { status: 'error', message: '사진 설명은 1~300자로 입력해 주세요.' };
  try {
    let imageStorageKey: string | undefined;
    if (photo instanceof File && photo.size > 0) {
      const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
      const upload = await apiBytes<{ storageKey: string }>('/api/v1/board/images/uploads', await photo.arrayBuffer(), { contentType: photo.type || 'application/octet-stream', csrfToken });
      imageStorageKey = upload.storageKey;
    }
    const common = { title, body, idempotencyKey: idempotencyKey(), ...(imageStorageKey ? { imageStorageKey, imageAltText } : {}) };
    if (stockSymbol) {
      await mutate('/api/v1/board/stock-posts', { body: { ...common, stockSymbol, category, stance, positionDisclosure } });
    } else {
      await mutate('/api/v1/board/posts', { body: common });
    }
    revalidatePath('/board');
    return { status: 'ok', message: stockSymbol ? '종목 토론 글을 등록했어요.' : '글을 등록했어요.' };
  } catch (error) {
    return failure(error, '지금은 글을 등록할 수 없어요.');
  }
}
