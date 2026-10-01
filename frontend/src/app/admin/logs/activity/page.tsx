import type { Metadata } from 'next';
import Link from 'next/link';
import { Filter, User, X } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, api, apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import { adminArea } from '../../areas';
import type { AdminUser } from '../../types';
import { LogsSubNav } from '../logs-sub-nav';
import { TrafficDashboard, type TrafficAnalyticsDashboard } from './traffic-dashboard';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs/activity');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveUserId(input: string, userList: readonly AdminUser[]): string | null {
  if (!input) return null;
  if (UUID_REGEX.test(input)) return input;

  const target = input.toLowerCase();
  const matched = userList.find((u) => u.display_name.toLowerCase() === target);
  if (matched) return matched.user_id;

  const partial = userList.find((u) => u.display_name.toLowerCase().includes(target));
  return partial?.user_id ?? null;
}

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

  const granularity = params.granularity === 'month' || params.granularity === 'year' ? params.granularity : 'day';
  const periods = granularity === 'day' ? 30 : granularity === 'month' ? 24 : 10;
  const eventType = typeof params.eventType === 'string' ? params.eventType : '';
  const userId = typeof params.userId === 'string' ? params.userId.trim() : '';
  const limit = typeof params.limit === 'string' ? params.limit : '50';
  const page = typeof params.page === 'string' ? Math.max(1, parseInt(params.page, 10)) : 1;
  const offset = (page - 1) * parseInt(limit, 10);
  const rawUser = typeof params.userId === 'string' ? params.userId : typeof params.userSearch === 'string' ? params.userSearch : '';

  const [trafficRes, usersResponse] = await Promise.all([
    apiOrNull<TrafficAnalyticsDashboard>(`/api/v1/admin/activity/traffic?granularity=${granularity}&periods=${periods}`),
    apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users'),
  ]);

  const userList = usersResponse?.users ?? [];
  const resolvedUserId = rawUser ? resolveUserId(rawUser, userList) : null;
  const resolvedUser = resolvedUserId ? userList.find((u) => u.user_id === resolvedUserId) : null;

  let logs: ActivityLogRow[] = [];
  const traffic: TrafficAnalyticsDashboard | null = trafficRes;
  let loadProblem = '';

  try {
    const query = new URLSearchParams({ limit, offset: String(offset) });
    if (eventType) query.set('eventType', eventType);
    if (userId) query.set('userId', userId);
    logs = await api<ActivityLogRow[]>(`/api/v1/admin/activity/logs?${query.toString()}`);
  } catch (error) {
    loadProblem = error instanceof ApiError && error.status === 403
      ? '관리자 세션 권한을 확인할 수 없습니다. 다시 로그인한 뒤 시도해 주세요.'
      : '활동 로그를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  }

  const paginationQuery = (targetPage: number) => {
    const q = new URLSearchParams({ page: String(targetPage), limit });
    if (eventType) q.set('eventType', eventType);
    if (rawUser) q.set('userId', rawUser);
    return `?${q.toString()}`;
  };

  return (
    <div data-page="admin-logs-activity" className="mv-page mv-page--admin mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <AdminBack />

      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <LogsSubNav current="activity" />

      {/* 유저 자동완성 데이터리스트 */}
      {userList.length > 0 && (
        <datalist id="activity-user-suggestions">
          {userList.map((u) => (
            <option key={u.user_id} value={u.display_name}>
              {u.user_id}
            </option>
          ))}
        </datalist>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">접속 분석</CardTitle>
          <CardDescription>원시 IP나 전체 referrer URL을 복제하지 않고 페이지 접속·세션·진입 경로를 집계합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {traffic ? <TrafficDashboard data={traffic} /> : <EmptyState title="접속 분석을 불러오지 못했습니다." description="집계 API와 관리자 권한을 확인해 주세요." />}
        </CardContent>
      </Card>

      {/* Filter Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              <CardTitle className="text-base">필터 설정</CardTitle>
            </div>
            {resolvedUserId && (
              <Badge variant="default" className="text-xs px-2 py-0.5">
                회원 필터 적용 중
              </Badge>
            )}
          </div>
          <CardDescription>이벤트 종류 및 특정 회원의 닉네임/UUID로 실시간 활동 기록을 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="GET" className="flex flex-wrap items-center gap-4">
            <div className="w-full sm:w-60">
              <label htmlFor="userId" className="mb-1 block text-xs text-muted-foreground">
                회원 검색 (닉네임 또는 UUID)
              </label>
              <Input
                id="userId"
                name="userId"
                defaultValue={rawUser}
                list="activity-user-suggestions"
                placeholder="예: 닉네임 또는 UUID"
                className="h-9 text-xs"
                autoComplete="off"
              />
            </div>

            <div className="w-full sm:w-48">
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
                <option value="api_request">🌐 API 요청 (api_request)</option>
                <option value="admin_request">🛡️ 관리자 요청 (admin_request)</option>
              </select>
            </div>

            <div className="w-full sm:w-28">
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

            <div className="flex w-full items-center gap-2 sm:mt-5 sm:w-auto">
              <Button type="submit" size="sm" className="w-full sm:w-auto">조회</Button>
              {(rawUser || eventType) && (
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                  <Link href="/admin/logs/activity" title="필터 초기화">
                    <X className="size-3.5 mr-1" />
                    초기화
                  </Link>
                </Button>
              )}
            </div>
          </form>

          {/* 활성 회원 필터 요약 바 */}
          {resolvedUser && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary shrink-0" />
                <span>
                  선택된 회원: <strong className="text-foreground">{resolvedUser.display_name}</strong>
                  <code className="ml-1.5 font-mono text-[11px] text-muted-foreground bg-muted/60 px-1 py-0.5 rounded">
                    {resolvedUser.user_id}
                  </code>
                </span>
              </div>
              <Button asChild variant="ghost" size="xs" className="h-6 text-xs text-muted-foreground hover:text-foreground">
                <Link href={`/admin/logs/activity${eventType ? `?eventType=${eventType}` : ''}`}>
                  전체 회원 보기로 전환
                </Link>
              </Button>
            </div>
          )}
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
          {loadProblem ? (
            <EmptyState title="활동 로그 조회 실패" description={loadProblem} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="기록된 활동 로그가 없습니다"
              description="새로운 접속이나 클릭이 발생하면 여기에 실시간으로 기록됩니다."
            />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
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
                    badgeLabel = '👆 버튼 클릭';
                  } else if (log.event_type === 'api_request') {
                    badgeLabel = '🌐 API 요청';
                  } else if (log.event_type === 'admin_request') {
                    badgeColor = 'destructive';
                    badgeLabel = '🛡️ 관리자 요청';
                  }
                  const detail = log.event_type === 'page_dwell'
                    ? `체류 시간: ${formatDwellTime(log.dwell_time_ms)}`
                    : log.event_type === 'button_click'
                      ? log.target_label || '클릭'
                      : log.event_type === 'page_view'
                        ? '페이지 진입'
                        : `${String(log.metadata.method ?? '')} · ${String(log.metadata.status ?? '')} · ${String(log.metadata.durationMs ?? '')}ms`;
                  return <div key={log.id} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <strong className="block truncate">{log.username}</strong>
                        <span className="font-mono text-[11px] text-muted-foreground">{formatTime(log.created_at)}</span>
                      </div>
                      <Badge variant={badgeColor} className="text-xs">{badgeLabel}</Badge>
                    </div>
                    <p className="mt-3 break-all font-mono text-xs text-primary">{log.path}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">IP {log.ip || '-'}</p>
                  </div>;
                })}
              </div>
              <div className="hidden overflow-x-auto md:block">
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
                    } else if (log.event_type === 'api_request') {
                      badgeColor = 'outline';
                      badgeLabel = '🌐 API 요청';
                    } else if (log.event_type === 'admin_request') {
                      badgeColor = 'destructive';
                      badgeLabel = '🛡️ 관리자 요청';
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
                          {(log.event_type === 'api_request' || log.event_type === 'admin_request') && (
                            <span className="text-muted-foreground">
                              {String(log.metadata.method ?? '')} · {String(log.metadata.status ?? '')} · {String(log.metadata.durationMs ?? '')}ms
                            </span>
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
            </>
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
                <Link href={`/admin/logs/activity${paginationQuery(page - 1)}`}>
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
                <Link href={`/admin/logs/activity${paginationQuery(page + 1)}`}>
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
