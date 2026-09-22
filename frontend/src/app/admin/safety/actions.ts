'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function actionTakedown(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const caseId = text(formData.get('caseId'));
  const newStatus = text(formData.get('newStatus'));
  const adminNotes = text(formData.get('adminNotes'));

  if (!caseId) {
    return { status: 'error', message: '접수 번호를 확인할 수 없습니다.' };
  }

  if (!['TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED'].includes(newStatus)) {
    return { status: 'error', message: '올바른 조치 상태를 선택해 주세요.' };
  }

  try {
    await mutate(`/api/v1/admin/safety/takedowns/${encodeURIComponent(caseId)}/action`, {
      method: 'POST',
      body: {
        newStatus,
        adminNotes: adminNotes || undefined,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/safety');
    return {
      status: 'ok',
      message: `접수 건 [${caseId}]의 상태를 '${newStatus}'(으)로 갱신했습니다.`,
    };
  } catch (error) {
    return failure(error, '긴급 콘텐츠 삭제 조치 처리에 실패했습니다.');
  }
}
