'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Headphones,
  Send,
  RotateCw,
  Search,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { synthSound } from '@/lib/audio/synth-sound';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';
import { AdminBack } from '../admin-back';
import { adminSupportReply, adminSupportStatus } from './actions';

export interface AdminSupportThread {
  readonly thread_id: string;
  readonly user_id?: string;
  readonly display_name: string;
  readonly subject: string;
  readonly status: 'open' | 'waiting_user' | 'resolved' | string;
  readonly created_at: string;
  readonly last_message_at: string;
}

export interface AdminSupportMessage {
  readonly message_id: string;
  readonly sender_kind: 'user' | 'admin';
  readonly sender_user_id?: string;
  readonly body: string;
  readonly created_at: string;
}

interface AdminSupportViewProps {
  readonly initialThreads: readonly AdminSupportThread[];
  readonly initialMessages: readonly AdminSupportMessage[];
  readonly selectedId?: string | undefined;
  readonly initialStatus: string | null;
}

const CANNED_RESPONSES = [
  {
    label: '🔍 [확인 중]',
    text: '안녕하세요 회원님, 제보해 주신 문의 내용을 꼼꼼히 확인하고 있습니다. 신속히 확인 후 안내해 드리겠습니다.',
  },
  {
    label: '✅ [처리 완료]',
    text: '요청하신 사항이 정상적으로 처리 완료되었습니다. 추가로 궁금하신 점이나 도움이 필요하시면 언제든 말씀해 주세요!',
  },
  {
    label: '📸 [추가 정보]',
    text: '정확하고 신속한 확인을 위해 문제가 발생한 시각, 기기 환경, 또는 오류 화면 스크린샷 등의 추가 정보를 남겨주시면 감사하겠습니다.',
  },
] as const;

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  open: {
    label: '답변 대기',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    badgeVariant: 'default',
  },
  waiting_user: {
    label: '회원 답변 대기',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    badgeVariant: 'secondary',
  },
  resolved: {
    label: '처리 완료',
    color: 'text-muted-foreground bg-muted/40 border-border',
    badgeVariant: 'outline',
  },
};

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  } catch {
    return '';
  }
}

export function AdminSupportView({
  initialThreads,
  initialMessages,
  selectedId,
  initialStatus,
}: AdminSupportViewProps) {
  const router = useRouter();

  const [threads, setThreads] = useState<readonly AdminSupportThread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(
    selectedId ?? initialThreads[0]?.thread_id
  );
  const [messages, setMessages] = useState<readonly AdminSupportMessage[]>(initialMessages);
  const [replyText, setReplyText] = useState('');
  const [currentStatusSelect, setCurrentStatusSelect] = useState<string>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedThread = threads.find((t) => t.thread_id === selectedThreadId);

  // 상태 동기화
  useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (selectedThread) {
      setCurrentStatusSelect(selectedThread.status);
    }
  }, [selectedThread]);

  // 실시간 메시지 목록 새로고침
  const fetchMessagesForThread = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/app-api/v1/admin/support/threads/${encodeURIComponent(threadId)}/messages`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // 전체 스레드 목록 새로고침
  const fetchAllThreads = useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const url = initialStatus
        ? `/app-api/v1/admin/support/threads?status=${encodeURIComponent(initialStatus)}`
        : '/app-api/v1/admin/support/threads';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: AdminSupportThread[] = data.threads ?? [];
        setThreads(list);
        if (showToast) {
          toast.success('문의 목록이 최신 상태로 동기화되었습니다.');
        }
      }
    } catch {
      /* ignore */
    } finally {
      setIsRefreshing(false);
    }
  }, [initialStatus]);

  // 주기적 자동 폴링 (5초)
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      fetchAllThreads(false);
      if (selectedThreadId) {
        fetchMessagesForThread(selectedThreadId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPoll, fetchAllThreads, fetchMessagesForThread, selectedThreadId]);

  // 하단 스크롤 자동 이동
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 답장 제출 핸들러
  const handleReplySubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedThreadId || isSending) return;

    const textToSend = replyText.trim();
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.set('threadId', selectedThreadId);
      formData.set('body', textToSend);

      await adminSupportReply(formData);
      synthSound.playMessageSent();
      toast.success('관리자 답장이 회원에게 전송되었습니다.');
      setReplyText('');
      await fetchMessagesForThread(selectedThreadId);
      await fetchAllThreads(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error('답장 전송 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  // 상태 변경 핸들러
  const handleStatusSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedThreadId || isChangingStatus) return;

    setIsChangingStatus(true);
    try {
      const formData = new FormData();
      formData.set('threadId', selectedThreadId);
      formData.set('status', currentStatusSelect);

      await adminSupportStatus(formData);
      synthSound.playClick();
      toast.success(`문의 상태가 '${STATUS_CONFIG[currentStatusSelect]?.label ?? currentStatusSelect}'(으)로 변경되었습니다.`);
      await fetchAllThreads(false);
      router.refresh();
    } catch {
      toast.error('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  // 대화 내용 복사
  const handleCopyTranscript = () => {
    if (!messages.length) return;
    const transcript = messages
      .map(
        (m) =>
          `[${m.sender_kind === 'admin' ? '운영팀' : selectedThread?.display_name ?? '회원'}] (${new Date(m.created_at).toLocaleString('ko-KR')})\n${m.body}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(transcript);
    setCopied(true);
    toast.success('전체 대화 내용이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  // 스마트 검색 필터링
  const filteredThreads = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.subject.toLowerCase().includes(q) ||
      t.display_name.toLowerCase().includes(q) ||
      (t.user_id && t.user_id.toLowerCase().includes(q))
    );
  });

  const openCount = threads.filter((t) => t.status === 'open').length;
  const waitingCount = threads.filter((t) => t.status === 'waiting_user').length;
  const resolvedCount = threads.filter((t) => t.status === 'resolved').length;

  return (
    <div data-page="admin-support" className="mv-page mv-page--admin grid gap-5">
      <AdminBack />

      {/* 헤더 타이틀 및 컨트롤 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">관리자 고객지원 관제 센터</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {threads.length}건
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            회원 1:1 문의를 실시간으로 모니터링하고 신속하게 답장 및 티켓 상태를 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 5초 자동 새로고침 토글 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAutoPoll((p) => !p)}
            className={cn('text-xs font-semibold rounded-xl gap-1.5', autoPoll && 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10')}
          >
            <span className={cn('size-2 rounded-full', autoPoll ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground')} />
            <span>{autoPoll ? '실시간 5초 폴링 ON' : '폴링 일시정지'}</span>
          </Button>

          {/* 수동 새로고침 버튼 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchAllThreads(true)}
            disabled={isRefreshing}
            className="text-xs font-semibold rounded-xl gap-1.5"
          >
            <RotateCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
            <span>새로고침</span>
          </Button>
        </div>
      </div>

      {/* 4대 상태 탭 바 */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 pb-1">
        {[
          { href: '/admin/support', label: '전체', count: threads.length, active: initialStatus === null },
          { href: '/admin/support?status=open', label: '답변 대기', count: openCount, active: initialStatus === 'open' },
          { href: '/admin/support?status=waiting_user', label: '회원 대기', count: waitingCount, active: initialStatus === 'waiting_user' },
          { href: '/admin/support?status=resolved', label: '완료', count: resolvedCount, active: initialStatus === 'resolved' },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'min-h-9 shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              tab.active
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border-border'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold',
                tab.active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* 2열 레이아웃: 좌측 티켓 큐 ↔ 우측 대화 및 답장 콘솔 */}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* 좌측: 티켓 목록 및 스마트 검색 */}
        <div className="flex flex-col gap-2">
          {/* 검색창 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="회원 닉네임, 문의 제목 검색..."
              className="w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* 티켓 리스트 */}
          <div className="grid content-start gap-2 max-h-72 lg:max-h-none overflow-y-auto pr-1">
            {filteredThreads.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                {searchQuery ? '검색 조건과 일치하는 문의가 없습니다.' : '접수된 문의가 없습니다.'}
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = selectedThreadId === t.thread_id;
                const statusMeta = STATUS_CONFIG[t.status] ?? {
                  label: t.status,
                  color: 'text-muted-foreground bg-muted',
                };
                return (
                  <button
                    key={t.thread_id}
                    type="button"
                    onClick={() => {
                      setSelectedThreadId(t.thread_id);
                      fetchMessagesForThread(t.thread_id);
                    }}
                    className={cn(
                      'text-left rounded-xl border p-3.5 transition-all flex flex-col gap-1.5 select-none relative',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                        : 'bg-card hover:bg-muted/40 border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-foreground truncate">{t.subject}</div>
                      {t.status === 'open' && (
                        <span className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0 mt-1" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="size-3 text-muted-foreground" />
                        <span className="font-semibold text-foreground/80">{t.display_name}</span>
                      </div>
                      <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', statusMeta.color)}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                      <Clock className="size-2.5" />
                      <span>최근: {formatTimeAgo(t.last_message_at || t.created_at)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 우측: 실시간 대화창 & 답장/상태 콘솔 */}
        <section className="flex min-h-[65vh] flex-col rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
          {selectedThread ? (
            <>
              {/* 대화창 상단 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-border gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black truncate text-foreground">{selectedThread.subject}</h2>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-xs font-bold border shrink-0',
                        STATUS_CONFIG[selectedThread.status]?.color ?? 'text-muted-foreground'
                      )}
                    >
                      {STATUS_CONFIG[selectedThread.status]?.label ?? selectedThread.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>회원: <strong className="text-foreground">{selectedThread.display_name}</strong></span>
                    {selectedThread.user_id && (
                      <span className="font-mono text-[10px] text-muted-foreground/60 truncate max-w-[140px]">
                        ({selectedThread.user_id})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* 대화 복사 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTranscript}
                    className="h-8 text-xs font-semibold rounded-lg gap-1"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    <span>{copied ? '복사됨' : '대화 복사'}</span>
                  </Button>
                </div>
              </div>

              {/* 메시지 타임라인 */}
              <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[45vh] pr-1.5">
                {messages.map((m) => {
                  const isAdmin = m.sender_kind === 'admin';
                  return (
                    <div
                      key={m.message_id}
                      className={cn(
                        'max-w-[85%] rounded-2xl p-3.5 space-y-1 shadow-2xs',
                        isAdmin
                          ? 'ml-auto bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-muted/80 text-foreground rounded-bl-xs border border-border/50'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] font-bold opacity-80">
                        <span>{isAdmin ? '🛡️ 관리자 (운영팀)' : `👤 ${selectedThread.display_name}`}</span>
                        <span className="font-mono text-[10px] opacity-70">
                          {new Date(m.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-xs leading-relaxed sm:text-sm">
                        {m.body}
                      </p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 3대 상용구 퀵 프리셋 바 */}
              <div className="mt-3.5 pt-3 border-t border-border flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mr-1">
                  <Sparkles className="size-3 text-amber-500" />
                  <span>빠른 상용구:</span>
                </span>
                {CANNED_RESPONSES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setReplyText((prev) => (prev ? `${prev}\n${preset.text}` : preset.text))}
                    className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* 관리자 답장 입력 폼 */}
              <form
                action={adminSupportReply}
                onSubmit={handleReplySubmit}
                className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
              >
                <input type="hidden" name="threadId" value={selectedThreadId} />
                <textarea
                  name="body"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      handleReplySubmit();
                    }
                  }}
                  maxLength={2000}
                  required
                  aria-label="관리자 답장"
                  className="min-h-24 sm:min-h-16 w-full rounded-xl border bg-background p-3 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="관리자 답장을 입력하세요... (Ctrl+Enter로 즉시 전송)"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="min-h-11 w-full rounded-xl bg-primary px-5 font-bold text-primary-foreground sm:w-auto transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="size-4" />
                  <span>{isSending ? '전송 중...' : '답장'}</span>
                </button>
              </form>

              {/* 문의 상태 변경 폼 */}
              <form
                action={adminSupportStatus}
                onSubmit={handleStatusSubmit}
                className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <input type="hidden" name="threadId" value={selectedThreadId} />
                <select
                  name="status"
                  value={currentStatusSelect}
                  onChange={(e) => setCurrentStatusSelect(e.target.value)}
                  aria-label="문의 처리 상태"
                  className="min-h-11 w-full rounded-xl border bg-background p-2 text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="open">답변 대기 (open)</option>
                  <option value="waiting_user">회원 답변 대기 (waiting_user)</option>
                  <option value="resolved">처리 완료 (resolved)</option>
                </select>
                <button
                  type="submit"
                  disabled={isChangingStatus}
                  className="min-h-11 w-full rounded-xl border px-4 font-bold sm:w-auto hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isChangingStatus ? '변경 중...' : '상태 변경'}
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto flex flex-col items-center justify-center text-center p-8 space-y-2">
              <Headphones className="size-10 text-muted-foreground/40" />
              <p className="text-sm font-bold text-muted-foreground">문의가 없습니다.</p>
              <p className="text-xs text-muted-foreground/70">좌측 목록에서 문의를 선택하거나 새 문의를 기다려 주세요.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
