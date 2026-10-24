'use server';

import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';
import { requireAdminConsole } from '@/lib/session';

interface BackupTriggerReceipt {
  readonly message: string;
  readonly triggeredAt: string;
}

/** A trigger acknowledgement is not evidence of a completed, restorable backup. */
export async function triggerAdminBackup(): Promise<ActionState> {
  await requireAdminConsole('/admin/api-health');
  try {
    const receipt = await mutate<BackupTriggerReceipt>('/api/v1/admin/backups/trigger');
    if (
      !receipt ||
      typeof receipt.message !== 'string' ||
      receipt.message.trim().length === 0 ||
      typeof receipt.triggeredAt !== 'string' ||
      !Number.isFinite(Date.parse(receipt.triggeredAt))
    ) {
      return { status: 'error', message: '백업 실행 요청의 접수 결과를 확인하지 못했습니다.' };
    }
    return {
      status: 'ok',
      message: '백업 실행 요청이 접수되었습니다. 완료 여부는 백업 상태에서 별도로 확인해 주세요.',
    };
  } catch (error) {
    return failure(error, '백업 실행 요청을 접수하지 못했습니다.');
  }
}
