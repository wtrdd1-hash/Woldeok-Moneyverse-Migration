'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { ApiError } from '@/lib/api';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { STEP_UP_CODE, spendSecondFactorCode } from '../../step-up';
import { AI_NEWS_SENTENCES } from './sentences';

/**
 * The AI newsroom's writes. The model's refusals arrive as 503s with a
 * stable `code`, and each has its own sentence: "the key was refused" and
 * "the address is wrong" send an operator to different fields.
 */

const PAGE = '/admin/market/ai-news';
const CODE_REQUIRED = { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' } as const;

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function explain(error: unknown, fallback: string): ActionState {
  if (error instanceof ApiError) {
    if (error.code && AI_NEWS_SENTENCES[error.code]) return { status: 'error', message: AI_NEWS_SENTENCES[error.code]! };
    if (error.code === 'ai_news_refused' && error.detail?.includes('reversal')) {
      return { status: 'error', message: '여섯 시간 안에는 반대 방향의 강력한 소식을 낼 수 없어요. 강도를 낮추거나 시간을 두세요.' };
    }
    if (error.code === 'ai_news_refused' && error.detail?.includes('no longer open')) {
      return { status: 'error', message: '이미 결정된 시나리오예요. 새로고침해 주세요.' };
    }
  }
  return failure(error, fallback);
}

export async function saveAiNewsSettings(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const apiBaseUrl = text(formData.get('apiBaseUrl'));
  const model = text(formData.get('model'));
  const apiKey = text(formData.get('apiKey'));
  const code = text(formData.get('code'));

  if (!/^https?:\/\/\S{3,300}$/.test(apiBaseUrl)) {
    return { status: 'error', message: 'API 주소는 http(s)://로 시작하는 주소여야 해요.' };
  }
  if (model.length < 1 || model.length > 100) return { status: 'error', message: '모델 이름을 적어 주세요.' };
  if (apiKey !== '' && (apiKey.length < 8 || apiKey.length > 512)) {
    return { status: 'error', message: 'API 키 길이가 이상해요. 복사가 잘렸는지 확인해 주세요.' };
  }
  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;

  try {
    await spendSecondFactorCode(code);
    await mutate('/api/v1/admin/ai-news/settings', {
      method: 'PUT',
      body: { apiBaseUrl, model, ...(apiKey === '' ? {} : { apiKey }), idempotencyKey: idempotencyKey() },
    });
    revalidatePath(PAGE);
    return {
      status: 'ok',
      message: apiKey === '' ? '주소와 모델을 저장했어요. 키는 그대로예요.' : '주소, 모델, 새 키를 저장했어요.',
    };
  } catch (error) {
    return explain(error, '설정을 저장하지 못했어요.');
  }
}

export async function generateAiNews(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const prompt = text(formData.get('prompt'));
  if (prompt.length > 2000) return { status: 'error', message: '요청은 2000자까지예요.' };
  try {
    await mutate('/api/v1/admin/ai-news/batches', {
      body: { ...(prompt === '' ? {} : { prompt }), idempotencyKey: idempotencyKey() },
    });
    revalidatePath(PAGE);
    // The batch is not here yet: the model is slower than any gateway in
    // front of this page will wait, so the request starts a run and the page
    // shows what that run is doing.
    return { status: 'ok', message: '모델에 물어보는 중이에요. 다 되면 아래에 다섯 개가 나타납니다.' };
  } catch (error) {
    return explain(error, '시나리오 만들기를 시작하지 못했어요.');
  }
}

/** One form, two buttons: `intent` says which. */
export async function decideAiNewsScenario(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const scenarioId = text(formData.get('scenarioId'));
  const intent = text(formData.get('intent'));
  if (scenarioId === '') return { status: 'error', message: '시나리오를 찾을 수 없어요.' };

  if (intent === 'discard') {
    try {
      await mutate(`/api/v1/admin/ai-news/scenarios/${encodeURIComponent(scenarioId)}/discard`, {
        body: { idempotencyKey: idempotencyKey() },
      });
      revalidatePath(PAGE);
      return { status: 'ok', message: '이 시나리오는 접어 두었어요.' };
    } catch (error) {
      return explain(error, '시나리오를 접지 못했어요.');
    }
  }

  const direction = text(formData.get('direction'));
  const strength = Number(text(formData.get('strength')));
  const hours = Number(text(formData.get('hours')));
  const headline = text(formData.get('headline'));
  const body = text(formData.get('body'));
  if (direction !== 'up' && direction !== 'down') return { status: 'error', message: '호재인지 악재인지 골라 주세요.' };
  if (![1, 2, 3].includes(strength)) return { status: 'error', message: '강도는 1·2·3 중 하나예요.' };
  if (!Number.isSafeInteger(hours) || hours < 1 || hours > 168) return { status: 'error', message: '기간은 1~168시간이에요.' };
  if (headline.length < 2 || headline.length > 120) return { status: 'error', message: '제목은 2~120자로 적어 주세요.' };
  if (body.length > 2000) return { status: 'error', message: '본문은 2000자까지예요.' };

  try {
    await mutate(`/api/v1/admin/ai-news/scenarios/${encodeURIComponent(scenarioId)}/publish`, {
      body: { direction, strength, hours, headline, body, idempotencyKey: idempotencyKey() },
    });
    revalidatePath(PAGE);
    revalidatePath('/admin/market');
    revalidatePath('/stocks');
    return { status: 'ok', message: '소식을 냈어요. 지금부터 시장이 그 방향으로 기울어요.' };
  } catch (error) {
    return explain(error, '소식을 내지 못했어요.');
  }
}
