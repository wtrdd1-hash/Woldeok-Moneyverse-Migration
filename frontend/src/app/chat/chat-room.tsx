'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Archive,
  ShieldAlert,
  ShieldCheck,
  CheckCheck,
  BellOff,
  Bell,
  Flag,
  AlertCircle,
} from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import type { ChatConversation, ChatMessage } from './actions';
import {
  sendMessageAction,
  markAsReadAction,
  archiveConversationAction,
  muteConversationAction,
  blockUserAction,
  unblockUserAction,
  reportConversationAction,
} from './actions';

interface ChatRoomProps {
  readonly conversation: ChatConversation;
  readonly initialMessages: readonly ChatMessage[];
  readonly onBack?: () => void;
  readonly onMessageSent?: () => void;
}

export function ChatRoom({ conversation, initialMessages, onBack, onMessageSent }: ChatRoomProps) {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([...initialMessages]);
  const [inputBody, setInputBody] = useState('');
  const [isPending, startTransition] = useTransition();

  // Safety & Moderation States
  const [isMuted, setIsMuted] = useState(conversation.muted);
  const [isBlocked, setIsBlocked] = useState(Boolean(conversation.is_peer_blocked));
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('spam_promotional');
  const [reportDetails, setReportDetails] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [hasMore, setHasMore] = useState(initialMessages.length >= 50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Auto-scroll to bottom on messages change
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadPreviousMessages = async () => {
    if (isLoadingMore || !hasMore || messages.length === 0) return;
    const oldestSeq = Number.parseInt(messages[0]?.sequence ?? '0', 10);
    if (!oldestSeq || oldestSeq <= 1) {
      setHasMore(false);
      return;
    }

    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/app-api/v1/chat/conversations/${encodeURIComponent(conversation.conversation_id)}/messages?limit=50&beforeSequence=${oldestSeq}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          const prevScrollHeight = scrollRef.current?.scrollHeight ?? 0;
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            return [...newMsgs, ...prev];
          });
          if (data.messages.length < 50) {
            setHasMore(false);
          }
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevScrollHeight;
            }
          });
        } else {
          setHasMore(false);
        }
      }
    } catch {
      // silent background failure
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0 && hasMore && !isLoadingMore) {
      loadPreviousMessages();
    }
  };

  useEffect(() => {
    setMessages([...initialMessages]);
  }, [initialMessages]);

  useEffect(() => {
    setIsMuted(conversation.muted);
    setIsBlocked(Boolean(conversation.is_peer_blocked));
  }, [conversation.muted, conversation.is_peer_blocked]);

  useEffect(() => {
    scrollToBottom();
    // Mark as read if there are unread incoming messages
    const latestSeq = Number.parseInt(conversation.latest_sequence, 10) || 0;
    const lastRead = Number.parseInt(conversation.last_read_sequence, 10) || 0;
    if (latestSeq > lastRead) {
      markAsReadAction(conversation.conversation_id, latestSeq);
    }
  }, [conversation.conversation_id, conversation.latest_sequence, conversation.last_read_sequence, messages.length]);

  // Smart Polling & Delta Sync for fresh messages
  useEffect(() => {
    const fetchLatestOrSync = async () => {
      try {
        const latestLocalSeq = messages.length > 0
          ? Math.max(...messages.map((m) => Number.parseInt(m.sequence, 10) || 0))
          : 0;

        if (latestLocalSeq > 0) {
          const res = await fetch(
            `/app-api/v1/chat/conversations/${encodeURIComponent(conversation.conversation_id)}/sync?sinceSequence=${latestLocalSeq}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
                if (newMsgs.length === 0) return prev;
                return [...prev, ...newMsgs];
              });
              setTimeout(scrollToBottom, 50);
            }
            return;
          }
        }

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

    const interval = setInterval(fetchLatestOrSync, 4000);
    return () => clearInterval(interval);
  }, [conversation.conversation_id, messages]);

  const handleSend = () => {
    const trimmed = inputBody.trim();
    if (!trimmed || isPending || isBlocked) return;

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

  // Prevent sending during Korean IME composition (한글 자모 조합 오발송 방지)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle Mute Action
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    startTransition(async () => {
      const res = await muteConversationAction(conversation.conversation_id, nextMuted);
      if (res.status === 'ok') {
        setIsMuted(nextMuted);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  // Block User Action
  const handleBlockUser = () => {
    startTransition(async () => {
      const res = await blockUserAction(conversation.peer_user_id);
      if (res.status === 'ok') {
        setIsBlocked(true);
        setShowBlockDialog(false);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  // Unblock User Action
  const handleUnblockUser = () => {
    startTransition(async () => {
      const res = await unblockUserAction(conversation.peer_user_id);
      if (res.status === 'ok') {
        setIsBlocked(false);
        setShowUnblockDialog(false);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  // Report Conversation Action
  const handleReportConversation = () => {
    if (!reportDetails.trim()) {
      toast.error('신고 사유를 작성해 주세요.');
      return;
    }

    startTransition(async () => {
      const res = await reportConversationAction(
        conversation.conversation_id,
        reportReason,
        reportDetails.trim(),
      );
      if (res.status === 'ok') {
        setShowReportDialog(false);
        setReportDetails('');
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="sm:hidden h-10 w-10 min-w-[40px] -ml-1 text-muted-foreground"
            >
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
                {localeLabel(locale, '1:1 쪽지', '1:1 Direct', '1:1 メッセージ', '1对1私信')}
              </Badge>
              {isMuted && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-1 text-muted-foreground">
                  <BellOff className="size-2.5" />
                  {localeLabel(locale, '음소거', 'Muted', 'ミュート', '静音')}
                </Badge>
              )}
              {isBlocked && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 gap-1">
                  {localeLabel(locale, '차단됨', 'Blocked', 'ブロック中', '已屏蔽')}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {isBlocked
                ? localeLabel(locale, '차단된 대화방', 'Blocked conversation', 'ブロックされた会話', '已屏蔽的对话')
                : conversation.state === 'active'
                ? localeLabel(locale, '실시간 대화 가능', 'Active conversation', 'リアルタイム会話可能', '实时对话中')
                : localeLabel(locale, '제한된 대화', 'Restricted conversation', '制限された会話', '受限对话')}
            </span>
          </div>
        </div>

        {/* Room Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 min-w-[36px] text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={handleToggleMute}>
              {isMuted ? (
                <>
                  <Bell className="h-4 w-4 mr-2 text-primary" />
                  {localeLabel(locale, '알림 다시 켜기', 'Unmute notifications', '通知をオンに戻す', '开启消息通知')}
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2 text-muted-foreground" />
                  {localeLabel(locale, '대화방 알림 음소거', 'Mute conversation', '会話の通知をミュート', '静音此对话')}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2 text-muted-foreground" />
              {localeLabel(locale, '대화방 보관함 이동', 'Archive conversation', 'アーカイブに移動', '移至归档箱')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-amber-600 dark:text-amber-400">
              <Flag className="h-4 w-4 mr-2" />
              {localeLabel(locale, '대화 내용 신고하기', 'Report conversation', 'メッセージを通報する', '举报不当内容')}
            </DropdownMenuItem>
            {isBlocked ? (
              <DropdownMenuItem onClick={() => setShowUnblockDialog(true)} className="text-primary font-medium">
                <ShieldCheck className="h-4 w-4 mr-2" />
                {localeLabel(locale, '상대방 차단 해제', 'Unblock member', 'ブロックを解除する', '解除用户屏蔽')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive focus:text-destructive">
                <ShieldAlert className="h-4 w-4 mr-2" />
                {localeLabel(locale, '상대방 차단하기', 'Block member', '相手をブロックする', '屏蔽此用户')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Blocked Alert Banner */}
      {isBlocked && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-xs text-destructive flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle className="size-4 shrink-0" />
            <span className="truncate">
              {localeLabel(
                locale,
                '차단된 회원과의 대화입니다. 메시지를 전송하거나 받을 수 없습니다.',
                'This conversation is blocked. You cannot send or receive messages.',
                'ブロックされた会員との会話です。メッセージの送受信はできません。',
                '与已屏蔽用户的对话。无法发送或接收消息。',
              )}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowUnblockDialog(true)}
            className="h-6 text-[11px] px-2 text-destructive border-destructive/30 hover:bg-destructive/15 shrink-0"
          >
            {localeLabel(locale, '차단 해제', 'Unblock', '解除', '解除屏蔽')}
          </Button>
        </div>
      )}

      {/* Message List */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
        {hasMore && (
          <div className="flex justify-center py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPreviousMessages}
              disabled={isLoadingMore}
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
            >
              {isLoadingMore
                ? localeLabel(locale, '이전 대화 불러오는 중...', 'Loading history…', '履歴を読み込み中…', '正在加载历史记录…')
                : localeLabel(locale, '이전 대화 더보기', 'Load older messages', '過去のメッセージを読み込む', '加载更多历史消息')}
            </Button>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <p className="text-sm font-medium">
              {localeLabel(locale, '대화 내용이 아직 없어요.', 'No messages here yet.', 'メッセージはまだありません。', '暂无对话记录。')}
            </p>
            <p className="text-xs mt-1">
              {localeLabel(locale, '상대방에게 첫 쪽지를 보내보세요!', 'Send the first direct message!', '相手に最初のメッセージを送ってみましょう！', '向对方发送第一条私信吧！')}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.is_mine;
            const timeStr = new Date(m.created_at).toLocaleTimeString(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : locale === 'zh' ? 'zh-CN' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

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
                <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground px-1 font-mono">
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

      {/* Message Input Box (44px Touch Target) */}
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
            disabled={isBlocked || isPending}
            placeholder={
              isBlocked
                ? localeLabel(locale, '차단된 회원에게는 메시지를 보낼 수 없습니다.', 'Cannot message a blocked user.', 'ブロック中のユーザーには送信できません。', '无法向已屏蔽用户发送消息。')
                : localeLabel(locale, '쪽지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)', 'Type a message… (Enter to send, Shift+Enter for new line)', 'メッセージを入力… (Enter: 送信, Shift+Enter: 改行)', '输入私信内容… (Enter发送，Shift+Enter换行)')
            }
            maxLength={2000}
            rows={1}
            className="min-h-[44px] max-h-[120px] resize-none text-sm py-3 px-3.5 rounded-xl disabled:bg-muted/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputBody.trim() || isPending || isBlocked}
            className="h-[44px] w-[44px] min-w-[44px] rounded-xl shrink-0 active:scale-[0.98] transition-transform"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* 1. Block Confirmation Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{localeLabel(locale, '상대방을 차단하시겠습니까?', 'Block this member?', 'この会員をブロックしますか？', '确定要屏蔽该用户吗？')}</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                <strong>{conversation.peer_display_name}</strong> {localeLabel(
                  locale,
                  '님을 차단하면 이후 상대방이 보내는 모든 쪽지는 서버 권위 규칙에 따라 안전하게 자동 거절되며, 양방향 신규 메시지 전송이 즉시 중단됩니다.',
                  'will no longer be able to message you. New incoming direct messages will be rejected by the server authority rules, and sending messages will be blocked.',
                  '様をブロックすると、相手からのメッセージは自動的に拒否され、双方向のメッセージ送受信が即座に停止されます。',
                  '屏蔽后对方发送的所有私信将被服务器自动拒绝，且双向即时停止消息发送。',
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {localeLabel(
                  locale,
                  '차단 여부는 상대방에게 직접 노출되지 않으며, 대화방 목록 상단 메뉴에서 언제든 차단을 해제할 수 있습니다.',
                  'The user is not explicitly notified of this block. You can unblock them anytime from the room menu.',
                  'ブロック状態は相手に直接通知されず、メニューからいつでもブロックを解除できます。',
                  '屏蔽状态不会通知对方，您可随时在菜单中解除屏蔽。',
                )}
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              {localeLabel(locale, '취소', 'Cancel', 'キャンセル', '取消')}
            </Button>
            <Button variant="destructive" onClick={handleBlockUser} disabled={isPending}>
              {isPending
                ? localeLabel(locale, '차단 처리 중...', 'Blocking…', 'ブロック処理中…', '正在屏蔽…')
                : localeLabel(locale, '차단하기', 'Block', 'ブロックする', '确认屏蔽')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Unblock Confirmation Dialog */}
      <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{localeLabel(locale, '상대방 차단을 해제하시겠습니까?', 'Unblock this member?', 'ブロックを解除しますか？', '确定要解除屏蔽吗？')}</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                <strong>{conversation.peer_display_name}</strong> {localeLabel(
                  locale,
                  '님의 차단을 해제하면 다시 정상적으로 1:1 쪽지를 주고받을 수 있습니다.',
                  'will be unblocked and you can resume exchanging 1:1 direct messages.',
                  '様のブロックを解除すると、再び1:1メッセージの送受信が可能になります。',
                  '解除屏蔽后可重新正常收发1对1私信。',
                )}
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowUnblockDialog(false)}>
              {localeLabel(locale, '취소', 'Cancel', 'キャンセル', '取消')}
            </Button>
            <Button variant="default" onClick={handleUnblockUser} disabled={isPending}>
              {isPending
                ? localeLabel(locale, '해제 처리 중...', 'Unblocking…', '解除処理中…', '正在解除…')
                : localeLabel(locale, '차단 해제하기', 'Unblock', '解除する', '解除屏蔽')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Report Conversation Modal Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="size-5 text-amber-500" />
              {localeLabel(locale, '부적절한 대화 내용 신고', 'Report Inappropriate Conversation', '不適切なメッセージを通報', '举报违规私信内容')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {localeLabel(
                locale,
                '신고 시 최근 대화 내용(최대 10개 메시지)이 증거 스냅샷으로 캡처되어 관리자 안전 센터에 불변 보존됩니다.',
                'Upon submission, the latest conversation snapshot (up to 10 messages) is securely logged to the Trust & Safety audit desk.',
                '通報時、直近の会話履歴（最大10件）が証拠スナップショットとして安全管理センターに保存されます。',
                '举报时最近的对话内容（最多10条）将作为证据快照保存至安全审核中心。',
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold">{localeLabel(locale, '신고 사유 선택', 'Select Reason', '通報理由の選択', '选择举报原因')}</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason} className="space-y-2">
                <div className="flex items-center space-x-2 rounded-lg border p-2.5 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="spam_promotional" id="r1" />
                  <Label htmlFor="r1" className="text-xs font-medium cursor-pointer flex-1">
                    {localeLabel(locale, '스팸, 도배 및 상업적 광고 홍보', 'Spam, flood or unauthorized advertising', 'スパム、連投および商業宣伝', '垃圾信息、刷屏及未经授权的商业广告')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-2.5 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="fraud_scam" id="r2" />
                  <Label htmlFor="r2" className="text-xs font-medium cursor-pointer flex-1">
                    {localeLabel(locale, '금융 사기, 피싱 및 불법 송금 요구', 'Financial fraud, phishing or illicit transfers', '金融詐欺、フィッシングおよび不正送金要求', '金融诈骗、网络钓鱼及非法转账索要')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-2.5 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="abuse_harassment" id="r3" />
                  <Label htmlFor="r3" className="text-xs font-medium cursor-pointer flex-1">
                    {localeLabel(locale, '언어폭력, 협박, 성희롱 및 악의적 괴롭힘', 'Verbal abuse, threats, harassment or hate speech', '暴言、脅迫、セクハラおよび悪意ある嫌がらせ', '辱骂、恐吓、性骚扰及恶意骚扰')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-2.5 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="other" id="r4" />
                  <Label htmlFor="r4" className="text-xs font-medium cursor-pointer flex-1">
                    {localeLabel(locale, '기타 커뮤니티 이용 규약 위반', 'Other Community Guideline violations', 'その他コミュニティ利用規約違反', '其他违反社区规范的行为')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details" className="text-xs font-bold">
                {localeLabel(locale, '상세 소명 내용', 'Details', '詳細内容', '详细说明')}
              </Label>
              <Textarea
                id="report-details"
                placeholder={localeLabel(locale, '구체적인 위반 사항을 작성해 주세요 (최소 2자 이상).', 'Please describe the specific issue in detail (min 2 characters).', '具体的な違反内容を記述してください（2文字以上）。', '请详细描述具体违规情况（至少2个字）。')}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                maxLength={2000}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              {localeLabel(locale, '취소', 'Cancel', 'キャンセル', '取消')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportConversation}
              disabled={!reportDetails.trim() || isPending}
            >
              {isPending
                ? localeLabel(locale, '신고 접수 중...', 'Submitting…', '送信中…', '正在提交…')
                : localeLabel(locale, '신고 제출', 'Submit Report', '通報を送信', '提交举报')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
