'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, MoreVertical, Archive, ShieldAlert, CheckCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ChatConversation, ChatMessage } from './actions';
import { sendMessageAction, markAsReadAction, archiveConversationAction } from './actions';

interface ChatRoomProps {
  readonly conversation: ChatConversation;
  readonly initialMessages: readonly ChatMessage[];
  readonly onBack?: () => void;
  readonly onMessageSent?: () => void;
}

export function ChatRoom({ conversation, initialMessages, onBack, onMessageSent }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([...initialMessages]);
  const [inputBody, setInputBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on messages change
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setMessages([...initialMessages]);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
    // Mark as read if there are unread incoming messages
    const latestSeq = Number.parseInt(conversation.latest_sequence, 10) || 0;
    const lastRead = Number.parseInt(conversation.last_read_sequence, 10) || 0;
    if (latestSeq > lastRead) {
      markAsReadAction(conversation.conversation_id, latestSeq);
    }
  }, [conversation.conversation_id, conversation.latest_sequence, conversation.last_read_sequence, messages.length]);

  // Smart Polling every 4 seconds for fresh messages
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(conversation.conversation_id)}/messages?limit=50`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch {
        // silent background poll failure
      }
    };

    const interval = setInterval(fetchLatest, 4000);
    return () => clearInterval(interval);
  }, [conversation.conversation_id]);

  const handleSend = () => {
    const trimmed = inputBody.trim();
    if (!trimmed || isPending) return;

    // Optimistic message append
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversation_id: conversation.conversation_id,
      sender_id: 'me',
      sequence: (Number.parseInt(conversation.latest_sequence, 10) + 1).toString(),
      body: trimmed,
      created_at: new Date().toISOString(),
      is_mine: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputBody('');
    setTimeout(scrollToBottom, 50);

    startTransition(async () => {
      const formData = new FormData();
      formData.set('conversationId', conversation.conversation_id);
      formData.set('body', trimmed);
      const res = await sendMessageAction({ status: 'idle' }, formData);

      if (res.status === 'error') {
        toast.error(res.message || '메시지 전송에 실패했어요.');
        // Revert optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        onMessageSent?.();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleArchive = () => {
    startTransition(async () => {
      const res = await archiveConversationAction(conversation.conversation_id, true);
      if (res.status === 'ok') {
        toast.success(res.message);
        onBack?.();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] max-h-[750px] bg-card border rounded-2xl overflow-hidden shadow-sm">
      {/* Room Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="sm:hidden h-8 w-8 -ml-1 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${conversation.peer_user_id}`}
                className="font-semibold text-sm hover:underline truncate"
              >
                {conversation.peer_display_name}
              </Link>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                1:1 쪽지
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {conversation.state === 'active' ? '실시간 대화 가능' : '제한된 대화'}
            </span>
          </div>
        </div>

        {/* Room Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              대화방 보관
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive focus:text-destructive">
              <ShieldAlert className="h-4 w-4 mr-2" />
              상대방 차단 안내
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <p className="text-sm font-medium">대화 내용이 아직 없어요.</p>
            <p className="text-xs mt-1">상대방에게 첫 쪽지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.is_mine;
            const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm break-words whitespace-pre-wrap leading-relaxed shadow-sm ${
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted/70 text-foreground border rounded-tl-none'
                  }`}
                >
                  {m.body}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground px-1">
                  <span>{timeStr}</span>
                  {isMine && (
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500 inline" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Box */}
      <div className="p-3 border-t bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            ref={textareaRef}
            value={inputBody}
            onChange={(e) => setInputBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="쪽지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            maxLength={2000}
            rows={1}
            className="min-h-[44px] max-h-[120px] resize-none text-sm py-3 px-3.5 rounded-xl"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputBody.trim() || isPending}
            className="h-[44px] w-[44px] rounded-xl shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Block Information Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상대방 차단 및 보호 정책</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                머니버스는 안전한 1:1 쪽지 환경을 위해 <strong>상호 차단 정책</strong>을 지원합니다.
              </p>
              <p className="text-xs text-muted-foreground">
                상대방을 차단하면 이후 상대방이 보내는 모든 쪽지는 서버 권위 규칙에 따라 자동 거절되며,
                양방향 신규 메시지 전송이 즉시 차단됩니다. 차단 관리는 <strong>계정 보안 및 개인정보 센터</strong>에서 관리할 수 있습니다.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              확인
            </Button>
            <Button asChild variant="destructive">
              <Link href="/account/privacy">개인정보 및 차단 관리 이동</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
