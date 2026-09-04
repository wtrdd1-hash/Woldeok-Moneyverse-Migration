import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CircleUserRound,
  Coins,
  Crown,
  Landmark,
  PiggyBank,
  ShieldAlert,
  TrendingUp,
  Wallet,
} from 'lucide-react';
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
  const { id } = await params;
  await requireAdminConsole(`/admin/users/${encodeURIComponent(id)}`);
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

  const netWorth = Number(user.total_net_worth ?? 0);
  const cash = Number(user.cash_balance ?? 0);
  const bank = Number(user.bank_balance ?? 0);
  const bond = Number(user.bond_balance ?? 0);
  const stock = Number(user.stock_eval ?? 0);
  const rank = user.wealth_rank ?? '—';

  return (
    <div className="grid gap-5">
      <AdminBack href="/admin/users" label="사용자 관리로" />
      <PageHeader eyebrow="USER DETAIL" title={user.display_name}>
        사용자 상태와 자산 현황, 관련 활동 기록을 한곳에서 확인하고 필요한 조치를 실행합니다.
      </PageHeader>

      {/* 기본 정보 및 빠른 관리 */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-muted">
                  <CircleUserRound className="size-6 text-primary" />
                </span>
                <span>
                  <CardTitle className="flex items-center gap-2">
                    {user.display_name}
                    {user.wealth_rank === 1 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-500 border border-amber-500/30">
                        <Crown className="size-3" /> 최고 부자 1위
                      </span>
                    )}
                  </CardTitle>
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

      {/* 보유 자산 포트폴리오 대시보드 카드 */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Coins className="size-5 text-primary" /> 보유 자산 종합 포트폴리오
              </CardTitle>
              <CardDescription className="mt-0.5">
                머니버스 전체 경제 활동(현금, 예금, 국채, 가상 주식)을 실시간으로 집계한 자산입니다.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">부자 순위:</span>
              <Badge variant="outline" className="font-mono text-sm px-2.5 py-0.5 border-primary/40 text-primary">
                🏆 {rank}위
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-primary/20 bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Coins className="size-4 text-primary" /> 총 순자산
              </div>
              <strong className="mt-2 block font-mono text-xl font-bold text-primary">
                {netWorth.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </strong>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="size-4 text-emerald-500" /> 지갑 현금
              </div>
              <strong className="mt-2 block font-mono text-lg font-bold">
                {cash.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </strong>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PiggyBank className="size-4 text-blue-500" /> 은행 예금
              </div>
              <strong className="mt-2 block font-mono text-lg font-bold">
                {bank.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </strong>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Landmark className="size-4 text-purple-500" /> 가상 국채
              </div>
              <strong className="mt-2 block font-mono text-lg font-bold">
                {bond.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </strong>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="size-4 text-amber-500" /> 주식 평가액
              </div>
              <strong className="mt-2 block font-mono text-lg font-bold">
                {stock.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 활동 감사 로그 */}
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
                  className="grid gap-2 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center hover:bg-muted/20 transition-colors"
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
