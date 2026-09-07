import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AuditSearchRow } from '../types';
import { AuditLogsView } from './audit-logs-view';

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

const SEQUENCE = /^\d{1,18}$/;

interface Filters {
  readonly from: string;
  readonly to: string;
  readonly administrator: string;
  readonly member: string;
  readonly feature: string;
  readonly action: string;
  readonly request: string;
  readonly transaction: string;
  readonly address: string;
  readonly outcome: string;
  readonly limit: string;
}

type SearchResult =
  | { readonly events: readonly AuditSearchRow[]; readonly nextCursor: string | null }
  | { readonly problem: string };

function one(value: string | string[] | undefined): string {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() ?? '';
}

function searchQuery(filters: Filters, cursor?: string): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') query.set(key, value);
  }
  if (cursor !== undefined) query.set('cursor', cursor);
  const text = query.toString();
  return text === '' ? '' : `?${text}`;
}

async function searchEvents(path: string): Promise<SearchResult> {
  try {
    return await api<{ events: AuditSearchRow[]; nextCursor: string | null }>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return {
        problem:
          '검색 조건을 다시 확인해 주세요. 관리자·회원·요청·거래 ID는 UUID여야 하고, IP는 주소 형식이어야 합니다.',
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

  const outcome = one(params.outcome);
  const limit = one(params.limit);
  const filters: Filters = {
    from: one(params.from),
    to: one(params.to),
    administrator: one(params.administrator),
    member: one(params.member),
    feature: one(params.feature),
    action: one(params.action),
    request: one(params.request),
    transaction: one(params.transaction),
    address: one(params.address),
    outcome: OUTCOMES.some((entry) => entry.value === outcome) ? outcome : '',
    limit: LIMITS.includes(limit) ? limit : DEFAULT_LIMIT,
  };

  const cursor = one(params.cursor);
  const paged = SEQUENCE.test(cursor);

  const search = await searchEvents(
    `/api/v1/admin/audit/events${searchQuery(filters, paged ? cursor : undefined)}`,
  );

  const events = 'problem' in search ? [] : search.events;
  const pageSize = Number(filters.limit);
  const nextCursor =
    'problem' in search || search.nextCursor === null || events.length < pageSize
      ? null
      : search.nextCursor;

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/admin/logs">감사 로그</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/logs/activity">사용자 접속 · 체류 · 클릭 로그</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/logs/delivery">Discord 전달 로그</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/logs/integrity">무결성 검증</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">조건 검색</CardTitle>
          <CardDescription>
            비어 있는 칸은 조건을 걸지 않습니다. 닉네임이 아니라 UUID입니다 — 사용자를
            찾을 때는 회원 관리에서 UUID를 복사해 오세요. 대상 회원 ID는 대상/주체로 기록된
            회원 로그를 함께 찾습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterField label="기간 시작" name="from" type="datetime-local" value={filters.from} />
              <FilterField label="기간 끝" name="to" type="datetime-local" value={filters.to} />
              <FilterField
                label="관리자 ID"
                name="administrator"
                value={filters.administrator}
                placeholder="UUID"
              />
              <FilterField
                label="대상 회원 ID"
                name="member"
                value={filters.member}
                placeholder="UUID"
              />
              <FilterField
                label="기능"
                name="feature"
                value={filters.feature}
                placeholder="audit, controls, users…"
              />
              <FilterField
                label="액션"
                name="action"
                value={filters.action}
                placeholder="admin.policy"
              />
              <FilterField
                label="요청 ID"
                name="request"
                value={filters.request}
                placeholder="UUID"
              />
              <FilterField
                label="거래 ID"
                name="transaction"
                value={filters.transaction}
                placeholder="UUID"
              />
              <FilterField
                label="IP 주소"
                name="address"
                value={filters.address}
                placeholder="203.0.113.7"
                hint="표시는 네트워크까지만 가려지지만, 검색은 정확한 주소로 합니다."
              />
              <FilterSelect label="결과" name="outcome" value={filters.outcome}>
                {OUTCOMES.map((entry) => (
                  <option key={entry.value || 'all'} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect label="표시 개수" name="limit" value={filters.limit}>
                {LIMITS.map((value) => (
                  <option key={value} value={value}>
                    {value}건
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="min-h-11 w-fit">
                검색
              </Button>
              <Button asChild variant="ghost" className="min-h-11 w-fit">
                <Link href="/admin/logs">조건 지우기</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 w-fit">
                <Link href="/admin/logs/integrity">무결성 검증 · 보존 정책 →</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 w-fit">
                <Link href="/admin/logs/delivery">Discord 전달 로그 →</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">운영 감사 로그</CardTitle>
          <CardDescription>
            각 항목은 앞 항목의 해시를 포함하는 사슬로 이어집니다. IP 주소는 /24(IPv6는 /48)
            네트워크까지만, 세션 식별자는 해시 앞 12자리만 보입니다. 원본을 확인하면 누가 왜
            보았는지가 새 감사 기록으로 남고, 그 기록은 지울 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {'problem' in search ? (
            <EmptyState title={search.problem} />
          ) : events.length === 0 ? (
            <EmptyState
              title="조건에 맞는 기록이 없습니다."
              {...(paged ? { description: '마지막 쪽까지 왔거나, 조건이 좁습니다.' } : {})}
            />
          ) : (
            <AuditLogsView events={events} />
          )}

          {!('problem' in search) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                최근 순으로 {events.length}건
                {paged && ` · 순번 ${cursor} 이전`}
              </p>
              <div className="flex flex-wrap gap-2">
                {paged && (
                  <Button asChild variant="ghost" size="sm" className="min-h-11">
                    <Link href={`/admin/logs${searchQuery(filters)}`}>처음으로</Link>
                  </Button>
                )}
                {nextCursor !== null && (
                  <Button asChild variant="outline" size="sm" className="min-h-11">
                    <Link href={`/admin/logs${searchQuery(filters, nextCursor)}`}>다음 →</Link>
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

function FilterField({
  label,
  name,
  value,
  type = 'text',
  placeholder,
  hint,
}: {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly type?: string;
  readonly placeholder?: string;
  readonly hint?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        name={name}
        type={type}
        defaultValue={value}
        autoComplete="off"
        {...(placeholder === undefined ? {} : { placeholder })}
      />
      {hint && <span className="text-[0.7rem] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
      >
        {children}
      </select>
    </label>
  );
}
