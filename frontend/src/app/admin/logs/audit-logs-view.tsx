'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileText,
  Globe,
  LayoutGrid,
  Lock,
  Search,
  Shield,
  Table as TableIcon,
  User,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AuditSearchRow } from '../types';

type CategoryFilter = 'all' | 'error' | 'economy' | 'security' | 'content' | 'moderation';
type ViewMode = 'timeline' | 'compact';

interface AuditLogsViewProps {
  readonly events: readonly AuditSearchRow[];
}

export function AuditLogsView({ events }: AuditLogsViewProps) {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditSearchRow | null>(null);
  const [copiedAuditId, setCopiedAuditId] = useState<string | null>(null);

  // Quick stats
  const totalCount = events.length;
  const failureCount = useMemo(() => events.filter((e) => e.outcome === 'failure').length, [events]);
  const securityCount = useMemo(
    () => events.filter((e) => isSecurityAction(e.action, e.feature)).length,
    [events],
  );
  const economyCount = useMemo(
    () => events.filter((e) => isEconomyAction(e.action, e.feature)).length,
    [events],
  );

  // Filtered events
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      // Category filter
      if (category === 'error' && event.outcome !== 'failure') return false;
      if (category === 'security' && !isSecurityAction(event.action, event.feature)) return false;
      if (category === 'economy' && !isEconomyAction(event.action, event.feature)) return false;
      if (category === 'content' && !isContentAction(event.action, event.feature)) return false;
      if (category === 'moderation' && !isModerationAction(event.action, event.feature)) return false;

      // Text query
      if (!q) return true;
      const act = (event.action ?? '').toLowerCase();
      const feat = (event.feature ?? '').toLowerCase();
      const ip = (event.client_ip ?? '').toLowerCase();
      const auditId = (event.audit_id ?? '').toLowerCase();
      const actorId = (event.actor_user_id ?? '').toLowerCase();
      const subjectId = (event.subject_user_id ?? '').toLowerCase();
      const meta = getActionMeta(event.action, event.feature);
      const friendlyName = meta.label.toLowerCase();

      return (
        act.includes(q) ||
        feat.includes(q) ||
        ip.includes(q) ||
        auditId.includes(q) ||
        actorId.includes(q) ||
        subjectId.includes(q) ||
        friendlyName.includes(q)
      );
    });
  }, [events, category, searchQuery]);

  const handleCopyJson = (event: AuditSearchRow) => {
    const payload = JSON.stringify(
      {
        audit_id: event.audit_id,
        timestamp: event.created_at,
        feature: event.feature,
        action: event.action,
        outcome: event.outcome,
        response_status: event.response_status,
        actor_user_id: event.actor_user_id,
        subject_user_id: event.subject_user_id,
        client_ip: event.client_ip,
        transaction_id: event.transaction_id,
        context: event.context,
        metadata: event.metadata,
        integrity_hash: event.integrity_hash,
      },
      null,
      2,
    );
    navigator.clipboard.writeText(payload);
    setCopiedAuditId(event.audit_id);
    setTimeout(() => setCopiedAuditId(null), 2000);
  };

  return (
    <div className="grid gap-4">
      {/* 1. 상단 스마트 컨트롤 바 */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* 원클릭 카테고리 필터 탭 */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 p-1 text-xs">
          <Button
            type="button"
            size="xs"
            variant={category === 'all' ? 'default' : 'ghost'}
            onClick={() => setCategory('all')}
            className="h-7 text-xs"
          >
            전체 ({totalCount})
          </Button>
          <Button
            type="button"
            size="xs"
            variant={category === 'error' ? 'destructive' : 'ghost'}
            onClick={() => setCategory('error')}
            className="h-7 text-xs font-semibold"
          >
            🚨 오류/실패 ({failureCount})
          </Button>
          <Button
            type="button"
            size="xs"
            variant={category === 'economy' ? 'default' : 'ghost'}
            onClick={() => setCategory('economy')}
            className="h-7 text-xs"
          >
            💰 경제/지급 ({economyCount})
          </Button>
          <Button
            type="button"
            size="xs"
            variant={category === 'security' ? 'default' : 'ghost'}
            onClick={() => setCategory('security')}
            className="h-7 text-xs"
          >
            🔐 보안/인증 ({securityCount})
          </Button>
          <Button
            type="button"
            size="xs"
            variant={category === 'content' ? 'default' : 'ghost'}
            onClick={() => setCategory('content')}
            className="h-7 text-xs"
          >
            📸 콘텐츠
          </Button>
          <Button
            type="button"
            size="xs"
            variant={category === 'moderation' ? 'default' : 'ghost'}
            onClick={() => setCategory('moderation')}
            className="h-7 text-xs"
          >
            👤 제재/관리
          </Button>
        </div>

        {/* 보기 모드 토글 (스마트 타임라인 vs 고밀도 테이블) */}
        <div className="flex items-center gap-1.5 self-end lg:self-auto">
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            <Button
              type="button"
              size="xs"
              variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('timeline')}
              className="h-7 gap-1 px-2.5 text-xs"
              title="스마트 타임라인 카드 뷰"
            >
              <LayoutGrid className="size-3.5" />
              타임라인
            </Button>
            <Button
              type="button"
              size="xs"
              variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('compact')}
              className="h-7 gap-1 px-2.5 text-xs"
              title="고밀도 테이블 뷰"
            >
              <TableIcon className="size-3.5" />
              테이블
            </Button>
          </div>
        </div>
      </div>

      {/* 2. 빠른 검색 인풋 */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="액션명, IP 네트워크, 회원 UUID, 감사 ID 빠른 필터링..."
          className="h-9 pl-9 text-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
          >
            지우기
          </button>
        )}
      </div>

      {/* 필터 결과 통계 안내 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          조회 결과 <strong className="text-foreground">{filteredEvents.length}</strong>건
          {category !== 'all' && ` (필터: ${category})`}
        </span>
        <span className="text-[0.7rem]">카드 또는 [상세] 클릭 시 무결성 해시 및 원본 JSON 열람 가능</span>
      </div>

      {/* 3. 본문 뷰 렌더링 */}
      {filteredEvents.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          <FileText className="size-8 opacity-40" />
          <p className="text-sm font-medium">검색 조건과 일치하는 감사 로그가 없습니다.</p>
          <p className="text-xs">필터 조건을 재설정하거나 검색어를 변경해 보세요.</p>
        </div>
      ) : viewMode === 'timeline' ? (
        /* 스마트 타임라인 뷰 */
        <div className="grid gap-3">
          {filteredEvents.map((event) => {
            const meta = getActionMeta(event.action, event.feature);
            const isFailure = event.outcome === 'failure';

            return (
              <div
                key={event.audit_id}
                className={`group relative rounded-xl border p-4 transition-all hover:border-primary/50 hover:shadow-sm ${
                  isFailure
                    ? 'border-destructive/40 bg-destructive/5'
                    : 'border-border/70 bg-card hover:bg-muted/10'
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  {/* 좌측: 아이콘 + 한국어 액션 + 상세 태그 */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                        isFailure
                          ? 'bg-destructive/20 text-destructive'
                          : meta.bgColor + ' ' + meta.textColor
                      }`}
                    >
                      {isFailure ? <XCircle className="size-5" /> : meta.icon}
                    </span>

                    <div className="grid gap-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-bold text-foreground">
                          {meta.label}
                        </strong>
                        <code className="font-mono text-[0.7rem] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                          {event.feature}:{event.action}
                        </code>
                        <OutcomeBadge
                          outcome={event.outcome}
                          responseStatus={event.response_status}
                        />
                      </div>

                      {/* 추가 컨텍스트 요약 */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {event.actor_user_id && (
                          <span className="flex items-center gap-1 font-mono text-[0.7rem]" title="행위자">
                            <User className="size-3 text-muted-foreground" />
                            {event.actor_user_id.slice(0, 8)}…
                          </span>
                        )}
                        {event.subject_user_id && (
                          <span className="flex items-center gap-1 font-mono text-[0.7rem] text-primary" title="대상 회원">
                            <ArrowIcon className="size-3" />
                            대상: {event.subject_user_id.slice(0, 8)}…
                          </span>
                        )}
                        {event.client_ip && (
                          <span className="flex items-center gap-1 font-mono text-[0.7rem]" title="접속 네트워크">
                            <Globe className="size-3 text-muted-foreground" />
                            {event.client_ip}
                          </span>
                        )}
                        {event.transaction_id && (
                          <span className="flex items-center gap-1 font-mono text-[0.7rem] text-emerald-600 dark:text-emerald-400" title="거래 ID">
                            💳 {event.transaction_id.slice(0, 8)}…
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 우측: 기록 일시 + 빠른 액션 버튼 */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                    <span className="flex items-center gap-1 font-mono text-[0.75rem] text-muted-foreground" title={event.created_at}>
                      <Clock className="size-3" />
                      {formatTime(event.created_at)}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleCopyJson(event)}
                        className="h-7 px-2 text-[0.7rem] text-muted-foreground hover:text-foreground"
                        title="JSON 복사"
                      >
                        <Copy className="size-3 mr-1" />
                        {copiedAuditId === event.audit_id ? '복사됨!' : 'JSON'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setSelectedEvent(event)}
                        className="h-7 px-2.5 text-[0.7rem]"
                      >
                        <Eye className="size-3 mr-1" /> 상세
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 고밀도 테이블 뷰 */
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-20">상태</TableHead>
                <TableHead className="w-36">기록 일시</TableHead>
                <TableHead>액션 및 분류</TableHead>
                <TableHead>행위자 / 대상</TableHead>
                <TableHead>IP 네트워크</TableHead>
                <TableHead className="text-right">조회</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const meta = getActionMeta(event.action, event.feature);
                return (
                  <TableRow key={event.audit_id} className="hover:bg-muted/20">
                    <TableCell>
                      <OutcomeBadge
                        outcome={event.outcome}
                        responseStatus={event.response_status}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatTime(event.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">{meta.label}</span>
                        <code className="text-[0.68rem] text-muted-foreground font-mono">
                          {event.feature}:{event.action}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {event.subject_user_id ? (
                        <span className="text-primary" title={`대상: ${event.subject_user_id}`}>
                          {event.subject_user_id.slice(0, 8)}…
                        </span>
                      ) : event.actor_user_id ? (
                        <span className="text-muted-foreground" title={`행위자: ${event.actor_user_id}`}>
                          {event.actor_user_id.slice(0, 8)}…
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {event.client_ip ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setSelectedEvent(event)}
                        className="h-7 text-xs"
                      >
                        상세
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. 감사 로그 원본 상세 모달 (Dialog) */}
      <Dialog open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <DialogTitle className="text-base font-bold">
                  감사 로그 상세 검증
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                불변 해시 체인 및 컨텍스트 메타데이터를 확인합니다.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 pt-2">
              {/* 상단 기본 요약 정보 */}
              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/20 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground text-[0.7rem] block">작업명</span>
                  <strong className="text-foreground">
                    {getActionMeta(selectedEvent.action, selectedEvent.feature).label}
                  </strong>
                  <code className="text-[0.68rem] text-muted-foreground font-mono block mt-0.5">
                    {selectedEvent.feature}:{selectedEvent.action}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground text-[0.7rem] block">결과 및 응답</span>
                  <div className="mt-1">
                    <OutcomeBadge
                      outcome={selectedEvent.outcome}
                      responseStatus={selectedEvent.response_status}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-[0.7rem] block">기록 시각</span>
                  <span className="font-mono text-xs text-foreground">
                    {selectedEvent.created_at}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[0.7rem] block">네트워크 / 세션</span>
                  <span className="font-mono text-xs text-foreground">
                    {selectedEvent.client_ip ?? '미상'} / {selectedEvent.session_hash ?? '없음'}
                  </span>
                </div>
              </div>

              {/* 체인 및 식별자 */}
              <div className="grid gap-1.5 rounded-lg border bg-background p-3 text-xs font-mono">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-muted-foreground">감사 ID:</span>
                  <span className="text-foreground select-all">{selectedEvent.audit_id}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-muted-foreground">행위자 ID:</span>
                  <span className="text-foreground select-all">{selectedEvent.actor_user_id ?? '없음'}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-muted-foreground">대상 회원:</span>
                  <span className="text-primary font-bold select-all">{selectedEvent.subject_user_id ?? '없음'}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-muted-foreground">거래 ID:</span>
                  <span className="text-foreground select-all">{selectedEvent.transaction_id ?? '없음'}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2 border-t pt-1.5">
                  <span className="text-muted-foreground">무결성 해시:</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 select-all truncate max-w-sm">
                    {selectedEvent.integrity_hash}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-muted-foreground">이전 해시:</span>
                  <span className="text-xs text-muted-foreground select-all truncate max-w-sm">
                    {selectedEvent.previous_integrity_hash ?? '00000000000000000000000000000000'}
                  </span>
                </div>
              </div>

              {/* JSON 컨텍스트 & 메타데이터 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-muted-foreground">컨텍스트 및 상세 메타데이터</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleCopyJson(selectedEvent)}
                    className="h-6 text-[0.7rem]"
                  >
                    <Copy className="size-3 mr-1" />
                    {copiedAuditId === selectedEvent.audit_id ? '복사됨!' : '전체 복사'}
                  </Button>
                </div>
                <pre className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 text-[0.7rem] font-mono leading-relaxed whitespace-pre-wrap break-all">
                  {JSON.stringify(
                    {
                      context: selectedEvent.context,
                      metadata: selectedEvent.metadata,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function OutcomeBadge({
  outcome,
  responseStatus,
}: {
  readonly outcome: string | null;
  readonly responseStatus: number | null;
}) {
  if (outcome === null && responseStatus === null) return <span>—</span>;
  const isSuccess = outcome === 'success';
  const isFailure = outcome === 'failure';

  return (
    <span className="inline-flex items-center gap-1">
      {outcome !== null && (
        <Badge
          variant={isSuccess ? 'secondary' : isFailure ? 'destructive' : 'outline'}
          className="text-[0.68rem] px-1.5 py-0 h-5"
        >
          {isSuccess ? (
            <span className="flex items-center gap-0.5">
              <CheckCircle2 className="size-2.5 text-emerald-500" /> 성공
            </span>
          ) : isFailure ? (
            <span className="flex items-center gap-0.5">
              <XCircle className="size-2.5" /> 실패
            </span>
          ) : (
            '부분'
          )}
        </Badge>
      )}
      {responseStatus !== null && (
        <span
          className={`font-mono text-[0.68rem] font-semibold ${
            responseStatus >= 400 ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {responseStatus}
        </span>
      )}
    </span>
  );
}

function ArrowIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${m}-${day} ${h}:${min}:${s}`;
  } catch {
    return isoString;
  }
}

function isSecurityAction(action: string | null, feature: string | null): boolean {
  const s = `${feature ?? ''}:${action ?? ''}`.toLowerCase();
  return (
    s.includes('auth') ||
    s.includes('login') ||
    s.includes('session') ||
    s.includes('security') ||
    s.includes('token') ||
    s.includes('perm') ||
    s.includes('restrict') ||
    s.includes('ban')
  );
}

function isEconomyAction(action: string | null, feature: string | null): boolean {
  const s = `${feature ?? ''}:${action ?? ''}`.toLowerCase();
  return (
    s.includes('money') ||
    s.includes('cash') ||
    s.includes('bank') ||
    s.includes('stock') ||
    s.includes('bond') ||
    s.includes('adjust') ||
    s.includes('reward') ||
    s.includes('transfer') ||
    s.includes('pay')
  );
}

function isContentAction(action: string | null, feature: string | null): boolean {
  const s = `${feature ?? ''}:${action ?? ''}`.toLowerCase();
  return (
    s.includes('photo') ||
    s.includes('post') ||
    s.includes('comment') ||
    s.includes('media') ||
    s.includes('image') ||
    s.includes('article')
  );
}

function isModerationAction(action: string | null, feature: string | null): boolean {
  const s = `${feature ?? ''}:${action ?? ''}`.toLowerCase();
  return (
    s.includes('restrict') ||
    s.includes('ban') ||
    s.includes('unban') ||
    s.includes('warn') ||
    s.includes('delete') ||
    s.includes('block')
  );
}

function getActionMeta(
  action: string | null,
  feature: string | null,
): { label: string; icon: React.ReactNode; bgColor: string; textColor: string } {
  const feat = feature ?? '';
  const act = action ?? '';
  const key = `${feat}:${act}`.toLowerCase();

  if (key.includes('adjust') || key.includes('money') || key.includes('wealth')) {
    return {
      label: '직권 자산/포인트 조정',
      icon: <span className="font-bold text-xs">💰</span>,
      bgColor: 'bg-emerald-500/15',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (key.includes('restrict') || key.includes('ban')) {
    return {
      label: '회원 이용 제재/차단',
      icon: <Lock className="size-4" />,
      bgColor: 'bg-red-500/15',
      textColor: 'text-red-600 dark:text-red-400',
    };
  }
  if (key.includes('photo') && (key.includes('approve') || key.includes('reject'))) {
    return {
      label: '프로필 사진 심사 처리',
      icon: <span className="font-bold text-xs">📸</span>,
      bgColor: 'bg-indigo-500/15',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    };
  }
  if (key.includes('auth') || key.includes('login')) {
    return {
      label: '인증 / 세션 활동',
      icon: <Lock className="size-4" />,
      bgColor: 'bg-blue-500/15',
      textColor: 'text-blue-600 dark:text-blue-400',
    };
  }
  if (key.includes('stock')) {
    return {
      label: '가상 주식 거래/발행',
      icon: <span className="font-bold text-xs">📈</span>,
      bgColor: 'bg-amber-500/15',
      textColor: 'text-amber-600 dark:text-amber-400',
    };
  }
  if (key.includes('bond')) {
    return {
      label: '가상 국채 발행/상환',
      icon: <span className="font-bold text-xs">🏛️</span>,
      bgColor: 'bg-purple-500/15',
      textColor: 'text-purple-600 dark:text-purple-400',
    };
  }

  return {
    label: feat && act ? `${feat} · ${act}` : feat || act || '기타 작업',
    icon: <FileText className="size-4" />,
    bgColor: 'bg-muted',
    textColor: 'text-foreground',
  };
}
