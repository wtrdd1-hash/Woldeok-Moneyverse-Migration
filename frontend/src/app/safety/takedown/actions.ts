'use server';

import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitEmergencyTakedown(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requesterEmail = text(formData.get('requesterEmail'));
  const requesterType = text(formData.get('requesterType'));
  const reasonCategory = text(formData.get('reasonCategory'));
  const targetContentUrl = text(formData.get('targetContentUrl'));
  const targetContentType = text(formData.get('targetContentType'));
  const description = text(formData.get('description'));
  const passcode = text(formData.get('passcode'));

  if (!requesterEmail || !requesterEmail.includes('@')) {
    return { status: 'error', message: '올바른 이메일 주소를 입력해 주세요.' };
  }

  if (!targetContentUrl || !targetContentUrl.startsWith('http')) {
    return { status: 'error', message: '올바른 대상 콘텐츠 URL을 입력해 주세요.' };
  }

  if (description.length < 10) {
    return { status: 'error', message: '신고 사유 및 상세 내용을 10자 이상 구체적으로 적어 주세요.' };
  }

  if (passcode.length < 6) {
    return { status: 'error', message: '처리 상태 확인용 비밀번호를 6자리 이상 입력해 주세요.' };
  }

  try {
    const res = await mutate<{ success: boolean; caseId: string; message: string }>(
      '/api/v1/safety/takedown',
      {
        method: 'POST',
        body: {
          requesterEmail,
          requesterType,
          reasonCategory,
          targetContentUrl,
          targetContentType,
          description,
          passcode,
        },
      },
    );

    return {
      status: 'ok',
      message: `긴급 콘텐츠 삭제 접수가 완료되었습니다. 접수 번호 [${res.caseId}]를 반드시 보관해 주세요.`,
    };
  } catch (error) {
    return failure(error, '긴급 콘텐츠 삭제 접수 중 오류가 발생했습니다.');
  }
}
