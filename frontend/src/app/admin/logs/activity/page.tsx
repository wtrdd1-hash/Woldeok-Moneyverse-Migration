import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import { adminArea } from '../../areas';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs/activity');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

interface ActivityLogRow {
  readonly id: string;
  readonly user_id: string | null;
  readonly username: string;
  readonly session_id: string;
  readonly event_type: string;
  readonly path: string;
  readonly target_label: string | null;
  readonly dwell_time_ms: number | null;
  readonly ip: string | null;
  readonly user_agent: string | null;
  readonly metadata: Record<string, unknown>;
  readonly created_at: string;
}

function formatDwellTime(ms: number | null): string {
  if (ms === null || ms === undefined || ms <= 0) return '-';
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}초`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${seconds}초`;
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export default async function AdminActivityLogsPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminConsole(AREA.href);
  const params = await searchParams;

  const eventType = typeof params.eventType === 'string' ? params.eventType : '';
  const limit = typeof params.limit === 'string' ? params.limit : '50';
  const page = typeof params.page === 'string' ? Math.max(1, parseInt(params.page, 10)) : 1;
  const offset = (page - 1) * parseInt(limit, 10);

  let logs: ActivityLogRow[] = [];
  try {
    const query = new URLSearchParams({ limit, offset: String(offset) });
    if (eventType) query.set('eventType', eventType);
    logs = await api<ActivityLogRow[]>(`/api/v1/admin/activity/logs?${query.toString()}`);
  } catch {
    logs = [];
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <AdminBack />

      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/logs">감사 로그</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/admin/logs/activity">사용자 접속 · 체류 · 클릭 로그</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/logs/delivery">Discord 전달 로그</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/logs/integrity">무결성 검증</Link>
        </Button>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">필터 설정</CardTitle>
          <CardDescription>이벤트 종류를 선택하여 활동 기록을 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex flex-wrap items-center gap-4">
            <div className="w-48">
              <label htmlFor="eventType" className="mb-1 block text-xs text-muted-foreground">이벤트 종류</label>
              <select
                id="eventType"
                name="eventType"
                defaultValue={eventType}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">전체 이벤트</option>
                <option value="page_view">👁️ 페이지 접속 (page_view)</option>
                <option value="page_dwell">⏱️ 페이지 체류 시간 (page_dwell)</option>
                <option value="button_click">👆 버튼 / 링크 클릭 (button_click)</option>
              </select>
            </div>

            <div className="w-28">
              <label htmlFor="limit" className="mb-1 block text-xs text-muted-foreground">출력 개수</label>
              <select
                id="limit"
                name="limit"
                defaultValue={limit}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="30">30개</option>
                <option value="50">50개</option>
                <option value="100">100개</option>
              </select>
            </div>

            <div className="mt-5">
              <Button type="submit" size="sm">조회</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">활동 로그 내역</CardTitle>
          <CardDescription>
            사용자의 실시간 접속, 페이지별 체류 시간, 클릭한 버튼 정보가 전수 기록됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState
              title="기록된 활동 로그가 없습니다"
              description="새로운 접속이나 클릭이 발생하면 여기에 실시간으로 기록됩니다."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-2.5 px-3">발생 시각</th>
                    <th className="py-2.5 px-3">사용자</th>
                    <th className="py-2.5 px-3">구분</th>
                    <th className="py-2.5 px-3">경로</th>
                    <th className="py-2.5 px-3">상세 내용 (버튼 / 체류 시간)</th>
                    <th className="py-2.5 px-3">IP / 접속 환경</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    let badgeColor: 'default' | 'secondary' | 'outline' | 'destructive' = 'outline';
                    let badgeLabel = log.event_type;

                    if (log.event_type === 'page_view') {
                      badgeColor = 'secondary';
                      badgeLabel = '👁️ 페이지 접속';
                    } else if (log.event_type === 'page_dwell') {
                      badgeColor = 'default';
                      badgeLabel = '⏱️ 체류 시간';
                    } else if (log.event_type === 'button_click') {
                      badgeColor = 'outline';
                      badgeLabel = '👆 버튼 클릭';
                    }

                    return (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap py-2.5 px-3 font-mono text-xs text-muted-foreground">
                          {formatTime(log.created_at)}
                        </td>
                        <td className="whitespace-nowrap py-2.5 px-3 font-medium">
                          {log.username}
                        </td>
                        <td className="whitespace-nowrap py-2.5 px-3">
                          <Badge variant={badgeColor} className="text-xs">
                            {badgeLabel}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-primary underline-offset-2 hover:underline">
                          <span title={log.path}>
                            {log.path.length > 35 ? `${log.path.slice(0, 35)}...` : log.path}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-xs">
                          {log.event_type === 'page_dwell' && (
                            <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                              체류 시간: {formatDwellTime(log.dwell_time_ms)}
                            </span>
                          )}
                          {log.event_type === 'button_click' && (
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                              {log.target_label || '클릭'}
                            </span>
                          )}
                          {log.event_type === 'page_view' && (
                            <span className="text-muted-foreground">페이지 진입</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                          <span>{log.ip || '-'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/admin/logs/activity?page=${page - 1}&limit=${limit}&eventType=${eventType}`}>
                  ← 이전 페이지
                </Link>
              ) : (
                '← 이전 페이지'
              )}
            </Button>
            <span className="text-xs text-muted-foreground">{page} 페이지</span>
            <Button
              variant="outline"
              size="sm"
              disabled={logs.length < parseInt(limit, 10)}
              asChild={logs.length >= parseInt(limit, 10)}
            >
              {logs.length >= parseInt(limit, 10) ? (
                <Link href={`/admin/logs/activity?page=${page + 1}&limit=${limit}&eventType=${eventType}`}>
                  다음 페이지 →
                </Link>
              ) : (
                '다음 페이지 →'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
