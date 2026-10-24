'use server';

import { mutate } from '@/lib/mutate';
import { GOVERNANCE_CHOICES, currentKstQuarter } from './governance-vote';

type VoteActionResult = {
  status: 'ok' | 'error';
  message: string;
  quarter?: string;
  choice?: string;
};

/** A server action obtains and spends the session's CSRF token via mutate(). */
export async function castCitizenBudgetVoteAction(choice: string): Promise<VoteActionResult> {
  if (!GOVERNANCE_CHOICES.some((option) => option.value === choice)) {
    return { status: 'error', message: '유효한 예산 우선순위를 선택해 주세요.' };
  }
  const quarter = currentKstQuarter();
  try {
    const receipt = await mutate<{ success: boolean; quarter: string; choice: string }>(
      '/api/v1/wallet/governance/vote',
      { body: { quarter, choice } },
    );
    if (receipt?.success !== true || receipt.quarter !== quarter || receipt.choice !== choice) {
      return { status: 'error', message: '투표 저장을 확인할 수 없습니다. 잠시 후 다시 확인해 주세요.' };
    }
    return { status: 'ok', message: `${quarter} 분기 시민 우선순위 투표가 저장되었습니다.`, quarter, choice };
  } catch {
    return { status: 'error', message: '투표 저장을 확인하지 못했습니다. 로그인 상태와 연결을 확인해 주세요.' };
  }
}
