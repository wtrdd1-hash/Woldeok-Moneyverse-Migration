'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { localeLabel, type Locale } from '@/lib/locale';
import { openConversationAction } from './actions';
import { isChatUuid } from './chat-evidence';

interface PeerConversationStartProps {
  readonly peerUserId: string;
  readonly locale: Locale;
}

export function PeerConversationStart({ peerUserId, locale }: PeerConversationStartProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(openConversationAction, { status: 'idle' as const });
  const validReceipt = state.status === 'ok' && isChatUuid(state.conversationId);

  useEffect(() => {
    if (validReceipt) {
      router.replace(`/chat?conversationId=${encodeURIComponent(state.conversationId!)}`);
    }
  }, [router, state.conversationId, validReceipt]);

  return (
    <form action={action} className="grid w-full shrink-0 gap-2 sm:w-auto">
      <input type="hidden" name="peerUserId" value={peerUserId} />
      <Button type="submit" disabled={pending || validReceipt} className="min-h-11 w-full sm:w-auto">
        {pending
          ? localeLabel(locale, '대화방 확인 중', 'Opening conversation', '会話を開いています', '正在打开对话')
          : localeLabel(locale, '대화방 열기', 'Open conversation', '会話を開く', '打开对话')}
      </Button>
      {state.status === 'error' && (
        <p role="alert" className="max-w-sm text-sm text-destructive">{state.message}</p>
      )}
      {state.status === 'ok' && !validReceipt && (
        <p role="alert" className="max-w-sm text-sm text-destructive">
          {localeLabel(locale, '대화방 생성 결과를 확인할 수 없습니다. 다시 시도하기 전에 쪽지함을 확인하세요.',
            'Conversation confirmation is unavailable. Check your inbox before retrying.',
            '会話の作成結果を確認できません。再試行する前に受信箱を確認してください。',
            '无法确认对话创建结果。重试前请检查收件箱。')}
        </p>
      )}
    </form>
  );
}
