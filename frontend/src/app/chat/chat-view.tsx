'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, Archive, Search, ArrowLeft, Clock, CheckCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/cn';
import type { ChatConversation, ChatMessage } from './actions';
import { ChatRoom } from './chat-room';

interface ChatViewProps {
  readonly initialConversations: readonly ChatConversation[];
  readonly activeConversation: ChatConversation | null;
  readonly initialMessages: readonly ChatMessage[];
  readonly currentUserId?: string;
}

export function ChatView({
  initialConversations,
  activeConversation,
  initialMessages,
}: ChatViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations] = useState<ChatConversation[]>([...initialConversations]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'active' | 'archived'>('active');

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
              type="text"
              placeholder="대화 상대 또는 메시지 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-1.5 pt-1">
            <Button
              size="sm"
              variant={filter === 'active' ? 'secondary' : 'ghost'}
              className="flex-1 text-xs h-7 font-bold"
              onClick={() => setFilter('active')}
            >
              대화 목록
            </Button>
            <Button
              size="sm"
              variant={filter === 'archived' ? 'secondary' : 'ghost'}
              className="flex-1 text-xs h-7 font-bold gap-1"
              onClick={() => setFilter('archived')}
            >
              <Archive className="size-3" />
              보관함
            </Button>
          </div>
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredList.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="mx-auto size-8 opacity-40 mb-2" />
              <p className="text-sm font-semibold">
                {filter === 'archived' ? '보관된 대화가 없어요.' : '주고받은 쪽지가 없어요.'}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                회원 프로필에서 [쪽지 보내기]를 눌러 대화를 시작할 수 있습니다.
              </p>
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
                      <span className="font-bold text-sm truncate text-foreground">
                        {item.peer_display_name}
                      </span>
                      {item.last_message_at && (
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {new Date(item.last_message_at).toLocaleDateString([], {
                            month: 'numeric',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate leading-relaxed">
                      {item.last_message_body || '대화가 시작되었습니다.'}
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
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              title="대화방을 선택해 주세요"
              description="좌측 목록에서 대화방을 선택하거나, 회원 프로필에서 [쪽지 보내기]를 눌러 1:1 쪽지를 시작해 보세요."
            />
          </div>
        )}
      </main>
    </div>
  );
}
