import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import type { ChatConversation, ChatMessage } from './actions';
import { ChatView } from './chat-view';
import { isChatUuid, verifyChatConversations, verifyChatMessages } from './chat-evidence';
import { ComposeMessageDialog } from './compose-message-dialog';
import { PeerConversationStart } from './peer-conversation-start';

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
  const conversations = verifyChatConversations(listResult);
  if (conversations === null) {
    return <ChatSourceUnavailable locale={locale} />;
  }
  let selectedId = params.conversationId;

  // Navigation is read-only. Creating a room is a deliberate POST when the member sends a message.
  const requestedPeer = isChatUuid(params.peer) ? params.peer : null;
  const existingPeerRoom = requestedPeer
    ? conversations.find((c) => c.peer_user_id === requestedPeer) ?? null
    : null;
  if (existingPeerRoom) selectedId = existingPeerRoom.conversation_id;
  const canComposeToPeer = requestedPeer !== null && existingPeerRoom === null;

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
    const verifiedMessages = verifyChatMessages(msgResult, activeConversation.conversation_id);
    if (verifiedMessages === null) {
      return <ChatSourceUnavailable locale={locale} />;
    }
    initialMessages = verifiedMessages;
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

      {canComposeToPeer && (
        <section
          aria-label={localeLabel(locale, '새 쪽지 상대', 'New message recipient', '新規メッセージの宛先', '新私信收件人')}
          className="grid min-w-0 gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex sm:items-center sm:justify-between"
        >
          <p className="min-w-0 text-sm text-muted-foreground">
            {localeLabel(
              locale,
              '직접 대화방 열기를 누르기 전에는 대화방을 만들지 않습니다. 열기 후 쪽지를 작성할 수 있습니다.',
              'No conversation is created until you select Open conversation. You can compose a message afterward.',
              '「会話を開く」を押すまで会話は作成されません。開いた後にメッセージを作成できます。',
              '点击“打开对话”之前不会创建对话。打开后即可撰写私信。',
            )}
          </p>
          <PeerConversationStart key={requestedPeer} peerUserId={requestedPeer!} locale={locale} />
        </section>
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

function ChatSourceUnavailable({ locale }: { readonly locale: Awaited<ReturnType<typeof getServerLocale>> }) {
  return (
    <main className="mv-page mv-page--member mx-auto grid max-w-3xl gap-5 px-4 py-8">
      <PageHeader
        eyebrow={localeLabel(locale, '메시지', 'MESSAGES', 'メッセージ', '私信')}
        title={localeLabel(locale, '쪽지함', 'Direct Messages', 'メッセージ', '私信箱')}
      />
      <section role="alert" aria-live="assertive" className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-5">
        <h2 className="text-lg font-semibold">{localeLabel(locale, '쪽지 기록을 확인할 수 없습니다', 'Message history is unavailable', 'メッセージ履歴を確認できません', '无法确认消息记录')}</h2>
        <p className="mt-2 text-sm">{localeLabel(locale,
          '서버에서 대화 기록을 검증하지 못했습니다. 쪽지가 없다는 의미가 아니며, 확인 전에는 새 대화나 메시지를 보내지 않습니다.',
          'The server could not verify your conversations. This does not mean your inbox is empty. Sending is paused until the source is verified.',
          'サーバーで会話履歴を確認できません。メッセージがないという意味ではありません。確認まで送信を停止します。',
          '服务器未能验证对话记录。这并不表示没有消息，验证前暂停发送。',
        )}</p>
        <Link href="/chat" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">
          {localeLabel(locale, '다시 확인', 'Retry', '再試行', '重试')}
        </Link>
      </section>
    </main>
  );
}
