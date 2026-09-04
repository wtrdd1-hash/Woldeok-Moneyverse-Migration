import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApiError, api } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AuditSearchRow } from '../types';
import { RevealDisclosure } from './logs-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

/**
 * The audit trail, searched rather than scrolled.
 *
 * This page used to print whatever the last thirty rows happened to be, with
 * four columns and no way to ask a question of them. An incident starts from
 * a request id, an address or a member, and none of those were reachable.
 *
 * The form is a plain GET form and the page reads its own query string. That
 * is what makes a search a link: the URL an operator lands on after
 * filtering is the URL they can paste into an incident note, and it survives
 * a reload, which a client-held filter state does not.
 *
 * PAGINATION IS BY CURSOR, NOT OFFSET. The chain grows under a reader — one
 * administrator request is one row — and an offset would repeat or skip rows
 * as it does. `cursor` is the last row's chain position and the database
 * asks for `sequence < cursor`, so a page boundary means the same thing
 * however much has been written since.
 */

const OUTCOMES: readonly { readonly value: string; readonly label: string }[] = [
  { value: '', label: '전체' },
  { value: 'success', label: '성공' },
  { value: 'failure', label: '실패' },
  { value: 'partial', label: '부분 성공' },
];

const LIMITS: readonly string[] = ['30', '50', '100'];
const DEFAULT_LIMIT = '30';

/** A chain position, as text: it is a bigint and never becomes a number. */
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

/** Empty fields are left out entirely, so a shared link carries only what was asked. */
function searchQuery(filters: Filters, cursor?: string): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') query.set(key, value);
  }
  if (cursor !== undefined) query.set('cursor', cursor);
  const text = query.toString();
  return text === '' ? '' : `?${text}`;
}

/**
 * A malformed filter and an unreachable service are different facts, and an
 * operator can only act on the first. `apiOrNull` would flatten both into
 * "could not load", which is how somebody spends ten minutes on a mistyped
 * UUID.
 */
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
    // Both come from a <select>, so a value outside the list arrived by hand.
    // Dropping it beats a 400 that reads as though the trail were broken.
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
  // The API answers a cursor whenever it returned any row at all, so a short
  // page would still offer a 다음 that leads nowhere. Fewer rows than were
  // asked for is the end of the trail.
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-muted-foreground mr-1">빠른 필터:</span>
          <Button asChild variant={filters.outcome === "" && filters.feature === "" ? "default" : "outline"} size="xs" className="h-7 text-xs">
            <Link href="/admin/logs">전체</Link>
          </Button>
          <Button asChild variant={filters.outcome === "success" ? "default" : "outline"} size="xs" className="h-7 text-xs">
            <Link href="/admin/logs?outcome=success">성공만</Link>
          </Button>
          <Button asChild variant={filters.outcome === "failure" ? "destructive" : "outline"} size="xs" className="h-7 text-xs">
            <Link href="/admin/logs?outcome=failure">실패만</Link>
          </Button>
          <Button asChild variant={filters.feature === "security" ? "default" : "outline"} size="xs" className="h-7 text-xs">
            <Link href="/admin/logs?feature=security">보안 감사</Link>
          </Button>
          <Button asChild variant={filters.feature === "controls" ? "default" : "outline"} size="xs" className="h-7 text-xs">
            <Link href="/admin/logs?feature=controls">기능 제어</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button asChild variant="outline" size="xs" className="h-7 text-xs">
            <Link href="/admin/logs/delivery">배달 로그</Link>
          </Button>
          <Button asChild variant="outline" size="xs" className="h-7 text-xs">
            <Link href="/admin/logs/integrity">해시 무결성</Link>
          </Button>
        </div>
      </div>
      <div className="hidden">
        <Button asChild variant="default" size="sm">
          <Link href="/admin/logs">감사 로그 (Audit Trail)</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/logs/delivery">배달 로그 (Outbox Delivery)</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/logs/integrity">원장 무결성 체인 (Hash Integrity)</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/economy">경제 원장 & 자동조정 (Economy Knobs)</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기록 검색</CardTitle>
          <CardDescription>
            비워 둔 항목은 조건에서 빠집니다. 액션은 앞부분만 적어도 그 아래 단계까지 함께
            찾습니다 — <code className="font-mono text-[0.75rem]">admin.policy</code>는{' '}
            <code className="font-mono text-[0.75rem]">admin.policy.rollback</code>도 포함합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* No client JavaScript: the browser submits the query string and
              the server reads it back, so a filtered view is a plain link. */}
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순번</TableHead>
                    <TableHead>시각</TableHead>
                    <TableHead>관리자</TableHead>
                    <TableHead>액션</TableHead>
                    <TableHead>기능</TableHead>
                    <TableHead>대상</TableHead>
                    <TableHead>결과</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>무결성 해시</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.audit_id}>
                      <TableCell className="tabular font-mono text-xs">{event.sequence}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatMoment(event.created_at)}
                      </TableCell>
                      <TableCell>
                        <Identifier value={event.actor_user_id} fallback="시스템" />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.action}</TableCell>
                      <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                        {event.feature ?? '—'}
                      </TableCell>
                      <TableCell className="text-[0.7rem] text-muted-foreground">
                        <span className="grid gap-0.5">
                          <span>{event.target_kind ?? '—'}</span>
                          <Identifier value={event.target_id} fallback="" />
                        </span>
                      </TableCell>
                      <TableCell>
                        <OutcomeBadge
                          outcome={event.outcome}
                          responseStatus={event.response_status}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                        {event.client_ip ?? '—'}
                      </TableCell>
                      <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                        <span className="grid gap-1">
                          <span>{event.integrity_hash.slice(0, 16)}…</span>
                          {event.hash_version === 1 && (
                            <Badge variant="outline" className="w-fit">
                              구버전 해시
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RevealDisclosure auditId={event.audit_id} sequence={event.sequence}>
                          <EventDetail event={event} />
                        </RevealDisclosure>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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

/**
 * A native `<select>`, not the registry's.
 *
 * `components/ui/select` is Radix, which needs hydration and posts nothing on
 * its own — the console's dialogs pair it with a hidden input. This form has
 * to submit without JavaScript, so the browser's own control is the one that
 * works.
 */
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

function OutcomeBadge({
  outcome,
  responseStatus,
}: {
  readonly outcome: string | null;
  readonly responseStatus: number | null;
}) {
  if (outcome === null && responseStatus === null) return <span>—</span>;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {outcome !== null && (
        <Badge
          variant={
            outcome === 'success' ? 'secondary' : outcome === 'failure' ? 'destructive' : 'outline'
          }
        >
          {outcome === 'success' ? '성공' : outcome === 'failure' ? '실패' : '부분'}
        </Badge>
      )}
      {responseStatus !== null && (
        <span className="tabular font-mono text-[0.7rem] text-muted-foreground">
          {responseStatus}
        </span>
      )}
    </span>
  );
}

/** A uuid, shortened to what a reader can compare, with the whole of it on hover. */
function Identifier({
  value,
  fallback,
}: {
  readonly value: string | null;
  readonly fallback: string;
}) {
  if (value === null) return <span className="text-muted-foreground">{fallback}</span>;
  return (
    <code title={value} className="font-mono text-[0.7rem] text-muted-foreground">
      {value.slice(0, 8)}…
    </code>
  );
}

/** The axes that do not earn a column, shown when a row is opened. */
function EventDetail({ event }: { readonly event: AuditSearchRow }) {
  return (
    <dl className="grid gap-1.5 rounded-xl border border-border/50 bg-background/80 p-3 text-[0.7rem]">
      <DetailRow term="감사 ID" value={event.audit_id} />
      <DetailRow term="요청 ID" value={event.request_id} />
      <DetailRow term="추적 ID" value={event.trace_id} />
      <DetailRow term="대상 회원" value={event.subject_user_id} />
      <DetailRow term="거래 ID" value={event.transaction_id} />
      <DetailRow term="세션 해시" value={event.session_hash} />
      <DetailRow term="이전 해시" value={event.previous_integrity_hash} />
      <dt className="mt-2 font-bold text-muted-foreground">기록 내용 (가려진 상태)</dt>
      <dd className="mt-1">
        <pre className="max-h-60 overflow-auto rounded-lg border border-border/40 bg-muted/50 p-2.5 whitespace-pre-wrap break-all font-mono text-[0.7rem] leading-relaxed">
          {JSON.stringify({ context: event.context, metadata: event.metadata }, null, 2)}
        </pre>
      </dd>
    </dl>
  );
}

function DetailRow({ term, value }: { readonly term: string; readonly value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="font-mono break-all">{value ?? '없음'}</dd>
    </div>
  );
}
