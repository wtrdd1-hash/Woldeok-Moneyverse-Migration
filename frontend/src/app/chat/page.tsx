import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { requireMember } from '@/lib/session';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import type { ChatConversation, ChatMessage } from './actions';
import { ChatView } from './chat-view';
import { ComposeMessageDialog } from './compose-message-dialog';

// Match the UUID contract enforced by OpenConversationDto before sending a write.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: `${localeLabel(locale, '쪽지함', 'Direct Messages', 'メッセージ', '私信箱')} | Woldeok Moneyverse`,
    description: localeLabel(
      locale,
      '회원 간 1:1 비공개 쪽지 및 실시간 대화',
      'Exchange private 1:1 messages and real-time conversations with members',
      '会員間の1:1非公開メッセージおよびリアルタイムチャット',
      '会员间1对1私密消息及实时对话',
    ),
    robots: { index: false, follow: false },
  };
}

export default async function ChatPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly conversationId?: string; readonly peer?: string }>;
}) {
  await requireMember();
  const [locale, viewer, params] = await Promise.all([
    getServerLocale(),
    currentViewer(),
    searchParams,
  ]);
  const isAdmin = isAdministrator(viewer);

  // 1. Fetch conversations list
  const listResult = await apiOrNull<{ conversations: ChatConversation[] }>(
    '/api/v1/chat/conversations',
  );
  const conversations = listResult?.conversations ?? [];
  let selectedId = params.conversationId;

  // 2. If peer query param is passed, find or open conversation.
  let peerOpenError: string | null = null;
  if (params.peer) {
    if (!UUID_PATTERN.test(params.peer)) {
      peerOpenError = '대화 상대방 정보를 확인할 수 없어요.';
    } else {
      const existing = conversations.find((c) => c.peer_user_id === params.peer);
      if (existing) {
        selectedId = existing.conversation_id;
      } else {
        let openedId: string | null = null;
        try {
          const opened = await mutate<{ conversation_id: string }>('/api/v1/chat/conversations', {
            body: { peerUserId: params.peer },
          });
          if (!UUID_PATTERN.test(opened?.conversation_id ?? '')) {
            throw new Error('Invalid conversation receipt');
          }
          openedId = opened.conversation_id;
        } catch {
          peerOpenError = '대화방을 열 수 없어요. 잠시 후 다시 시도해 주세요.';
        }
        // Next.js redirect throws; catching it would silently discard a successful open.
        if (openedId) redirect(`/chat?conversationId=${encodeURIComponent(openedId)}`);
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
    <div data-page="chat" className="mv-page mv-page--member grid gap-4 w-full max-w-6xl mx-auto min-w-0 overflow-hidden">
      <PageHeader
        eyebrow={localeLabel(locale, '메시지', 'MESSAGES', 'メッセージ', '私信')}
        title={localeLabel(locale, '쪽지함', 'Direct Messages', 'メッセージ', '私信箱')}
        action={<ComposeMessageDialog isAdmin={isAdmin} />}
      >
        {localeLabel(
          locale,
          '회원 간 1:1 비공개 쪽지를 실시간으로 안전하게 주고받을 수 있습니다. 부적절한 언행이나 사기 유도는 운영진에 의해 제재 조치됩니다.',
          'Exchange secure, private 1:1 direct messages with members in real time. Inappropriate conduct or fraud attempts will be penalized by moderators.',
          '会員間で1:1の非公開メッセージを安全にリアルタイムで送受信できます。不適切な発言や詐欺行為は運営により制限される場合があります。',
          '实时安全收发会员间的1对1私密消息。任何不当言论或欺诈行为将受到管理团队的严厉制裁。',
        )}
      </PageHeader>

      {peerOpenError && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
          {peerOpenError}
        </p>
      )}
      <ChatView
        initialConversations={conversations}
        activeConversation={activeConversation}
        initialMessages={initialMessages}
        isAdmin={isAdmin}
      />
    </div>
  );
}
