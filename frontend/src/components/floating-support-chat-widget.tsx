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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useViewer } from '@/lib/use-viewer';
import { useLocale } from '@/components/locale-provider';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

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

export function FloatingSupportChatWidget() {
  const viewer = useViewer();
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const isSignedIn = Boolean(viewer?.signedIn);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat' | 'new'>('list');
  const [threads, setThreads] = useState<readonly SupportThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
  const [messages, setMessages] = useState<readonly SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [replyText, setReplyText] = useState('');
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const prevWaitingCount = useRef<number>(0);

  // 스레드 목록 가져오기
  const fetchThreads = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/app-api/v1/support/threads', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: SupportThread[] = data.threads ?? [];
        setThreads(list);

        // 관리자 새 답변(waiting_user) 감지 시 토스트 알림
        const waitingCount = list.filter((t) => t.status === 'waiting_user').length;
        if (prevWaitingCount.current < waitingCount) {
          toast.success(isEn ? 'New admin reply received!' : '관리자 답변이 도착했습니다!', {
            description: isEn ? 'Check your 1:1 support chat.' : '1:1 문의 대화창에서 확인해 보세요.',
            action: {
              label: isEn ? 'View' : '보기',
              onClick: () => {
                setIsOpen(true);
                setView('list');
              },
            },
          });
        }
        prevWaitingCount.current = waitingCount;
      }
    } catch {
      // ignore network errors
    }
  }, [isSignedIn, isEn]);

  // 특정 스레드 메시지 목록 가져오기
  const fetchMessages = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/app-api/v1/support/threads/${encodeURIComponent(threadId)}/messages`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {
      // ignore network errors
    }
  }, []);

  // 위젯 열릴 때 스레드 로드
  useEffect(() => {
    if (isOpen && isSignedIn) {
      setIsLoading(true);
      fetchThreads().finally(() => setIsLoading(false));
    }
  }, [isOpen, isSignedIn, fetchThreads]);

  // 주기적 폴링 (대화창 열림 시 5초, 닫힘 시 30초)
  useEffect(() => {
    if (!isSignedIn) return;
    const intervalTime = isOpen && view === 'chat' && selectedThread ? 5000 : 30000;
    const interval = setInterval(() => {
      if (isOpen && view === 'chat' && selectedThread) {
        fetchMessages(selectedThread.thread_id);
      }
      fetchThreads();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOpen, view, selectedThread, isSignedIn, fetchThreads, fetchMessages]);

  // 메시지 목록 하단 스크롤
  useEffect(() => {
    if (view === 'chat' && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [view, messages]);

  // 스레드 선택하여 대화방 진입
  const handleSelectThread = (thread: SupportThread) => {
    setSelectedThread(thread);
    setView('chat');
    setIsLoading(true);
    fetchMessages(thread.thread_id).finally(() => setIsLoading(false));
  };

  // 새 문의 접수
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim() || isSending) return;

    setIsSending(true);
    try {
      // CSRF 토큰 조회
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
        toast.success(isEn ? 'Support inquiry submitted!' : '문의가 성공적으로 접수되었습니다!');
        setNewSubject('');
        setNewBody('');
        await fetchThreads();
        if (data.thread) {
          handleSelectThread(data.thread);
        } else {
          setView('list');
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

  // 대화 답변 전송
  const handleSendReply = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedThread || isSending) return;

    const textToSend = replyText.trim();
    setReplyText('');
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
        await fetchMessages(selectedThread.thread_id);
      } else {
        toast.error(isEn ? 'Failed to send message.' : '메시지 전송에 실패했습니다.');
        setReplyText(textToSend);
      }
    } catch {
      toast.error(isEn ? 'Network error occurred.' : '네트워크 오류가 발생했습니다.');
      setReplyText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // 대화 내용 복사
  const handleCopyChat = () => {
    if (messages.length === 0) return;
    const text = messages
      .map((m) => `[${m.sender_kind === 'admin' ? '운영팀' : '나'}] ${m.body}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(isEn ? 'Chat transcript copied!' : '대화 내용이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  // 관리자 새 답변 알림 뱃지 수
  const waitingAdminReplies = threads.filter((t) => t.status === 'waiting_user').length;

  return (
    <>
      {/* 1. 플로팅 챗 버블 트리거 버튼 */}
      <div className="fixed bottom-[74px] right-3.5 sm:bottom-6 sm:right-6 z-40 select-none flex flex-col items-end">
        {/* 데스크톱 마이크로 툴팁 배너 */}
        {!isOpen && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-card/95 border border-border/80 shadow-lg text-[11px] font-bold text-foreground backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isEn ? '1:1 Admin Support' : '관리자 1:1 실시간 문의'}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'group relative flex size-12 sm:size-13 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 outline-none',
            isOpen
              ? 'bg-muted border-2 border-border text-foreground'
              : 'bg-gradient-to-br from-amber-500 via-primary to-amber-600 text-primary-foreground border-2 border-amber-400/40 hover:scale-105 hover:shadow-primary/30'
          )}
          aria-label={isEn ? 'Toggle admin support chat' : '관리자 1:1 문의창 열기/닫기'}
        >
          {isOpen ? (
            <X className="size-5 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <Headphones className="size-5.5 sm:size-6 transition-transform duration-200 group-hover:scale-110" />
          )}

          {/* 답변 대기/새 답변 도착 알림 뱃지 */}
          {!isOpen && waitingAdminReplies > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-600 font-mono text-[11px] font-black text-white shadow-md ring-2 ring-background animate-bounce">
              {waitingAdminReplies}
            </span>
          )}
        </button>
      </div>

      {/* 2. 채널톡/인터콤 스타일 플로팅 팝업 대화창 */}
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed bottom-[130px] right-3.5 sm:bottom-22 sm:right-6 z-40 w-[calc(100vw-1.75rem)] max-w-[380px] h-[min(540px,calc(100dvh-9.5rem))] flex flex-col rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 text-foreground"
        >
          {/* A. 팝오버 상단 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-muted/40 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {view !== 'list' && (
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setSelectedThread(null);
                  }}
                  className="p-1 -ml-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isEn ? 'Back to list' : '목록으로 돌아가기'}
                >
                  <ChevronLeft className="size-4.5" />
                </button>
              )}
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                <Headphones className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate">
                  {view === 'chat' && selectedThread
                    ? selectedThread.subject
                    : view === 'new'
                    ? (isEn ? 'New Support Ticket' : '새 1:1 문의 접수')
                    : (isEn ? 'Moneyverse 1:1 Support' : '월덕 고객센터 · 1:1 문의')}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isEn ? 'Operating Team Online' : '운영팀 실시간 상담 가동'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title={isEn ? 'Open in full page' : '전체 화면으로 열기'}
              >
                <Link href={selectedThread ? `/support?thread=${selectedThread.thread_id}` : '/support'}>
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
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

          {/* B. 본문 영역 (비로그인 vs 스레드 목록 vs 채팅방 vs 새 문의) */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col min-h-0 bg-gradient-to-b from-card to-background/50">
            {/* 1. 비로그인 게스트 화면 */}
            {!isSignedIn ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-4 space-y-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
                  <ShieldCheck className="size-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-foreground">
                    {isEn ? 'Sign in to Contact Support' : '로그인 후 1:1 문의를 이용하세요'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed [word-break:keep-all]">
                    {isEn
                      ? 'Secure, ledger-backed 1:1 support conversations are tied to your member account.'
                      : '회원 계정으로 로그인하시면 운영진과 안전한 1:1 상담 및 처리 기록을 확인하실 수 있습니다.'}
                  </p>
                </div>

                <Button asChild className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl shadow-md">
                  <Link href="/login">
                    <LogIn className="size-4" />
                    <span>{isEn ? 'Sign In Now' : '로그인하러 가기'}</span>
                  </Link>
                </Button>

                {/* 자주 묻는 가이드 링크 */}
                <div className="w-full pt-3 border-t border-border/60 text-left space-y-1.5 text-xs">
                  <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <BookOpen className="size-3.5" />
                    <span>{isEn ? 'Helpful Quick Guides' : '자주 찾는 가이드'}</span>
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
            ) : view === 'list' ? (
              /* 2. 로그인 회원: 내 문의 스레드 목록 */
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <Button
                  type="button"
                  onClick={() => setView('new')}
                  className="w-full h-10 font-bold text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <Plus className="size-4" />
                  <span>{isEn ? 'Open New Support Inquiry' : '새 1:1 문의 작성하기'}</span>
                </Button>

                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                  {isLoading ? (
                    <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                      <RotateCw className="size-5 animate-spin mx-auto text-primary" />
                      <p>{isEn ? 'Loading support inquiries…' : '문의 내역을 불러오는 중…'}</p>
                    </div>
                  ) : threads.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground mx-auto">
                        <MessageSquare className="size-5" />
                      </div>
                      <p className="text-xs font-bold text-foreground">
                        {isEn ? 'No support tickets yet' : '접수된 문의 내역이 없습니다'}
                      </p>
                      <p className="text-[11px] text-muted-foreground [word-break:keep-all]">
                        {isEn
                          ? 'Click the button above to ask anything directly to our team.'
                          : '궁금한 점이나 건의사항이 있다면 언제든 문의를 남겨주세요.'}
                      </p>
                    </div>
                  ) : (
                    threads.map((thread) => {
                      const statusMeta = STATUS_MAP[thread.status] ?? STATUS_MAP.open!;
                      return (
                        <button
                          key={thread.thread_id}
                          type="button"
                          onClick={() => handleSelectThread(thread)}
                          className="w-full p-3 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-all text-left space-y-1.5 shadow-xs group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                              {thread.subject}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0',
                                statusMeta.color
                              )}
                            >
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
            ) : view === 'chat' && selectedThread ? (
              /* 3. 특정 문의 실시간 1:1 대화방 */
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
                    onClick={handleCopyChat}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    <span>{copied ? '복사됨' : '복사'}</span>
                  </button>
                </div>

                {/* 메시지 스트림 */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
                  {isLoading && messages.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      <RotateCw className="size-4 animate-spin mx-auto mb-1 text-primary" />
                      <span>{isEn ? 'Loading messages…' : '대화 내역을 불러오는 중…'}</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center py-6 text-xs text-muted-foreground">
                      {isEn ? 'No messages in this inquiry.' : '메시지가 없습니다.'}
                    </p>
                  ) : (
                    messages.map((m) => {
                      const isAdminMsg = m.sender_kind === 'admin';
                      return (
                        <div
                          key={m.message_id}
                          className={cn(
                            'flex flex-col space-y-1 max-w-[88%] text-xs',
                            isAdminMsg ? 'mr-auto' : 'ml-auto items-end'
                          )}
                        >
                          <span className="text-[10px] font-bold text-muted-foreground px-1">
                            {isAdminMsg ? '👑 운영진 답변' : '나'}
                          </span>
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
                          <span className="text-[9px] text-muted-foreground font-mono px-1">
                            {formatTimeAgo(m.created_at, isEn)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            ) : (
              /* 4. 새 문의 작성 폼 */
              <form onSubmit={handleCreateInquiry} className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  {/* 카테고리 프리셋 칩 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">빠른 카테고리 선택</label>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORY_PRESETS.map((cat) => (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => {
                            if (!newSubject.startsWith(cat.prefix)) {
                              setNewSubject(`${cat.prefix}${newSubject.replace(/^\[[^\]]+\]\s*/, '')}`);
                            }
                          }}
                          className="px-2 py-0.5 rounded-md border border-border/80 bg-card hover:bg-muted text-[10px] font-bold transition-all text-muted-foreground hover:text-foreground active:scale-95"
                        >
                          {cat.label}
                        </button>
                      ))}
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
                          ? 'Please describe your inquiry or issue in detail.'
                          : '문의 내용이나 발생한 현상을 구체적으로 적어주시면 빠른 확인이 가능합니다.'
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
            )}
          </div>

          {/* C. 대화방 하단 답변 입력 바 (view === 'chat'일 때만 노출) */}
          {isSignedIn && view === 'chat' && selectedThread && (
            <div className="p-2.5 border-t border-border/70 bg-muted/30 shrink-0">
              <form onSubmit={handleSendReply} className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={2000}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isEn ? 'Type reply… (Enter to send)' : '답변 입력… (Enter 전송)'}
                  className="flex-1 h-9 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !replyText.trim()}
                  className="size-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
                  aria-label={isEn ? 'Send message' : '메시지 전송'}
                >
                  <Send className="size-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
