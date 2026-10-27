import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, User } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, api, apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AdminUser, AuditSearchRow } from '../types';
import { AuditLogsFilterForm, type AuditFilters } from './audit-logs-filter-form';
import { AuditLogsView, type AuditUserInfo } from './audit-logs-view';
import { LogsSubNav } from './logs-sub-nav';
import { parseAuditSearchResponse, resolveAuditIdentity, type AuditIdentity } from './audit-search-evidence';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

const OUTCOMES: readonly { readonly value: string; readonly label: string }[] = [
  { value: '', label: '전체' },
  { value: 'success', label: '성공' },
  { value: 'failure', label: '실패' },
  { value: 'partial', label: '부분 성공' },
];

const LIMITS: readonly string[] = ['30', '50', '100'];
const DEFAULT_LIMIT = '30';

const SEQUENCE = /^[1-9][0-9]{0,18}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SearchResult =
  | { readonly events: readonly AuditSearchRow[]; readonly nextCursor: string | null }
  | { readonly problem: string };

function one(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function identityProblem(identity: AuditIdentity, label: string): string | null {
  if (identity.status === 'all' || identity.status === 'resolved') return null;
  if (identity.status === 'unavailable') return `${label} 닉네임은 제한된 회원 목록에서 확인할 수 없습니다. 정확한 회원 UUID로 조회해 주세요.`;
  if (identity.status === 'ambiguous') return `${label} 닉네임이 여러 회원과 일치합니다. 회원 UUID를 입력해 주세요.`;
  if (identity.status === 'invalid') return `${label} 검색어 형식이 올바르지 않습니다. UUID 또는 80자 이내의 정확한 닉네임을 입력해 주세요.`;
  return `${label} 닉네임과 일치하는 회원이 없습니다. 회원 UUID를 확인해 주세요.`;
}

function searchQuery(filters: AuditFilters, cursor?: string): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') query.set(key, value);
  }
  if (cursor !== undefined) query.set('cursor', cursor);
  const text = query.toString();
  return text === '' ? '' : `?${text}`;
}

async function searchEvents(path: string, limit: number, beforeCursor?: string): Promise<SearchResult> {
  try {
    const response = await api<unknown>(path);
    const verified = parseAuditSearchResponse(response, limit, beforeCursor);
    return verified ?? { problem: '감사 검색 API 응답의 원장 항목이나 페이지 순서를 검증하지 못했습니다. 다시 조회해 주세요.' };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return {
        problem:
          '검색 조건을 다시 확인해 주세요. 관리자·회원·요청·거래 ID는 올바른 UUID여야 하고, IP는 주소 형식이어야 합니다.',
      };
    }
    return { problem: '감사 기록을 불러오지 못했어요.' };
  }
}

export default async function AdminLogsPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminConsole(AREA.href);
  const params = await searchParams;

  // 전체 관리자/회원 목록 조회하여 닉네임 매핑 테이블 구성
  const usersResponse = await apiOrNull<{ users: AdminUser[]; scope: { kind: string; limit: number; hasMore: boolean } }>('/api/v1/admin/users');
  const userList = Array.isArray(usersResponse?.users)
    ? usersResponse.users.filter((u) => u !== null && typeof u === 'object' && UUID_REGEX.test(u.user_id) && typeof u.display_name === 'string')
    : [];
  const directoryComplete = usersResponse?.scope?.kind === 'WEALTH_ORDERED_SNAPSHOT' && usersResponse.scope.hasMore === false && usersResponse.scope.limit === 50;
  const userMap: Record<string, AuditUserInfo> = {};
  for (const u of userList) {
    userMap[u.user_id] = {
      display_name: u.display_name,
      status: u.status,
    };
  }

  const outcome = one(params.outcome);
  const limit = one(params.limit);
  const rawAdmin = one(params.administrator);
  const rawMember = one(params.member);

  const filters: AuditFilters = {
    from: one(params.from),
    to: one(params.to),
    administrator: rawAdmin,
    member: rawMember,
    feature: one(params.feature),
    action: one(params.action),
    request: one(params.request),
    transaction: one(params.transaction),
    address: one(params.address),
    outcome: OUTCOMES.some((entry) => entry.value === outcome) ? outcome : '',
    limit: LIMITS.includes(limit) ? limit : DEFAULT_LIMIT,
  };

  // Only exact UUIDs bypass the capped directory; a partial nickname must not select another member.
  const adminIdentity = resolveAuditIdentity(rawAdmin, usersResponse);
  const memberIdentity = resolveAuditIdentity(rawMember, usersResponse);
  const resolvedAdminId = adminIdentity.status === 'resolved' ? adminIdentity.userId : null;
  const resolvedMemberId = memberIdentity.status === 'resolved' ? memberIdentity.userId : null;
  const identityError = identityProblem(adminIdentity, '관리자') ?? identityProblem(memberIdentity, '대상 회원');

  const cursor = one(params.cursor);
  const paged = cursor !== '';
  const validCursor = !paged || (SEQUENCE.test(cursor) && BigInt(cursor) <= 9223372036854775807n);
  const duplicateQueryValues = Object.values(params).some(Array.isArray);

  const backendFilters: AuditFilters = {
    ...filters,
    administrator: resolvedAdminId ?? '',
    member: resolvedMemberId ?? '',
  };

  const search: SearchResult = duplicateQueryValues
    ? { problem: '중복된 검색 조건은 허용되지 않습니다. 필터를 하나씩 지정해 주세요.' }
    : identityError !== null
      ? { problem: identityError }
      : !validCursor
        ? { problem: '감사 기록 페이지 순서가 올바르지 않습니다. 처음부터 다시 조회해 주세요.' }
        : await searchEvents(
            `/api/v1/admin/audit/events${searchQuery(backendFilters, paged ? cursor : undefined)}`,
            Number(filters.limit),
            paged ? cursor : undefined,
          );

  const events = 'problem' in search ? [] : search.events;
  const pageSize = Number(filters.limit);
  const nextCursor =
    'problem' in search || search.nextCursor === null || events.length < pageSize
      ? null
      : search.nextCursor;

  return (
    <div data-page="admin-logs" className="mv-page mv-page--admin grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <LogsSubNav current="audit" />

      {/* 스마트 조건 검색 아코디언 폼 */}
      <AuditLogsFilterForm filters={filters} users={directoryComplete ? userList : []} />

      {/* 운영 감사 로그 결과 카드 */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold">운영 감사 로그 원장</CardTitle>
              <CardDescription className="text-xs">
                각 항목은 SHA-256 해시 체인으로 불변 보존되며, IP 주소 및 세션은 안전하게 보호됩니다.
              </CardDescription>
            </div>
            {!('problem' in search) && (
              <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                현재 조회: {events.length}건 {paged && `(순번 ${cursor} 이전)`}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {'problem' in search ? (
            <div role="alert" aria-live="polite" className="grid place-items-center gap-3 py-8">
              <EmptyState title={search.problem} />
              <Button asChild variant="outline" size="sm" className="min-h-11">
                <Link href={`/admin/logs${searchQuery(filters, paged ? cursor : undefined)}`}>같은 조건으로 다시 조회</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="min-h-11">
                <Link href="/admin/logs">조건 초기화 후 전체 목록 보기</Link>
              </Button>
            </div>
          ) : events.length === 0 ? (
            filters.member ? (
              <EmptyState
                title="이 회원을 대상으로 한 관리자 조작 감사 기록은 없습니다."
                description="접속·체류·클릭 같은 사용자 활동은 운영 감사 로그와 별도로 기록됩니다."
              >
                <Button asChild variant="outline" size="sm" className="min-h-11">
                  <Link href={`/admin/logs/activity?userId=${encodeURIComponent(filters.member)}&limit=50`}>
                    사용자 접속 · 체류 · 클릭 로그 보기
                  </Link>
                </Button>
              </EmptyState>
            ) : resolvedMemberId && userMap[resolvedMemberId] ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Shield className="size-5" />
                  </div>
                  <div className="grid gap-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <h3 className="text-sm font-bold text-foreground">
                        회원 &apos;{userMap[resolvedMemberId].display_name}&apos; 감사 원장 조회 결과
                      </h3>
                      <Badge variant="outline" className="font-mono text-xs">
                        {resolvedMemberId}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      현재 검색 조건에 일치하는 관리자 조치 기록이 없습니다. 전체 기간의 제재 이력 부재나 회원 정상 상태를 보증하지 않습니다.
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      회원의 <strong>실시간 웹 접속, 페이지별 체류 시간, 버튼 클릭, API 요청</strong> 등의 실제 활동 기록은 <strong>사용자 접속·활동 로그</strong>에서 즉시 조회하실 수 있습니다.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-2 justify-center sm:justify-start">
                      <Button asChild variant="default" size="sm" className="gap-1.5 font-semibold">
                        <Link href={`/admin/logs/activity?userId=${resolvedMemberId}`}>
                          <User className="size-3.5" />
                          &apos;{userMap[resolvedMemberId].display_name}&apos;의 실시간 활동 로그 조회하기
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/logs">전체 감사 로그로 돌아가기</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : resolvedAdminId && userMap[resolvedAdminId] ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Shield className="size-5" />
                  </div>
                  <div className="grid gap-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <h3 className="text-sm font-bold text-foreground">
                        관리자 &apos;{userMap[resolvedAdminId].display_name}&apos; 수행 감사 이력 없음
                      </h3>
                      <Badge variant="outline" className="font-mono text-xs">
                        {resolvedAdminId}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      해당 관리자 계정으로 수행된 운영 감사 조치 기록이 현재 검색 기간에 존재하지 않습니다.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-2 justify-center sm:justify-start">
                      <Button asChild variant="default" size="sm" className="gap-1.5 font-semibold">
                        <Link href={`/admin/logs/activity?userId=${resolvedAdminId}`}>
                          <User className="size-3.5" />
                          &apos;{userMap[resolvedAdminId].display_name}&apos;의 실시간 활동 로그 조회
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/logs">전체 감사 로그로 돌아가기</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid place-items-center gap-3 py-8">
                <EmptyState
                  title="조건에 맞는 감사 기록이 없습니다."
                  description={paged ? '마지막 쪽까지 도달했거나, 검색 조건이 너무 좁습니다.' : '필터 조건을 변경하거나 조건 초기화를 눌러 전체 감사 로그를 확인해 보세요.'}
                />
                <Button asChild variant="default" size="sm" className="min-h-10 px-4">
                  <Link href="/admin/logs">전체 최신 감사 로그 조회하기</Link>
                </Button>
              </div>
            )
          ) : (
            <AuditLogsView events={events} userMap={userMap} />
          )}

          {!('problem' in search) && events.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
              <p className="text-xs text-muted-foreground">
                최근 순으로 {events.length}건
                {paged && ` · 순번 ${cursor} 이전`}
              </p>
              <div className="flex flex-wrap gap-2">
                {paged && (
                  <Button asChild variant="ghost" size="sm" className="min-h-10">
                    <Link href={`/admin/logs${searchQuery(filters)}`}>처음으로</Link>
                  </Button>
                )}
                {nextCursor !== null && (
                  <Button asChild variant="outline" size="sm" className="min-h-10">
                    <Link href={`/admin/logs${searchQuery(filters, nextCursor)}`}>다음 페이지 →</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
