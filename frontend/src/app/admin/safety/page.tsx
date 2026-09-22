import type { Metadata } from 'next';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/safety');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

function statusBadge(status: string) {
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

export default async function AdminSafetyPage() {
  await requireAdminConsole(AREA.href);

  const res = await apiOrNull<{ items: TakedownItem[]; count: number }>('/api/v1/admin/safety/takedowns');
  const items = res?.items ?? [];

  const pendingCount = items.filter((i) => i.status === 'SUBMITTED').length;
  const removedCount = items.filter((i) => i.status === 'ACTIONED_REMOVED').length;

  return (
    <div data-page="admin-safety" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* 상단 현황 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">미처리 긴급 접수 건 (SLA 위험)</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              {pendingCount} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            TAKE IT DOWN Act 기준 24시간 내 신속 조치 대상
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">누적 긴급 삭제 조치</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-emerald-600 flex items-center gap-2">
              <ShieldCheck className="size-5" />
              {removedCount} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            원터치 심사 후 데이터베이스에서 완전 격리 및 삭제된 건수
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">전체 접수 및 신고 이력</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              {items.length} <span className="text-sm font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            비회원 공개 창구 및 회원 신고 전체 인입 건수
          </CardContent>
        </Card>
      </div>

      {/* 긴급 삭제 모더레이션 큐 테이블 */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base font-semibold">긴급 콘텐츠 삭제 모더레이션 큐 (Emergency Takedown Queue)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            피해자 본인 또는 법정대리인이 요청한 비공개 사생활 침해 및 유해 콘텐츠를 심사하고 조치합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {items.length === 0 ? (
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
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-semibold">{row.case_id}</TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
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
    </div>
  );
}
