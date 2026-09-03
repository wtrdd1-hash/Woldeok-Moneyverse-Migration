import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ArrowUpRight, CalendarDays, CircleUserRound, ShieldAlert } from 'lucide-react';
import { AdminBack } from '../../admin-back';
import { AdminAdjustmentDialog, ForceLogoutDialog, RestrictionDialog } from '../../admin-forms';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import type { AdminUser, AuditSearchRow } from '../../types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '사용자 상세 · 활동 로그',
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminUserDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly id: string }>;
}) {
  await requireAdminConsole();
  const { id } = await params;
  const userId = decodeURIComponent(id);

  if (!UUID.test(userId)) return <InvalidUser />;

  const [directory, activity] = await Promise.all([
    apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ events: AuditSearchRow[]; nextCursor: string | null }>(
      `/api/v1/admin/audit/events?member=${encodeURIComponent(userId)}&limit=50`,
    ),
  ]);
  const user = directory?.users.find((entry) => entry.user_id === userId);

  if (!user) {
    return (
      <div className="grid gap-5">
        <AdminBack href="/admin/users" label="사용자 관리로" />
        <PageHeader eyebrow="USER SAFETY" title="사용자를 찾을 수 없습니다">
          삭제됐거나 현재 관리자에게 표시되지 않는 사용자입니다.
        </PageHeader>
      </div>
    );
  }

  const restricted = user.restricted_at !== null;
  const events = activity?.events ?? [];
  const logLink = `/admin/logs?member=${encodeURIComponent(user.user_id)}&limit=50`;

  return (
    <div className="grid gap-5">
      <AdminBack href="/admin/users" label="사용자 관리로" />
      <PageHeader eyebrow="USER DETAIL" title={user.display_name}>
        사용자 상태와 관련 활동 기록을 한곳에서 확인하고 필요한 조치를 실행합니다.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-muted">
                  <CircleUserRound className="size-6 text-clay" />
                </span>
                <span>
                  <CardTitle>{user.display_name}</CardTitle>
                  <CardDescription className="mt-1 font-mono text-[0.72rem]">
                    {user.user_id}
                  </CardDescription>
                </span>
              </div>
              <Badge variant={restricted ? 'destructive' : 'secondary'}>
                {restricted ? '이용 제한됨' : '정상 이용'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Fact icon={CalendarDays} term="가입 시각" value={formatMoment(user.created_at)} />
              <Fact icon={Activity} term="현재 상태" value={user.status} />
              <Fact
                icon={ShieldAlert}
                term="제한 사유"
                value={user.restriction_reason ?? '제한 없음'}
                wide
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">빠른 관리</CardTitle>
            <CardDescription>
              조치는 사유와 추가 인증을 요구하며 모두 감사 기록에 남습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <AdminAdjustmentDialog userId={user.user_id} username={user.display_name} />
            <ForceLogoutDialog userId={user.user_id} displayName={user.display_name} />
            <RestrictionDialog
              userId={user.user_id}
              displayName={user.display_name}
              restricted={restricted}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">사용자 관련 활동 로그</CardTitle>
              <CardDescription className="mt-1">
                이 사용자가 관리 작업의 대상이었던 최근 기록 최대 50건입니다.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="min-h-10">
              <Link href={logLink}>
                전체 감사 로그에서 보기 <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activity === null ? (
            <EmptyState title="사용자 활동 기록을 불러오지 못했어요." />
          ) : events.length === 0 ? (
            <EmptyState title="이 사용자를 대상으로 한 관리 기록이 없습니다." />
          ) : (
            <div className="grid gap-2">
              {events.map((event) => (
                <article
                  key={event.audit_id}
                  className="grid gap-2 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="break-all font-mono text-xs">{event.action}</strong>
                      <EventOutcome outcome={event.outcome} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.feature ?? '기타'} · 관리자 {shortId(event.actor_user_id)} · 순번{' '}
                      {event.sequence}
                    </p>
                  </div>
                  <time className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatMoment(event.created_at)}
                  </time>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InvalidUser() {
  return (
    <div className="grid gap-5">
      <AdminBack href="/admin/users" label="사용자 관리로" />
      <EmptyState title="올바르지 않은 사용자 주소입니다." />
    </div>
  );
}

function Fact({
  icon: Icon,
  term,
  value,
  wide = false,
}: {
  readonly icon: typeof Activity;
  readonly term: string;
  readonly value: string;
  readonly wide?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-muted/50 p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {term}
      </dt>
      <dd className="mt-1 font-medium break-words">{value}</dd>
    </div>
  );
}

function EventOutcome({ outcome }: { readonly outcome: string | null }) {
  if (outcome === null) return null;
  return (
    <Badge variant={outcome === 'failure' ? 'destructive' : 'secondary'}>
      {outcome === 'success' ? '성공' : outcome === 'failure' ? '실패' : '부분 성공'}
    </Badge>
  );
}

function shortId(value: string | null): string {
  return value === null ? '시스템' : `${value.slice(0, 8)}…`;
}
