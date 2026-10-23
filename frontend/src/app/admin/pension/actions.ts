'use server';

import { revalidatePath } from 'next/cache';
import { failure, mutate } from '@/lib/mutate';

interface PensionPayoutReceipt {
  readonly pensionersCount: number;
  readonly totalPayoutAmount: string;
}

type PensionPayoutResult =
  | { readonly ok: true; readonly receipt: PensionPayoutReceipt }
  | { readonly ok: false; readonly error: string };

/** Require an actual backend receipt before displaying a financial execution as successful. */
export async function distributePensionPayouts(): Promise<PensionPayoutResult> {
  try {
    const result = await mutate<unknown>('/api/v1/admin/pension/distribute-payouts', {
      method: 'POST',
    });
    if (
      typeof result !== 'object' || result === null ||
      !('pensionersCount' in result) ||
      !Number.isSafeInteger(result.pensionersCount) ||
      (result.pensionersCount as number) < 0 ||
      !('totalPayoutAmount' in result) ||
      typeof result.totalPayoutAmount !== 'string' ||
      !/^(0|[1-9]\d*)$/.test(result.totalPayoutAmount)
    ) {
      return { ok: false, error: '지급 결과를 확인할 수 없어 성공으로 표시하지 않았습니다.' };
    }
    const receipt: PensionPayoutReceipt = {
      pensionersCount: result.pensionersCount as number,
      totalPayoutAmount: result.totalPayoutAmount as string,
    };
    revalidatePath('/admin/pension');
    return { ok: true, receipt };
  } catch (error) {
    return { ok: false, error: failure(error, '지급 요청의 처리 결과를 확인할 수 없습니다.').message ?? '지급 요청의 처리 결과를 확인할 수 없습니다.' };
  }
}
