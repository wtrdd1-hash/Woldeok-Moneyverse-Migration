'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Headphones,
  MessageSquare,
  Send,
  X,
  ChevronLeft,
  Plus,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  BookOpen,
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  User,
  BellOff,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useViewer } from '@/lib/use-viewer';
import { useLocale } from '@/components/locale-provider';
import { synthSound } from '@/lib/audio/synth-sound';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

// ==========================================
// 1. 모델 인터페이스 (고객지원 & 1:1 쪽지)
// ==========================================

interface SupportThread {
  readonly thread_id: string;
  readonly subject: string;
  readonly status: 'open' | 'waiting_user' | 'resolved' | string;
  readonly created_at: string;
  readonly last_message_at: string;
}

interface SupportMessage {
  readonly message_id: string;
  readonly sender_kind: 'user' | 'admin';
  readonly body: string;
  readonly created_at: string;
}

interface DirectConversation {
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

interface DirectChatMessage {
  readonly id: string;
  readonly conversation_id: string;
  readonly sender_id: string;
  readonly sequence: string;
  readonly body: string;
  readonly created_at: string;
  readonly is_mine: boolean;
}

const CATEGORY_PRESETS = [
  { label: '계정/인증', prefix: '[계정/인증] ' },
  { label: 'WLD 원장', prefix: '[WLD 원장] ' },
  { label: '주식/거래소', prefix: '[주식/거래소] ' },
  { label: '버그 제보', prefix: '[버그 제보] ' },
  { label: '건의사항', prefix: '[건의사항] ' },
] as const;

const STATUS_MAP: Record<string, { labelKo: string; labelEn: string; color: string; badge: string }> = {
  open: {
    labelKo: '답변 대기 중',
    labelEn: 'Waiting Reply',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    badge: '대기',
  },
  waiting_user: {
    labelKo: '관리자 답변 도착',
    labelEn: 'Admin Replied',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    badge: '답변완료',
  },
  resolved: {
    labelKo: '처리 완료',
    labelEn: 'Resolved',
    color: 'text-muted-foreground bg-muted/40 border-border',
    badge: '완료',
  },
};

function formatTimeAgo(isoString: string, isEn: boolean): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return isEn ? 'Just now' : '방금 전';
    if (diffMin < 60) return isEn ? `${diffMin}m ago` : `${diffMin}분 전`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return isEn ? `${diffHours}h ago` : `${diffHours}시간 전`;
    const diffDays = Math.floor(diffHours / 24);
    return isEn ? `${diffDays}d ago` : `${diffDays}일 전`;
  } catch {
    return '';
  }
}

// ==========================================
// 2. 통합 플로팅 채팅 컴포넌트
// ==========================================

export function FloatingSupportChatWidget() {
  const viewer = useViewer();
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const isSignedIn = Boolean(viewer?.signedIn);

  // 팝오버 열림/닫힘 및 메인 탭 ('support' | 'direct')
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'support' | 'direct'>('support');

  // 고객센터(Support) 상태
  const [supportView, setSupportView] = useState<'list' | 'chat' | 'new'>('list');
  const [threads, setThreads] = useState<readonly SupportThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
  const [supportMessages, setSupportMessages] = useState<readonly SupportMessage[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [supportReplyText, setSupportReplyText] = useState('');

  // 1:1 개인 쪽지(Direct Chat) 상태
  const [directView, setDirectView] = useState<'list' | 'chat'>('list');
  const [conversations, setConversations] = useState<readonly DirectConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<DirectConversation | null>(null);
  const [directMessages, setDirectMessages] = useState<readonly DirectChatMessage[]>([]);
  const [directReplyText, setDirectReplyText] = useState('');
  const [directSearch, setDirectSearch] = useState('');

  // 공통 UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // 알림 감지 레퍼런스
  const prevWaitingCount = useRef<number>(0);
  const prevDirectUnread = useRef<number>(0);
  const prevSupportMsgCount = useRef<number>(0);
  const prevDirectMsgCount = useRef<number>(0);

  // 음소거 설정 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moneyverse_support_muted');
      if (saved === 'true') {
        setIsMuted(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // 음소거 토글
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('moneyverse_support_muted', String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // ----------------------------------------------------
  // A. 고객센터(Support) 데이터 페칭 & 액션
  // ----------------------------------------------------

  const fetchThreads = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/app-api/v1/support/threads', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: SupportThread[] = data.threads ?? [];
        setThreads(list);

        // 관리자 새 답변 감지 시 차임벨 및 토스트
        const waitingCount = list.filter((t) => t.status === 'waiting_user').length;
        if (prevWaitingCount.current < waitingCount) {
          if (!isMuted) {
            synthSound.playNotificationChime();
          }
          toast.success(isEn ? 'New admin reply received!' : '관리자 답변이 도착했습니다!', {
            description: isEn ? 'Check your 1:1 support chat.' : '1:1 문의 대화창에서 확인해 보세요.',
            action: {
              label: isEn ? 'View' : '보기',
              onClick: () => {
                setIsOpen(true);
                setActiveTab('support');
                setSupportView('list');
              },
            },
          });
        }
        prevWaitingCount.current = waitingCount;
      }
    } catch {
      // ignore
    }
  }, [isSignedIn, isEn, isMuted]);

  const fetchSupportMessages = useCallback(
    async (threadId: string) => {
      try {
        const res = await fetch(`/app-api/v1/support/threads/${encodeURIComponent(threadId)}/messages`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          const list: SupportMessage[] = data.messages ?? [];
          setSupportMessages(list);

          if (prevSupportMsgCount.current > 0 && list.length > prevSupportMsgCount.current) {
            const lastMsg = list[list.length - 1];
            if (lastMsg?.sender_kind === 'admin' && !isMuted) {
              synthSound.playNotificationChime();
            }
          }
          prevSupportMsgCount.current = list.length;
        }
      } catch {
        // ignore
      }
    },
    [isMuted]
  );

  // ----------------------------------------------------
  // B. 1:1 개인 쪽지(Direct Chat) 데이터 페칭 & 액션
  // ----------------------------------------------------

  const fetchConversations = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/app-api/v1/chat/conversations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: DirectConversation[] = data.conversations ?? [];
        setConversations(list);

        // 쪽지 안읽음 수 합산 및 새 쪽지 감지
        const totalUnread = list.reduce((acc, c) => acc + (Number.parseInt(c.unread_count, 10) || 0), 0);
        if (prevDirectUnread.current < totalUnread) {
          if (!isMuted) {
            synthSound.playNotificationChime();
          }
          toast.info(isEn ? 'New direct message received!' : '새 1:1 쪽지가 도착했습니다!', {
            description: isEn ? 'Check your direct chat hub.' : '1:1 쪽지 대화창에서 확인해 보세요.',
            action: {
              label: isEn ? 'Open' : '열기',
              onClick: () => {
                setIsOpen(true);
                setActiveTab('direct');
                setDirectView('list');
              },
            },
          });
        }
        prevDirectUnread.current = totalUnread;
      }
    } catch {
      // ignore
    }
  }, [isSignedIn, isEn, isMuted]);

  const fetchDirectMessages = useCallback(
    async (convId: string) => {
      try {
        const res = await fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(convId)}/messages?limit=50`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          const list: DirectChatMessage[] = data.messages ?? [];
          setDirectMessages(list);

          if (prevDirectMsgCount.current > 0 && list.length > prevDirectMsgCount.current) {
            const lastMsg = list[list.length - 1];
            if (lastMsg && !lastMsg.is_mine && !isMuted) {
              synthSound.playNotificationChime();
            }
          }
          prevDirectMsgCount.current = list.length;
        }
      } catch {
        // ignore
      }
    },
    [isMuted]
  );

  // ----------------------------------------------------
  // C. 주기적 폴링 및 동기화
  // ----------------------------------------------------

  useEffect(() => {
    if (!isSignedIn) return;
    if (isOpen) {
      setIsLoading(true);
      Promise.all([fetchThreads(), fetchConversations()]).finally(() => setIsLoading(false));
    }
  }, [isOpen, isSignedIn, fetchThreads, fetchConversations]);

  // 대화창 열림 시 5초, 닫힘 시 30초 주기 폴링
  useEffect(() => {
    if (!isSignedIn) return;
    const isChatActive =
      isOpen &&
      ((activeTab === 'support' && supportView === 'chat' && selectedThread) ||
        (activeTab === 'direct' && directView === 'chat' && selectedConversation));

    const intervalTime = isChatActive ? 5000 : 30000;
    const interval = setInterval(() => {
      if (isOpen) {
        if (activeTab === 'support' && supportView === 'chat' && selectedThread) {
          fetchSupportMessages(selectedThread.thread_id);
        } else if (activeTab === 'direct' && directView === 'chat' && selectedConversation) {
          fetchDirectMessages(selectedConversation.conversation_id);
        }
        fetchThreads();
        fetchConversations();
      } else {
        fetchThreads();
        fetchConversations();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [
    isOpen,
    activeTab,
    supportView,
    directView,
    selectedThread,
    selectedConversation,
    isSignedIn,
    fetchThreads,
    fetchConversations,
    fetchSupportMessages,
    fetchDirectMessages,
  ]);

  // 하단 스크롤 자동 이동
  useEffect(() => {
    if (
      (activeTab === 'support' && supportView === 'chat') ||
      (activeTab === 'direct' && directView === 'chat')
    ) {
      if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeTab, supportView, directView, supportMessages, directMessages]);

  // ----------------------------------------------------
  // D. 고객지원 핸들러
  // ----------------------------------------------------

  const handleSelectSupportThread = (thread: SupportThread) => {
    setSelectedThread(thread);
    setSupportView('chat');
    setIsLoading(true);
    prevSupportMsgCount.current = 0;
    fetchSupportMessages(thread.thread_id).finally(() => setIsLoading(false));
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim() || isSending) return;

    setIsSending(true);
    try {
      const sessionRes = await fetch('/app-api/v1/auth/session');
      const sessionData = await sessionRes.json();
      const csrfToken = sessionData.csrfToken ?? '';

      const idempotencyKey = crypto.randomUUID();
      const res = await fetch('/app-api/v1/support/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          subject: newSubject.trim().slice(0, 120),
          body: newBody.trim().slice(0, 2000),
          idempotencyKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!isMuted) synthSound.playMessageSent();
        toast.success(isEn ? 'Support inquiry submitted!' : '문의가 성공적으로 접수되었습니다!');
        setNewSubject('');
        setNewBody('');
        await fetchThreads();
        if (data.thread) {
          handleSelectSupportThread(data.thread);
        } else {
          setSupportView('list');
        }
      } else {
        toast.error(isEn ? 'Failed to submit inquiry.' : '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch {
      toast.error(isEn ? 'Network error occurred.' : '네트워크 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSupportReply = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!supportReplyText.trim() || !selectedThread || isSending) return;

    const textToSend = supportReplyText.trim();
    setSupportReplyText('');
    setIsSending(true);

    try {
      const sessionRes = await fetch('/app-api/v1/auth/session');
      const sessionData = await sessionRes.json();
      const csrfToken = sessionData.csrfToken ?? '';

      const idempotencyKey = crypto.randomUUID();
      const res = await fetch(`/app-api/v1/support/threads/${encodeURIComponent(selectedThread.thread_id)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          body: textToSend.slice(0, 2000),
          idempotencyKey,
        }),
      });

      if (res.ok) {
        if (!isMuted) synthSound.playMessageSent();
        await fetchSupportMessages(selectedThread.thread_id);
      } else {
        toast.error(isEn ? 'Failed to send message.' : '메시지 전송에 실패했습니다.');
        setSupportReplyText(textToSend);
      }
    } catch {
      toast.error(isEn ? 'Network error occurred.' : '네트워크 오류가 발생했습니다.');
      setSupportReplyText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // ----------------------------------------------------
  // E. 1:1 개인 쪽지 핸들러
  // ----------------------------------------------------

  const handleSelectDirectConversation = async (conv: DirectConversation) => {
    setSelectedConversation(conv);
    setDirectView('chat');
    setIsLoading(true);
    prevDirectMsgCount.current = 0;

    // 읽음 처리 전송
    const latestSeq = Number.parseInt(conv.latest_sequence, 10) || 0;
    if (latestSeq > 0) {
      try {
        const sessionRes = await fetch('/app-api/v1/auth/session');
        const sessionData = await sessionRes.json();
        const csrfToken = sessionData.csrfToken ?? '';

        fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(conv.conversation_id)}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ sequence: latestSeq }),
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    }

    fetchDirectMessages(conv.conversation_id).finally(() => {
      setIsLoading(false);
      fetchConversations();
    });
  };

  const handleSendDirectReply = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!directReplyText.trim() || !selectedConversation || isSending) return;

    const textToSend = directReplyText.trim();
    setDirectReplyText('');
    setIsSending(true);

    try {
      const sessionRes = await fetch('/app-api/v1/auth/session');
      const sessionData = await sessionRes.json();
      const csrfToken = sessionData.csrfToken ?? '';

      const idempotencyKey = crypto.randomUUID();
      const res = await fetch(`/app-api/v1/chat/conversations/${encodeURIComponent(selectedConversation.conversation_id)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          body: textToSend.slice(0, 2000),
          idempotencyKey,
        }),
      });

      if (res.ok) {
        if (!isMuted) synthSound.playMessageSent();
        await fetchDirectMessages(selectedConversation.conversation_id);
        fetchConversations();
      } else {
        toast.error(isEn ? 'Failed to send direct message.' : '쪽지 전송에 실패했습니다.');
        setDirectReplyText(textToSend);
      }
    } catch {
      toast.error(isEn ? 'Network error occurred.' : '네트워크 오류가 발생했습니다.');
      setDirectReplyText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyChat = (kind: 'support' | 'direct') => {
    let text = '';
    if (kind === 'support') {
      text = supportMessages.map((m) => `[${m.sender_kind === 'admin' ? '운영팀' : '나'}] ${m.body}`).join('\n\n');
    } else {
      text = directMessages
        .map((m) => `[${m.is_mine ? '나' : selectedConversation?.peer_display_name ?? '상대'}] ${m.body}`)
        .join('\n\n');
    }
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(isEn ? 'Chat transcript copied!' : '대화 내용이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  // 알림 뱃지 수 계산
  const waitingAdminReplies = threads.filter((t) => t.status === 'waiting_user').length;
  const totalDirectUnread = conversations.reduce((acc, c) => acc + (Number.parseInt(c.unread_count, 10) || 0), 0);
  const totalNotificationBadge = waitingAdminReplies + totalDirectUnread;

  // 1:1 쪽지 필터링 목록
  const filteredConversations = conversations.filter((c) => {
    if (!directSearch.trim()) return true;
    const q = directSearch.toLowerCase();
    return c.peer_display_name.toLowerCase().includes(q) || (c.last_message_body && c.last_message_body.toLowerCase().includes(q));
  });

  return (
    <>
      {/* 1. 플로팅 챗 버블 트리거 버튼 */}
      <div className="fixed bottom-[74px] right-3.5 sm:bottom-6 sm:right-6 z-40 select-none flex flex-col items-end">
        {/* 데스크톱 마이크로 툴팁 배너 */}
        {!isOpen && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-card/95 border border-border/80 shadow-lg text-[11px] font-bold text-foreground backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isEn ? '1:1 Chat & Support' : '1:1 채팅 · 고객지원'}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isOpen && !isMuted) synthSound.playClick();
            setIsOpen((prev) => !prev);
          }}
          className={cn(
            'group relative flex size-12 sm:size-13 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 outline-none',
            isOpen
              ? 'bg-muted border-2 border-border text-foreground'
              : 'bg-gradient-to-br from-amber-500 via-primary to-amber-600 text-primary-foreground border-2 border-amber-400/50 hover:scale-105 hover:shadow-primary/40 ring-4 ring-amber-500/20 hover:ring-amber-500/40'
          )}
          aria-label={isEn ? 'Toggle chat & support hub' : '1:1 채팅 및 고객센터 열기/닫기'}
        >
          {isOpen ? (
            <X className="size-5 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <Headphones className="size-5.5 sm:size-6 transition-transform duration-200 group-hover:scale-110" />
          )}

          {/* 통합 알림 뱃지 */}
          {!isOpen && totalNotificationBadge > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-600 font-mono text-[11px] font-black text-white shadow-md ring-2 ring-background animate-bounce">
              {totalNotificationBadge}
            </span>
          )}
        </button>
      </div>

      {/* 2. 채널톡/인터콤 스타일 통합 팝업 대화창 */}
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed bottom-[130px] right-3.5 sm:bottom-22 sm:right-6 z-40 w-[calc(100vw-1.75rem)] max-w-[380px] h-[min(550px,calc(100dvh-9.5rem))] flex flex-col rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 text-foreground"
        >
          {/* A. 팝오버 상단 글로벌 헤더 */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/70 bg-muted/40 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* 뒤로가기 버튼 */}
              {((activeTab === 'support' && supportView !== 'list') || (activeTab === 'direct' && directView !== 'list')) && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'support') {
                      setSupportView('list');
                      setSelectedThread(null);
                    } else {
                      setDirectView('list');
                      setSelectedConversation(null);
                    }
                  }}
                  className="p-1 -ml-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isEn ? 'Back to list' : '목록으로 돌아가기'}
                >
                  <ChevronLeft className="size-4.5" />
                </button>
              )}

              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                {activeTab === 'support' ? <Headphones className="size-4" /> : <MessageSquare className="size-4" />}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black truncate">
                  {activeTab === 'support'
                    ? supportView === 'chat' && selectedThread
                      ? selectedThread.subject
                      : supportView === 'new'
                      ? (isEn ? 'New Support Ticket' : '새 문의 접수')
                      : (isEn ? 'Customer Support' : '고객센터 · 1:1 문의')
                    : directView === 'chat' && selectedConversation
                    ? selectedConversation.peer_display_name
                    : (isEn ? '1:1 Direct Chat' : '1:1 개인 쪽지함')}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{activeTab === 'support' ? (isEn ? 'Admin Online' : '운영진 상담 가동') : (isEn ? 'Encrypted Direct Chat' : '비공개 1:1 실시간 대화')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* 효과음 Mute 토글 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title={isMuted ? (isEn ? 'Unmute sound' : '효과음 켜기') : (isEn ? 'Mute sound' : '효과음 끄기')}
                aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              >
                {isMuted ? <VolumeX className="size-3.5 text-muted-foreground" /> : <Volume2 className="size-3.5 text-primary" />}
              </Button>

              {/* 전체 화면 열기 링크 */}
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title={isEn ? 'Open in full page' : '전체 화면으로 열기'}
              >
                <Link
                  href={
                    activeTab === 'support'
                      ? selectedThread
                        ? `/support?thread=${selectedThread.thread_id}`
                        : '/support'
                      : selectedConversation
                      ? `/chat?conversationId=${selectedConversation.conversation_id}`
                      : '/chat'
                  }
                >
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>

              {/* 닫기 버튼 */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label={isEn ? 'Close' : '닫기'}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* B. 듀얼 세그먼트 탭 스위처 ([👑 고객센터] ↔ [💬 1:1 쪽지]) */}
          {isSignedIn && (
            <div className="flex items-center p-1.5 bg-muted/30 border-b border-border/60 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('support');
                  if (!isMuted) synthSound.playClick();
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  activeTab === 'support'
                    ? 'bg-card text-foreground shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Headphones className="size-3.5" />
                <span>{isEn ? 'Support' : '고객센터'}</span>
                {waitingAdminReplies > 0 && (
                  <span className="size-4 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-black flex items-center justify-center">
                    {waitingAdminReplies}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('direct');
                  if (!isMuted) synthSound.playClick();
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  activeTab === 'direct'
                    ? 'bg-card text-foreground shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <MessageSquare className="size-3.5" />
                <span>{isEn ? '1:1 Direct' : '1:1 쪽지'}</span>
                {totalDirectUnread > 0 && (
                  <span className="size-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-black flex items-center justify-center">
                    {totalDirectUnread}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* C. 본문 영역 */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col min-h-0 bg-gradient-to-b from-card to-background/50">
            {/* 1. 비로그인 게스트 뷰 */}
            {!isSignedIn ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-4 space-y-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
                  <ShieldCheck className="size-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-foreground">
                    {isEn ? 'Sign in to use 1:1 Chat & Support' : '로그인 후 1:1 대화를 이용하세요'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed [word-break:keep-all]">
                    {isEn
                      ? 'Secure, encrypted 1:1 member conversations and official admin inquiries are tied to your account.'
                      : '회원 계정으로 로그인하시면 1:1 개인 쪽지 및 운영진 1:1 고객지원 서비스를 안전하게 이용하실 수 있습니다.'}
                  </p>
                </div>

                <Button asChild className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl shadow-md">
                  <Link href="/login">
                    <LogIn className="size-4" />
                    <span>{isEn ? 'Sign In Now' : '로그인하러 가기'}</span>
                  </Link>
                </Button>

                <div className="w-full pt-3 border-t border-border/60 text-left space-y-1.5 text-xs">
                  <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <BookOpen className="size-3.5" />
                    <span>{isEn ? 'Helpful Guides' : '자주 찾는 가이드'}</span>
                  </p>
                  <div className="grid gap-1">
                    <Link
                      href="/guide/getting-started"
                      className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-[11px] font-medium transition-colors flex items-center justify-between"
                    >
                      <span>💡 3분 머니버스 입문 가이드</span>
                      <ChevronLeft className="size-3 rotate-180 text-muted-foreground" />
                    </Link>
                    <Link
                      href="/guide/stock-trading"
                      className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-[11px] font-medium transition-colors flex items-center justify-between"
                    >
                      <span>📈 가상 주식 거래소 이용 안내</span>
                      <ChevronLeft className="size-3 rotate-180 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : activeTab === 'support' ? (
              /* 2. [고객센터 탭] */
              supportView === 'list' ? (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <Button
                    type="button"
                    onClick={() => setSupportView('new')}
                    className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    <Plus className="size-4" />
                    <span>{isEn ? 'Open New Support Inquiry' : '새 1:1 문의 작성하기'}</span>
                  </Button>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {isLoading ? (
                      <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                        <RotateCw className="size-5 animate-spin mx-auto text-primary" />
                        <p>{isEn ? 'Loading inquiries…' : '문의 내역을 불러오는 중…'}</p>
                      </div>
                    ) : threads.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground mx-auto">
                          <Headphones className="size-5" />
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {isEn ? 'No support tickets yet' : '접수된 문의 내역이 없습니다'}
                        </p>
                        <p className="text-[11px] text-muted-foreground [word-break:keep-all]">
                          {isEn ? 'Click the button above to ask anything.' : '궁금한 점이나 건의사항이 있다면 문의를 남겨주세요.'}
                        </p>
                      </div>
                    ) : (
                      threads.map((thread) => {
                        const statusMeta = STATUS_MAP[thread.status] ?? STATUS_MAP.open!;
                        return (
                          <button
                            key={thread.thread_id}
                            type="button"
                            onClick={() => handleSelectSupportThread(thread)}
                            className="w-full p-3 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-all text-left space-y-1.5 shadow-xs group"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                {thread.subject}
                              </span>
                              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0', statusMeta.color)}>
                                {isEn ? statusMeta.labelEn : statusMeta.labelKo}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                              <span>{formatTimeAgo(thread.last_message_at || thread.created_at, isEn)}</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">대화 열기 →</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : supportView === 'chat' && selectedThread ? (
                <div className="flex-1 flex flex-col min-h-0 space-y-3">
                  {/* 대화방 서브 헤더 */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="truncate max-w-[200px]">{selectedThread.subject}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                        {STATUS_MAP[selectedThread.status]?.badge ?? selectedThread.status}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyChat('support')}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>{copied ? '복사됨' : '복사'}</span>
                    </button>
                  </div>

                  {/* 메시지 스트림 */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
                    {isLoading && supportMessages.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        <RotateCw className="size-4 animate-spin mx-auto mb-1 text-primary" />
                        <span>{isEn ? 'Loading messages…' : '대화 내역을 불러오는 중…'}</span>
                      </div>
                    ) : supportMessages.length === 0 ? (
                      <p className="text-center py-6 text-xs text-muted-foreground">
                        {isEn ? 'No messages in this inquiry.' : '메시지가 없습니다.'}
                      </p>
                    ) : (
                      supportMessages.map((m) => {
                        const isAdminMsg = m.sender_kind === 'admin';
                        return (
                          <div
                            key={m.message_id}
                            className={cn('flex flex-col space-y-1 max-w-[88%] text-xs', isAdminMsg ? 'mr-auto' : 'ml-auto items-end')}
                          >
                            <span className="text-[10px] font-bold text-muted-foreground px-1">{isAdminMsg ? '👑 운영진 답변' : '나'}</span>
                            <div
                              className={cn(
                                'p-3 rounded-2xl leading-relaxed whitespace-pre-wrap break-words shadow-xs',
                                isAdminMsg
                                  ? 'bg-primary/15 border border-primary/30 text-foreground rounded-tl-xs'
                                  : 'bg-secondary text-foreground border border-border/60 rounded-tr-xs'
                              )}
                            >
                              {m.body}
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono px-1">{formatTimeAgo(m.created_at, isEn)}</span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                /* 새 문의 작성 폼 */
                <form onSubmit={handleCreateInquiry} className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    {/* 카테고리 프리셋 칩 */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">빠른 카테고리 선택</label>
                      <div className="flex flex-wrap gap-1">
                        {CATEGORY_PRESETS.map((cat) => {
                          const isSelected = newSubject.startsWith(cat.prefix);
                          return (
                            <button
                              key={cat.label}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setNewSubject(newSubject.replace(/^\[[^\]]+\]\s*/, ''));
                                } else {
                                  setNewSubject(`${cat.prefix}${newSubject.replace(/^\[[^\]]+\]\s*/, '')}`);
                                }
                              }}
                              className={cn(
                                'px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all active:scale-95',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                  : 'border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                              )}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inquiry-subject" className="text-xs font-bold text-foreground">
                        문의 제목
                      </label>
                      <input
                        id="inquiry-subject"
                        type="text"
                        maxLength={120}
                        required
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder={isEn ? 'Brief inquiry title' : '문의 제목을 입력하세요'}
                        className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inquiry-body" className="text-xs font-bold text-foreground">
                        상세 내용
                      </label>
                      <textarea
                        id="inquiry-body"
                        maxLength={2000}
                        required
                        rows={5}
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        placeholder={
                          isEn
                            ? 'Please describe your inquiry in detail.'
                            : '문의 내용이나 발생한 현상을 구체적으로 적어주세요.'
                        }
                        className="w-full p-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSending || !newSubject.trim() || !newBody.trim()}
                      className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <RotateCw className="size-3.5 animate-spin" />
                          <span>{isEn ? 'Submitting…' : '접수 중…'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>{isEn ? 'Submit Inquiry' : '1:1 문의 접수하기'}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )
            ) : (
              /* 3. [1:1 쪽지 탭] */
              directView === 'list' ? (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  {/* 검색창 */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={directSearch}
                      onChange={(e) => setDirectSearch(e.target.value)}
                      placeholder={isEn ? 'Search conversation or user' : '대화 상대 또는 메시지 검색'}
                      className="w-full h-8 pl-8 pr-3 rounded-xl border border-border/70 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                    />
                  </div>

                  {/* 대화방 목록 */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
                    {isLoading && conversations.length === 0 ? (
                      <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                        <RotateCw className="size-5 animate-spin mx-auto text-primary" />
                        <p>{isEn ? 'Loading direct messages…' : '쪽지 대화 목록을 불러오는 중…'}</p>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground mx-auto">
                          <MessageSquare className="size-5" />
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {directSearch.trim() ? (isEn ? 'No results found' : '검색 결과가 없습니다') : (isEn ? 'No direct messages yet' : '주고받은 1:1 쪽지가 없습니다')}
                        </p>
                        <p className="text-[11px] text-muted-foreground [word-break:keep-all]">
                          {isEn ? 'Start a conversation from any member profile.' : '게시판이나 프로필에서 [쪽지 보내기]로 대화를 시작해 보세요.'}
                        </p>
                      </div>
                    ) : (
                      filteredConversations.map((conv) => {
                        const unread = Number.parseInt(conv.unread_count, 10) || 0;
                        return (
                          <button
                            key={conv.conversation_id}
                            type="button"
                            onClick={() => handleSelectDirectConversation(conv)}
                            className="w-full p-2.5 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-all text-left flex items-start gap-2.5 shadow-xs group"
                          >
                            <div className="size-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-black text-xs shrink-0">
                              {conv.peer_display_name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                  {conv.peer_display_name}
                                </span>
                                {conv.last_message_at && (
                                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                    {formatTimeAgo(conv.last_message_at, isEn)}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {conv.last_message_body || (isEn ? 'No messages yet' : '대화 내용이 없습니다')}
                              </p>
                            </div>
                            {unread > 0 && (
                              <span className="size-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-black flex items-center justify-center shrink-0 self-center">
                                {unread}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : directView === 'chat' && selectedConversation ? (
                /* 1:1 쪽지 대화방 */
                <div className="flex-1 flex flex-col min-h-0 space-y-3">
                  {/* 대화방 서브 헤더 */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="truncate max-w-[200px]">{selectedConversation.peer_display_name}</span>
                      {selectedConversation.is_peer_blocked && (
                        <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">
                          차단됨
                        </Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyChat('direct')}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>{copied ? '복사됨' : '복사'}</span>
                    </button>
                  </div>

                  {/* 메시지 스트림 */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
                    {isLoading && directMessages.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        <RotateCw className="size-4 animate-spin mx-auto mb-1 text-primary" />
                        <span>{isEn ? 'Loading messages…' : '쪽지 대화 내역을 불러오는 중…'}</span>
                      </div>
                    ) : directMessages.length === 0 ? (
                      <p className="text-center py-6 text-xs text-muted-foreground">
                        {isEn ? 'No messages yet. Say hello!' : '주고받은 메시지가 없습니다. 첫 인사를 건네보세요!'}
                      </p>
                    ) : (
                      directMessages.map((m) => (
                        <div
                          key={m.id}
                          className={cn('flex flex-col space-y-1 max-w-[88%] text-xs', m.is_mine ? 'ml-auto items-end' : 'mr-auto')}
                        >
                          <span className="text-[10px] font-bold text-muted-foreground px-1">
                            {m.is_mine ? '나' : selectedConversation.peer_display_name}
                          </span>
                          <div
                            className={cn(
                              'p-3 rounded-2xl leading-relaxed whitespace-pre-wrap break-words shadow-xs',
                              m.is_mine
                                ? 'bg-primary text-primary-foreground rounded-tr-xs'
                                : 'bg-secondary text-foreground border border-border/60 rounded-tl-xs'
                            )}
                          >
                            {m.body}
                          </div>
                          <span className="text-[9px] text-muted-foreground font-mono px-1">{formatTimeAgo(m.created_at, isEn)}</span>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : null
            )}
          </div>

          {/* D. 하단 답변 입력 바 */}
          {isSignedIn && (
            <>
              {activeTab === 'support' && supportView === 'chat' && selectedThread && (
                <div className="p-2.5 border-t border-border/70 bg-muted/30 shrink-0">
                  <form onSubmit={handleSendSupportReply} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={2000}
                      value={supportReplyText}
                      onChange={(e) => setSupportReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          if ((e.nativeEvent as unknown as { isComposing?: boolean })?.isComposing) return;
                          e.preventDefault();
                          handleSendSupportReply();
                        }
                      }}
                      placeholder={isEn ? 'Type reply… (Enter to send)' : '답변 입력… (Enter 전송)'}
                      className="flex-1 h-9 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSending || !supportReplyText.trim()}
                      className="size-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
                      aria-label={isEn ? 'Send message' : '메시지 전송'}
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'direct' && directView === 'chat' && selectedConversation && (
                <div className="p-2.5 border-t border-border/70 bg-muted/30 shrink-0">
                  <form onSubmit={handleSendDirectReply} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={2000}
                      value={directReplyText}
                      onChange={(e) => setDirectReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          if ((e.nativeEvent as unknown as { isComposing?: boolean })?.isComposing) return;
                          e.preventDefault();
                          handleSendDirectReply();
                        }
                      }}
                      placeholder={isEn ? 'Type message… (Enter to send)' : '쪽지 내용 입력… (Enter 전송)'}
                      className="flex-1 h-9 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      disabled={isSending || Boolean(selectedConversation.is_peer_blocked)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSending || !directReplyText.trim() || Boolean(selectedConversation.is_peer_blocked)}
                      className="size-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
                      aria-label={isEn ? 'Send message' : '쪽지 전송'}
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
