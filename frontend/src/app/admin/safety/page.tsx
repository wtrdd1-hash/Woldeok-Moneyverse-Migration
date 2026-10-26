import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, MessageSquareWarning, FileText } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { TakedownActionDialog } from './takedown-action-dialog';
import { ChatReportEvidenceDialog } from './chat-report-evidence-dialog';
import { ChatReportActionDialog } from './chat-report-action-dialog';
import {
  MODERATION_MAX_OFFSET,
  MODERATION_PAGE_SIZE,
  moderationPageHref,
  parseChatQueue,
  parseTakedownQueue,
  readModerationOffset,
  safeTargetHref,
} from './moderation-queue';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/safety');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

function takedownStatusBadge(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return <Badge variant="destructive" className="animate-pulse text-xs">신규 접수 (긴급)</Badge>;
    case 'TRIAGED':
      return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-xs">심사 중</Badge>;
    case 'ACTIONED_REMOVED':
      return <Badge className="bg-emerald-600 text-white text-xs">삭제 처리 기록</Badge>;
    case 'ACTIONED_RESTRICTED':
      return <Badge variant="secondary" className="text-xs">접근 제한 기록</Badge>;
    case 'REJECTED':
      return <Badge variant="outline" className="text-muted-foreground text-xs">반려됨</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function chatReportStatusBadge(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return <Badge variant="destructive" className="animate-pulse text-xs">접수 대기 (SLA)</Badge>;
    case 'ACTIONED_BLOCKED':
      return <Badge className="bg-rose-600 text-white text-xs font-semibold">계정 제재 / 차단</Badge>;
    case 'ACTIONED_WARNED':
      return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-xs font-semibold">경고 조치</Badge>;
    case 'REJECTED':
      return <Badge variant="secondary" className="text-muted-foreground text-xs">기각 / 무혐의</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function chatReportReasonBadge(reason: string) {
  switch (reason) {
    case 'spam_promotional':
      return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-xs">스팸 / 홍보</Badge>;
    case 'fraud_scam':
      return <Badge variant="destructive" className="text-xs">사기 / 금융 피해</Badge>;
    case 'abuse_harassment':
      return <Badge variant="destructive" className="bg-rose-600 text-white text-xs">욕설 / 협박</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">기타 규정 위반</Badge>;
  }
}

function EvidenceTargetLink({ url }: { readonly url: string }) {
  const href = safeTargetHref(url);
  if (!href) return <span className="block max-w-[280px] break-all text-muted-foreground">{url}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="block max-w-[280px] break-all text-muted-foreground underline hover:text-primary">
      {url}
    </a>
  );
}

function QueuePager({
  view, offset, otherOffset, loadedCount,
}: {
  readonly view: 'chat-reports' | 'takedowns';
  readonly offset: number;
  readonly otherOffset: number;
  readonly loadedCount: number | null;
}) {
  const href = (newOffset: number) => view === 'chat-reports'
    ? moderationPageHref(view, newOffset, otherOffset)
    : moderationPageHref(view, otherOffset, newOffset);
  return (
    <nav aria-label={view === 'chat-reports' ? '채팅 신고 페이지 이동' : '긴급 삭제 요청 페이지 이동'}
      className="flex flex-wrap items-center gap-3 px-4 pb-4 text-sm">
      <span aria-live="polite" className="text-muted-foreground">
        {offset / MODERATION_PAGE_SIZE + 1}페이지 · 현재 페이지 {loadedCount === null ? '조회 불가' : String(loadedCount) + '건'} (전체 건수 아님)
      </span>
      {offset > 0 && (
        <Button asChild variant="outline" className="min-h-11">
          <Link href={href(offset - MODERATION_PAGE_SIZE)}>이전 50건</Link>
        </Button>
      )}
      {loadedCount === MODERATION_PAGE_SIZE && offset < MODERATION_MAX_OFFSET && (
        <Button asChild variant="outline" className="min-h-11">
          <Link href={href(offset + MODERATION_PAGE_SIZE)}>다음 50건 확인</Link>
        </Button>
      )}
      {loadedCount === null && (
        <Button asChild variant="outline" className="min-h-11">
          <a href={href(offset)}>다시 조회</a>
        </Button>
      )}
    </nav>
  );
}

export default async function AdminSafetyPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminConsole(AREA.href);
  const params = await searchParams;
  const chatOffset = readModerationOffset(params.chatOffset);
  const takedownOffset = readModerationOffset(params.takedownOffset);
  const selectedView = params.view === 'takedowns' ? 'takedowns' : 'chat-reports';

  // The backend count is the current page length, not a global pending total.
  const [chatRaw, takedownRaw] = await Promise.all([
    apiOrNull<unknown>('/api/v1/admin/safety/chat-reports?limit=50&offset=' + chatOffset),
    apiOrNull<unknown>('/api/v1/admin/safety/takedowns?limit=50&offset=' + takedownOffset),
  ]);
  const chatQueue = parseChatQueue(chatRaw);
  const takedownQueue = parseTakedownQueue(takedownRaw);
  const chatReports = chatQueue?.items ?? [];
  const takedowns = takedownQueue?.items ?? [];
  const pendingChatReports = chatQueue
    ? chatReports.filter((r) => r.status === 'SUBMITTED').length : null;
  const pendingTakedowns = takedownQueue
    ? takedowns.filter((t) => t.status === 'SUBMITTED').length : null;
  const actionedPageCount = chatQueue && takedownQueue
    ? chatReports.filter((r) => r.status.startsWith('ACTIONED')).length +
      takedowns.filter((t) => t.status.startsWith('ACTIONED')).length
    : null;

  return (
    <div data-page="admin-safety" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* 상단 통합 현황 관제 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">현재 페이지 미처리 채팅 신고</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
              <MessageSquareWarning className="size-5" />
              {pendingChatReports === null ? '—' : pendingChatReports} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            현재 페이지 최대 50건 기준 · 전체 미처리 건수 아님
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">현재 페이지 미처리 긴급 삭제 요청</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              {pendingTakedowns === null ? '—' : pendingTakedowns} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            현재 페이지 최대 50건 기준 · 전체 미처리 건수 아님
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">현재 페이지 조치 기록</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-emerald-600 flex items-center gap-2">
              <ShieldCheck className="size-5" />
              {actionedPageCount === null ? '—' : actionedPageCount} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            현재 조회한 두 목록의 조치 기록만 집계 · 감사 완료 여부 별도 확인
          </CardContent>
        </Card>
      </div>

      {/* 2대 안전 큐 탭 인터페이스 */}
      <Tabs key={selectedView} defaultValue={selectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-10 mb-2">
          <TabsTrigger value="chat-reports" className="text-xs font-semibold gap-1.5">
            <MessageSquareWarning className="size-3.5" />
            1:1 채팅 신고 심사 ({pendingChatReports === null ? '확인 불가' : pendingChatReports})
          </TabsTrigger>
          <TabsTrigger value="takedowns" className="text-xs font-semibold gap-1.5">
            <FileText className="size-3.5" />
            긴급 콘텐츠 삭제 ({pendingTakedowns === null ? '확인 불가' : pendingTakedowns})
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: 1:1 개인 채팅 신고 큐 */}
        <TabsContent value="chat-reports">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">1:1 개인 채팅 신고 심사 큐 (Chat Incident Queue)</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    이용자 간 1:1 대화 중 접수된 스팸, 사기, 욕설 신고를 증거 스냅샷과 함께 심사하고 조치합니다.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs self-start sm:self-auto font-mono">
                  현재 페이지 {chatQueue === null ? '조회 불가' : chatReports.length + '건'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {chatQueue === null ? (
                <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
                  채팅 신고 목록을 확인할 수 없습니다. 대기 신고가 0건이라는 뜻이 아닙니다.
                </div>
              ) : chatReports.length === 0 ? (
                <EmptyState
                  title="현재 조회 페이지에 1:1 채팅 신고가 없습니다."
                  description="신규 신고가 접수되면 증거 스냅샷과 함께 실시간으로 큐에 노출됩니다."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[840px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">상태</TableHead>
                        <TableHead className="w-[130px]">신고 사유</TableHead>
                        <TableHead>신고자 / 피신고자</TableHead>
                        <TableHead className="w-[140px]">증거 스냅샷</TableHead>
                        <TableHead className="w-[140px]">접수 일시</TableHead>
                        <TableHead className="w-[110px] text-right">조치 결정</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chatReports.map((row) => (
                        <TableRow key={row.report_id}>
                          <TableCell>{chatReportStatusBadge(row.status)}</TableCell>
                          <TableCell>{chatReportReasonBadge(row.reason)}</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground font-normal">신고:</span>
                              <span className="font-semibold text-foreground">{row.reporter_nickname}</span>
                              <span className="text-muted-foreground text-[11px] font-mono">(@{row.reporter_username})</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-muted-foreground font-normal">대상:</span>
                              <span className="font-semibold text-destructive">{row.reported_nickname}</span>
                              <span className="text-muted-foreground text-[11px] font-mono">(@{row.reported_username})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ChatReportEvidenceDialog item={row} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(row.created_at).toLocaleString('ko-KR', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <ChatReportActionDialog item={row} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <QueuePager view="chat-reports" offset={chatOffset} otherOffset={takedownOffset}
              loadedCount={chatQueue?.count ?? null} />
          </Card>
        </TabsContent>

        {/* 탭 2: 비회원 긴급 콘텐츠 삭제 큐 */}
        <TabsContent value="takedowns">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">긴급 콘텐츠 삭제 모더레이션 큐 (Emergency Takedown Queue)</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    피해자 본인 또는 법정대리인이 요청한 비공개 사생활 침해 및 유해 콘텐츠를 심사하고 조치합니다.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs self-start sm:self-auto font-mono">
                  현재 페이지 {takedownQueue === null ? '조회 불가' : takedowns.length + '건'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {takedownQueue === null ? (
                <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
                  긴급 삭제 요청 목록을 확인할 수 없습니다. 미처리 요청이 0건이라는 뜻이 아닙니다.
                </div>
              ) : takedowns.length === 0 ? (
                <EmptyState
                  title="현재 조회 페이지에 긴급 삭제 요청이 없습니다."
                  description="접수된 신규 요청이 들어오면 실시간으로 큐에 노출됩니다."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">접수 번호</TableHead>
                        <TableHead className="w-[110px]">상태</TableHead>
                        <TableHead className="w-[140px]">신고 사유</TableHead>
                        <TableHead className="w-[100px]">콘텐츠 유형</TableHead>
                        <TableHead>신청자 / 대상 링크</TableHead>
                        <TableHead className="w-[130px]">접수 일시</TableHead>
                        <TableHead className="w-[90px] text-right">조치</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {takedowns.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono text-xs font-semibold">{row.case_id}</TableCell>
                          <TableCell>{takedownStatusBadge(row.status)}</TableCell>
                          <TableCell className="text-xs font-medium text-destructive">{row.reason_category}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px] font-mono">
                              {row.target_content_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium text-foreground">{row.requester_email}</div>
                            <EvidenceTargetLink url={row.target_content_url} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(row.created_at).toLocaleString('ko-KR', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <TakedownActionDialog item={row} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <QueuePager view="takedowns" offset={takedownOffset} otherOffset={chatOffset}
              loadedCount={takedownQueue?.count ?? null} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
