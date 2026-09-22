'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';
import { apiOrNull } from '@/lib/api';

export interface EvidenceMessage {
  id: string;
  sender_id: string;
  sequence: number;
  body: string;
  created_at: string;
}

export interface ChatReportDetail {
  report_id: string;
  reporter_id: string;
  reporter_username: string;
  reporter_nickname: string;
  reported_user_id: string;
  reported_username: string;
  reported_nickname: string;
  conversation_id: string;
  reason: string;
  details: string;
  evidence_count: number;
  evidence_snapshot: EvidenceMessage[];
  status: string;
  created_at: string;
  actioned_at: string | null;
  actioned_by: string | null;
  actioner_nickname: string | null;
}

export async function getChatReportDetailAction(reportId: string): Promise<ChatReportDetail | null> {
  if (!reportId) return null;
  return apiOrNull<ChatReportDetail>(`/api/v1/admin/safety/chat-reports/${encodeURIComponent(reportId)}`);
}

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

export async function actionChatReport(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reportId = text(formData.get('reportId'));
  const action = text(formData.get('action'));
  const note = text(formData.get('note'));

  if (!reportId) {
    return { status: 'error', message: '신고 ID를 확인할 수 없습니다.' };
  }

  if (!['ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'].includes(action)) {
    return { status: 'error', message: '올바른 조치 상태를 선택해 주세요.' };
  }

  try {
    await mutate(`/api/v1/admin/safety/chat-reports/${encodeURIComponent(reportId)}/action`, {
      method: 'POST',
      body: {
        action,
        note: note || undefined,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/safety');
    return {
      status: 'ok',
      message: `신고 건 조치('${action}')가 정상 완료되었습니다.`,
    };
  } catch (error) {
    return failure(error, '신고 건 조치 처리에 실패했습니다.');
  }
}

