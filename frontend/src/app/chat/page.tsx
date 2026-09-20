import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { requireMember } from '@/lib/session';
import type { ChatConversation, ChatMessage } from './actions';
import { ChatView } from './chat-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '쪽지함',
  description: '회원 간 1:1 비공개 쪽지 및 실시간 대화',
  robots: { index: false, follow: false },
};

export default async function ChatPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly conversationId?: string; readonly peer?: string }>;
}) {
  await requireMember();
  const params = await searchParams;

  // 1. Fetch conversations list
  const listResult = await apiOrNull<{ conversations: ChatConversation[] }>(
    '/api/v1/chat/conversations',
  );
  const conversations = listResult?.conversations ?? [];
  let selectedId = params.conversationId;

  // 2. If peer query param is passed, find or open conversation
  if (params.peer) {
    const existing = conversations.find((c) => c.peer_user_id === params.peer);
    if (existing) {
      selectedId = existing.conversation_id;
    } else {
      try {
        const opened = await mutate<{ conversation_id: string }>('/api/v1/chat/conversations', {
          body: { peerUserId: params.peer },
        });
        redirect(`/chat?conversationId=${encodeURIComponent(opened.conversation_id)}`);
      } catch {
        // If peer open fails (e.g. self chat or blocked), proceed
      }
    }
  }

  // 3. Find active conversation
  const activeConversation = selectedId
    ? conversations.find((c) => c.conversation_id === selectedId) ?? null
    : null;

  // 4. Fetch messages for active conversation
  let initialMessages: ChatMessage[] = [];
  if (activeConversation) {
    const msgResult = await apiOrNull<{ messages: ChatMessage[] }>(
      `/api/v1/chat/conversations/${encodeURIComponent(activeConversation.conversation_id)}/messages?limit=50`,
    );
    if (msgResult?.messages) {
      initialMessages = msgResult.messages;
    }
  }

  return (
    <div data-page="chat" className="mv-page mv-page--member grid gap-4 max-w-6xl mx-auto">
      <PageHeader eyebrow="MESSAGES" title="쪽지함">
        회원 간 1:1 비공개 쪽지를 실시간으로 안전하게 주고받을 수 있습니다. 부적절한 언행이나 사기 유도는 운영진에 의해 제재될 수 있습니다.
      </PageHeader>

      <ChatView
        initialConversations={conversations}
        activeConversation={activeConversation}
        initialMessages={initialMessages}
      />
    </div>
  );
}
