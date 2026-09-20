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
    return { status: 'ok', message: '모델에 물어보는 중이에요. 다 되면 아래에 다섯 개가 나타납니다.' };
  } catch (error) {
    return explain(error, '시나리오 만들기를 시작하지 못했어요.');
  }
}

/**
 * 1-Click 자동 AI 주식 뉴스 생성 및 즉시 발행 액션
 */
export async function autoGenerateAiNews(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const publishImmediate = formData.get('publishImmediate') === 'true' || formData.get('publishImmediate') === 'on';
  try {
    const result = await mutate<{
      success: boolean;
      published: boolean;
      publishedCount?: number;
      stocksAnalyzed?: number;
      scenarioCount?: number;
      scenario?: {
        headline: string;
        effects: Array<{ stock_id: string | null; direction: string; strength: number }>;
      };
      message?: string;
    }>('/api/v1/admin/ai-news/auto-generate', {
      body: { publishImmediate, idempotencyKey: idempotencyKey() },
    });

    revalidatePath(PAGE);
    revalidatePath('/admin/market');
    revalidatePath('/stocks');

    if (result.published && result.scenario) {
      const effectCount = result.scenario.effects.filter((e) => e.direction !== 'none').length;
      return {
        status: 'ok',
        message: `AI 뉴스가 자동 생성되어 즉시 발행되었습니다: "${result.scenario.headline}" (${effectCount}개 종목 시세 반영 중)`,
      };
    }

    return {
      status: 'ok',
      message: `활성 상장 종목 분석을 완료하고 AI 뉴스 시나리오가 자동 생성되었습니다. 아래 시나리오 목록을 확인하세요.`,
    };
  } catch (error) {
    return explain(error, 'AI 뉴스 자동 생성을 실행하지 못했습니다.');
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

  const hours = Number(text(formData.get('hours')));
  const headline = text(formData.get('headline'));
  const body = text(formData.get('body'));
  const count = Number(text(formData.get('effectCount')));
  if (!Number.isSafeInteger(count) || count < 1 || count > 4) {
    return { status: 'error', message: '종목별 영향이 비어 있어요. 새로고침해 주세요.' };
  }
  const effects = [];
  for (let index = 0; index < count; index += 1) {
    const stockId = text(formData.get(`effect-${index}-stockId`));
    const direction = text(formData.get(`effect-${index}-direction`));
    const strength = Number(text(formData.get(`effect-${index}-strength`)));
    if (direction !== 'up' && direction !== 'down' && direction !== 'none') {
      return { status: 'error', message: '종목마다 호재·악재·소식 중 하나를 골라 주세요.' };
    }
    if (![1, 2, 3].includes(strength)) return { status: 'error', message: '강도는 1·2·3 중 하나예요.' };
    effects.push({ stockId: stockId === '' ? null : stockId, direction, strength });
  }
  if (!effects.some((effect) => effect.direction !== 'none')) {
    return { status: 'error', message: '적어도 한 종목은 움직여야 소식이 됩니다.' };
  }
  if (!Number.isSafeInteger(hours) || hours < 1 || hours > 168) return { status: 'error', message: '기간은 1~168시간이에요.' };
  if (headline.length < 2 || headline.length > 120) return { status: 'error', message: '제목은 2~120자로 적어 주세요.' };
  if (body.length > 2000) return { status: 'error', message: '본문은 2000자까지예요.' };

  try {
    await mutate(`/api/v1/admin/ai-news/scenarios/${encodeURIComponent(scenarioId)}/publish`, {
      body: { hours, headline, body, effects, idempotencyKey: idempotencyKey() },
    });
    revalidatePath(PAGE);
    revalidatePath('/admin/market');
    revalidatePath('/stocks');
    const moved = effects.filter((effect) => effect.direction !== 'none').length;
    return {
      status: 'ok',
      message: `소식을 냈어요. ${moved}개 종목이 지금 값이 뛰고, 그 방향으로 계속 기울어요.`,
    };
  } catch (error) {
    return explain(error, '소식을 내지 못했어요.');
  }
}
