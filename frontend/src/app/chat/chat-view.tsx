'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, Archive, Search, ArrowLeft, Clock, CheckCheck, User, UserPlus, BellOff, RotateCw, X, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/cn';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import type { ChatConversation, ChatMessage } from './actions';
import { ChatRoom } from './chat-room';
import { ComposeMessageDialog } from './compose-message-dialog';

interface ChatViewProps {
  readonly initialConversations: readonly ChatConversation[];
  readonly activeConversation: ChatConversation | null;
  readonly initialMessages: readonly ChatMessage[];
  readonly currentUserId?: string;
  readonly isAdmin?: boolean;
}

export function ChatView({
  initialConversations,
  activeConversation,
  initialMessages,
  isAdmin = false,
}: ChatViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const [conversations] = useState<ChatConversation[]>([...initialConversations]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<readonly { user_id: string; display_name: string }[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // 신규 회원 검색 디바운스
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchedUsers([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await fetch(`/app-api/v1/chat/search-users?query=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchedUsers(data.users ?? []);
        }
      } catch {
        // ignore
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter conversations
  const filteredList = conversations.filter((c) => {
    const matchesFilter = filter === 'archived' ? c.archived : !c.archived;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.peer_display_name.toLowerCase().includes(query) ||
      (c.last_message_body && c.last_message_body.toLowerCase().includes(query))
    );
  });

  const handleSelect = (conversationId: string) => {
    router.push(`/chat?conversationId=${encodeURIComponent(conversationId)}`);
  };

  const handleBackToList = () => {
    router.push('/chat');
  };

  const hasActiveConversation = Boolean(activeConversation);

  return (
    <div className="grid h-[calc(100vh-14rem)] min-h-[580px] max-h-[860px] grid-cols-1 overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-12">
      {/* Left Column: Conversations List */}
      <aside
        className={cn(
          'flex flex-col border-r bg-muted/20 lg:col-span-4 xl:col-span-4',
          hasActiveConversation ? 'hidden lg:flex' : 'flex',
        )}
      >
        {/* Search and Tabs */}
        <div className="p-3 border-b space-y-2 bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={localeLabel(
                locale,
                '회원 닉네임 또는 메시지 검색…',
                'Search members or messages…',
                '会員名やメッセージを検索…',
                '搜索会员昵称或消息…',
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <Button
              size="sm"
              variant={filter === 'active' ? 'secondary' : 'ghost'}
              className="flex-1 text-xs h-7 font-bold"
              onClick={() => setFilter('active')}
            >
              {localeLabel(locale, '대화 목록', 'Messages', 'メッセージ一覧', '消息列表')}
            </Button>
            <Button
              size="sm"
              variant={filter === 'archived' ? 'secondary' : 'ghost'}
              className="flex-1 text-xs h-7 font-bold gap-1"
              onClick={() => setFilter('archived')}
            >
              <Archive className="size-3" />
              {localeLabel(locale, '보관함', 'Archived', 'アーカイブ', '已归档')}
            </Button>
            <Button
              size="sm"
              variant="default"
              className="text-xs h-7 px-2.5 font-bold gap-1 shadow-2xs"
              onClick={() => setIsComposeOpen(true)}
              title={localeLabel(locale, '새 쪽지 작성', 'Compose Message', '新規作成', '写私信')}
            >
              <PenSquare className="size-3" />
              <span className="hidden sm:inline">{localeLabel(locale, '쪽지 쓰기', 'New', '作成', '写私信')}</span>
            </Button>
          </div>
        </div>

        {/* 신규 회원 검색 결과 섹션 (검색어가 있을 때 표시) */}
        {searchQuery.trim() && (
          <div className="p-2 border-b bg-primary/5 space-y-1.5">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1 text-primary">
                <UserPlus className="size-3.5" />
                {localeLabel(locale, '회원 검색 결과 (새 쪽지 시작)', 'Members found', '会員検索結果', '会员搜索结果')}
              </span>
              {isSearchingUsers && <RotateCw className="size-3 animate-spin text-muted-foreground" />}
            </div>
            {searchedUsers.length > 0 ? (
              <div className="space-y-1 max-h-[140px] overflow-y-auto">
                {searchedUsers.map((u) => (
                  <button
                    key={u.user_id}
                    type="button"
                    onClick={() => {
                      router.push(`/chat?peer=${encodeURIComponent(u.user_id)}`);
                    }}
                    className="w-full p-2 rounded-lg border border-primary/20 bg-card hover:bg-primary/10 transition-all text-left flex items-center justify-between gap-2 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs shrink-0">
                        {u.display_name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs truncate group-hover:text-primary transition-colors">
                        {u.display_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground shrink-0 shadow-xs">
                      {localeLabel(locale, '쪽지 보내기', 'Message', '送信', '发私信')}
                    </span>
                  </button>
                ))}
              </div>
            ) : !isSearchingUsers ? (
              <p className="text-[11px] text-muted-foreground px-1 py-0.5 italic">
                {localeLabel(locale, '일치하는 회원이 없습니다.', 'No members found.', '一致する会員がいません。', '无匹配会员。')}
              </p>
            ) : null}
          </div>
        )}

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredList.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="mx-auto size-8 opacity-40 mb-2" />
              <p className="text-sm font-semibold">
                {filter === 'archived'
                  ? localeLabel(locale, '보관된 대화가 없어요.', 'No archived conversations.', 'アーカイブされたメッセージはありません。', '没有归档的对话。')
                  : localeLabel(locale, '주고받은 쪽지가 없어요.', 'No messages yet.', 'メッセージ履歴はありません。', '暂无私信消息。')}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                {localeLabel(
                  locale,
                  '회원 프로필에서 [쪽지 보내기]를 누르거나, 아래 버튼으로 바로 새 쪽지를 보낼 수 있습니다.',
                  'Click [Send Message] on a profile or click below to start chatting.',
                  '会員プロフィールから[メッセージ送信]を押すか、下のボタンから直接送信できます。',
                  '点击用户主页上的[发送私信]或点击下方按钮直接发私信。',
                )}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsComposeOpen(true)}
                className="mt-3 gap-1.5 font-bold text-xs"
              >
                <PenSquare className="size-3.5" />
                <span>{localeLabel(locale, '새 쪽지 쓰기', 'New Message', '新規作成', '写私信')}</span>
              </Button>
            </div>
          ) : (
            filteredList.map((item) => {
              const isSelected = activeConversation?.conversation_id === item.conversation_id;
              const unreadNum = Number.parseInt(item.unread_count, 10) || 0;

              return (
                <button
                  key={item.conversation_id}
                  type="button"
                  onClick={() => handleSelect(item.conversation_id)}
                  className={cn(
                    'w-full text-left p-3.5 transition-colors flex items-start gap-3 hover:bg-muted/50',
                    isSelected && 'bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary',
                  )}
                >
                  {/* Avatar fallback */}
                  <div className="size-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-black text-sm shrink-0">
                    {item.peer_display_name.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-sm truncate text-foreground">
                          {item.peer_display_name}
                        </span>
                        {item.muted && <BellOff className="size-3 text-muted-foreground shrink-0" />}
                        {item.is_peer_blocked && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-destructive/40 text-destructive shrink-0">
                            {localeLabel(locale, '차단', 'Blocked', 'ブロック', '已屏蔽')}
                          </Badge>
                        )}
                      </div>
                      {item.last_message_at && (
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {new Date(item.last_message_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : locale === 'zh' ? 'zh-CN' : 'en-US', {
                            month: 'numeric',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate leading-relaxed">
                      {item.last_message_body || localeLabel(locale, '대화가 시작되었습니다.', 'Conversation started.', '会話が開始されました。', '对话已开始。')}
                    </p>
                  </div>

                  {unreadNum > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-bold rounded-full">
                      {unreadNum > 99 ? '99+' : unreadNum}
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Column: Chat Room or Empty State */}
      <main
        className={cn(
          'flex flex-col bg-card lg:col-span-8 xl:col-span-8',
          hasActiveConversation ? 'flex' : 'hidden lg:flex',
        )}
      >
        {activeConversation ? (
          <ChatRoom
            key={activeConversation.conversation_id}
            conversation={activeConversation}
            initialMessages={initialMessages}
            onBack={handleBackToList}
            onMessageSent={() => {
              // trigger refresh
              router.refresh();
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <EmptyState
              title={localeLabel(locale, '대화방을 선택해 주세요', 'Select a conversation', 'メッセージを選択してください', '请选择对话房间')}
              description={localeLabel(
                locale,
                '좌측 목록에서 대화방을 선택하거나, [새 쪽지 작성] 버튼을 눌러 회원과 1:1 쪽지를 시작해 보세요.',
                'Choose a conversation from the list or click [Compose Message] to start chatting with a member.',
                '左側のリストから会話を選択するか、[新規作成]を押して会話を開始してください。',
                '从左侧列表中选择对话，或点击[写新私信]开始与会员对话。',
              )}
            />
            <Button
              onClick={() => setIsComposeOpen(true)}
              className="mt-4 gap-2 font-bold shadow-xs"
            >
              <PenSquare className="size-4" />
              <span>{localeLabel(locale, '새 쪽지 작성하기', 'Compose New Message', '新規メッセージ作成', '写新私信')}</span>
            </Button>
          </div>
        )}
      </main>

      <ComposeMessageDialog
        isAdmin={isAdmin}
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
      />
    </div>
  );
}
