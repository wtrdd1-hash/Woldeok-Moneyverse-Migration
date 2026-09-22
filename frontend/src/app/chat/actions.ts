'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

export interface ChatConversation {
  readonly conversation_id: string;
  readonly state: string;
  readonly latest_sequence: string;
  readonly last_message_at: string | null;
  readonly created_at: string;
  readonly peer_user_id: string;
  readonly peer_display_name: string;
  readonly peer_avatar_key: string | null;
  readonly last_read_sequence: string;
  readonly unread_count: string;
  readonly muted: boolean;
  readonly archived: boolean;
  readonly last_message_body: string | null;
  readonly is_peer_blocked?: boolean;
}

export interface ChatMessage {
  readonly id: string;
  readonly conversation_id: string;
  readonly sender_id: string;
  readonly sequence: string;
  readonly body: string;
  readonly created_at: string;
  readonly is_mine: boolean;
}

export async function openConversationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState & { conversationId?: string }> {
  const peerUserId = String(formData.get('peerUserId') ?? '').trim();
  if (!peerUserId) return { status: 'error', message: '대화 상대방 정보를 확인할 수 없어요.' };

  try {
    const res = await mutate<{ conversation_id: string }>(
      '/api/v1/chat/conversations',
      { body: { peerUserId } },
    );
    revalidatePath('/chat');
    return {
      status: 'ok',
      message: '대화방을 열었어요.',
      conversationId: res.conversation_id,
    };
  } catch (error) {
    return failure(error, '대화방을 열 수 없어요.');
  }
}

export async function sendMessageAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState & { messageId?: string; sequence?: string }> {
  const conversationId = String(formData.get('conversationId') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (!conversationId) return { status: 'error', message: '대화방 정보를 확인할 수 없어요.' };
  if (!body) return { status: 'error', message: '메시지를 입력해 주세요.' };
  if (body.length > 2000) return { status: 'error', message: '메시지는 최대 2000자까지 작성할 수 있어요.' };

  try {
    const res = await mutate<{ message_id: string; sequence: string }>(
      `/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        body: {
          body,
          idempotencyKey: idempotencyKey(),
        },
      },
    );
    revalidatePath('/chat');
    return {
      status: 'ok',
      message: '메시지를 보냈어요.',
      messageId: res.message_id,
      sequence: res.sequence,
    };
  } catch (error) {
    return failure(error, '메시지를 보낼 수 없어요.');
  }
}

export async function markAsReadAction(conversationId: string, sequence: number): Promise<boolean> {
  if (!conversationId || sequence < 0) return false;
  try {
    await mutate(`/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/read`, {
      body: { sequence },
    });
    return true;
  } catch {
    return false;
  }
}

export async function archiveConversationAction(
  conversationId: string,
  archived: boolean,
): Promise<ActionState> {
  if (!conversationId) return { status: 'error', message: '대화방 정보를 확인할 수 없어요.' };
  try {
    await mutate(`/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/archive`, {
      body: { archived },
    });
    revalidatePath('/chat');
    return {
      status: 'ok',
      message: archived ? '대화방을 보관함으로 이동했어요.' : '대화방 보관을 해제했어요.',
    };
  } catch (error) {
    return failure(error, '대화방 설정을 변경할 수 없어요.');
  }
}

export async function muteConversationAction(
  conversationId: string,
  muted: boolean,
): Promise<ActionState> {
  if (!conversationId) return { status: 'error', message: '대화방 정보를 확인할 수 없어요.' };
  try {
    await mutate(`/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/mute`, {
      body: { muted },
    });
    revalidatePath('/chat');
    return {
      status: 'ok',
      message: muted ? '대화방 알림을 음소거했어요.' : '대화방 알림을 다시 켰어요.',
    };
  } catch (error) {
    return failure(error, '대화방 알림 설정을 변경할 수 없어요.');
  }
}

export async function blockUserAction(targetUserId: string): Promise<ActionState> {
  if (!targetUserId) return { status: 'error', message: '차단할 회원 정보를 확인할 수 없어요.' };
  try {
    await mutate(`/api/v1/chat/users/${encodeURIComponent(targetUserId)}/block`, {
      method: 'POST',
    });
    revalidatePath('/chat');
    return {
      status: 'ok',
      message: '회원을 차단했어요. 이후 이 회원의 쪽지는 안전하게 거절돼요.',
    };
  } catch (error) {
    return failure(error, '회원을 차단할 수 없어요.');
  }
}

export async function unblockUserAction(targetUserId: string): Promise<ActionState> {
  if (!targetUserId) return { status: 'error', message: '차단 해제할 회원 정보를 확인할 수 없어요.' };
  try {
    await mutate(`/api/v1/chat/users/${encodeURIComponent(targetUserId)}/block`, {
      method: 'DELETE',
    });
    revalidatePath('/chat');
    return {
      status: 'ok',
      message: '회원 차단을 해제했어요.',
    };
  } catch (error) {
    return failure(error, '회원 차단을 해제할 수 없어요.');
  }
}

export async function reportConversationAction(
  conversationId: string,
  reason: string,
  details: string,
): Promise<ActionState & { reportId?: string }> {
  if (!conversationId) return { status: 'error', message: '대화방 정보를 확인할 수 없어요.' };
  if (!details || details.trim().length < 2) {
    return { status: 'error', message: '신고 사유를 2자 이상 입력해 주세요.' };
  }
  try {
    const res = await mutate<{ reportId: string }>(
      `/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/report`,
      {
        body: { reason, details: details.trim() },
      },
    );
    revalidatePath('/chat');
    return {
      status: 'ok',
      message: '신고가 접수되었으며 최근 대화 증거가 안전 관리 센터에 보존되었어요.',
      reportId: res.reportId,
    };
  } catch (error) {
    return failure(error, '신고를 접수할 수 없어요.');
  }
}

