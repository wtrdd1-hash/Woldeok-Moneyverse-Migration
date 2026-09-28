'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export interface GoldenDuckActionResult {
  readonly success: boolean;
  readonly requiresLogin?: boolean | undefined;
  readonly rewardAmount?: number | undefined;
  readonly newBalance?: string | undefined;
  readonly clicks?: number | undefined;
  readonly multiplier?: number | undefined;
  readonly message?: string | undefined;
}

interface DopamineBackendResponse {
  readonly success: boolean;
  readonly userId: string;
  readonly transactionId: string;
  readonly rewardAmount: number;
  readonly newBalance?: string;
  readonly clicks: number;
  readonly multiplier: number;
  readonly claimedAt: string;
}

/**
 * 황금 오리 광클 피버 보상 청구 서버 액션
 * 세션 및 CSRF 토큰을 안전하게 처리하며 실제 DB 입금 및 지갑 잔고를 갱신합니다.
 */
export async function claimGoldenDuckAction(
  clickCount: number,
  comboMultiplier: number,
): Promise<GoldenDuckActionResult> {
  const idempotencyKey = randomUUID();

  try {
    const data = await mutate<DopamineBackendResponse>(
      '/api/v1/engagement/dopamine/golden-duck',
      {
        method: 'POST',
        body: {
          clickCount: Math.min(Math.max(1, Math.floor(clickCount || 1)), 200),
          comboMultiplier: Math.min(Math.max(1.0, Number(comboMultiplier || 1.0)), 3.0),
          idempotencyKey,
        },
      },
    );

    // 지갑 잔고 및 홈 레이아웃 캐시 갱신
    try {
      revalidatePath('/');
      revalidatePath('/wallet');
    } catch {
      // Revalidation non-fatal
    }

    return {
      success: true,
      rewardAmount: data.rewardAmount,
      newBalance: data.newBalance,
      clicks: data.clicks,
      multiplier: data.multiplier,
      message: `${data.rewardAmount.toLocaleString()} WLD가 지갑에 성공적으로 입금되었습니다!`,
    };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.code === 'unauthorized' || error.code === 'session_required') {
        return {
          success: false,
          requiresLogin: true,
          message: '로그인 후 WLD 보상을 지갑에 수령할 수 있습니다.',
        };
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : '보상 수령 처리 중 오류가 발생했습니다.',
    };
  }
}
