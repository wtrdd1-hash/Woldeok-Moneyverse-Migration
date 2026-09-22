import type { Metadata } from 'next';
import { ShieldCheck, AlertTriangle, MessageSquareWarning, FileText } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
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
import { TakedownActionDialog, type TakedownItem } from './takedown-action-dialog';
import { ChatReportEvidenceDialog, type ChatReportItem } from './chat-report-evidence-dialog';
import { ChatReportActionDialog } from './chat-report-action-dialog';

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
      return <Badge className="bg-emerald-600 text-white text-xs">삭제 완료</Badge>;
    case 'ACTIONED_RESTRICTED':
      return <Badge variant="secondary" className="text-xs">접근 제한</Badge>;
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

export default async function AdminSafetyPage() {
  await requireAdminConsole(AREA.href);

  // 병렬로 채팅 신고 큐와 긴급 삭제 큐 조회
  const [chatReportsRes, takedownsRes] = await Promise.all([
    apiOrNull<{ items: ChatReportItem[]; count: number }>('/api/v1/admin/safety/chat-reports'),
    apiOrNull<{ items: TakedownItem[]; count: number }>('/api/v1/admin/safety/takedowns'),
  ]);

  const chatReports = chatReportsRes?.items ?? [];
  const takedowns = takedownsRes?.items ?? [];

  const pendingChatReports = chatReports.filter((r) => r.status === 'SUBMITTED').length;
  const pendingTakedowns = takedowns.filter((t) => t.status === 'SUBMITTED').length;
  const actionedTotal =
    chatReports.filter((r) => r.status !== 'SUBMITTED').length +
    takedowns.filter((t) => t.status.startsWith('ACTIONED')).length;

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
            <CardDescription className="text-xs">미처리 1:1 채팅 신고 (SLA 긴급)</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
              <MessageSquareWarning className="size-5" />
              {pendingChatReports} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            10개 메시지 증거 스냅샷 검토 및 즉시 제재 대상
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">미처리 긴급 삭제 (TAKE IT DOWN)</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              {pendingTakedowns} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            사생활 침해/유해물 24시간 내 신속 격리 대상
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">누적 안전 조치 및 감사 완료</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-emerald-600 flex items-center gap-2">
              <ShieldCheck className="size-5" />
              {actionedTotal} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            모든 조치는 PostgreSQL audit_logs에 불변 기록됨
          </CardContent>
        </Card>
      </div>

      {/* 2대 안전 큐 탭 인터페이스 */}
      <Tabs defaultValue="chat-reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-10 mb-2">
          <TabsTrigger value="chat-reports" className="text-xs font-semibold gap-1.5">
            <MessageSquareWarning className="size-3.5" />
            1:1 채팅 신고 심사 ({pendingChatReports})
          </TabsTrigger>
          <TabsTrigger value="takedowns" className="text-xs font-semibold gap-1.5">
            <FileText className="size-3.5" />
            긴급 콘텐츠 삭제 ({pendingTakedowns})
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
                  총 {chatReports.length}건
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {chatReports.length === 0 ? (
                <EmptyState
                  title="대기 중인 1:1 채팅 신고가 없습니다."
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
                  총 {takedowns.length}건
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {takedowns.length === 0 ? (
                <EmptyState
                  title="대기 중인 긴급 삭제 요청이 없습니다."
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
                            <a
                              href={row.target_content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary truncate block max-w-[280px]"
                            >
                              {row.target_content_url}
                            </a>
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
