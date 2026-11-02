import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Clock3, RotateCcw, Send, TriangleAlert } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import { parseDeliveryEvidence } from './delivery-evidence';
import { filterDeliveryEvents, parseDeliveryFilter } from './delivery-filter';
import { LogsSubNav } from '../logs-sub-nav';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Discord 전달 로그',
  robots: { index: false, follow: false },
};

export default async function AdminDeliveryLogsPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ readonly status?: string | string[]; readonly event?: string | string[] }>;
} = {}) {
  await requireAdminConsole('/admin/logs/delivery');
  const filter = parseDeliveryFilter(await (searchParams ?? Promise.resolve({})));
  const response = await apiOrNull<unknown>(
    '/api/v1/admin/discord-outbox-events',
  );
  const outbox = parseDeliveryEvidence(response);
  const events = outbox?.events ?? [];
  const visibleEvents = filter === null ? [] : filterDeliveryEvents(events, filter);

  return (
    <div data-page="admin-logs-delivery" className="mv-page mv-page--admin grid gap-5">
      <AdminBack href="/admin/logs" label="감사 로그로" />
      <PageHeader eyebrow="DELIVERY LOG" title="Discord 전달 로그">
        감사 기록과 분리해 최근 최대 30건의 알림 전달 상태만 확인합니다. 전체 기간의 전달률이나 서비스 가동률은 아닙니다.
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <LogsSubNav current="delivery" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DeliverySummary icon={Send} label="최근 기록" value={outbox === null ? '조회 불가' : `${events.length}건`} />
        <DeliverySummary icon={CheckCircle2} label="전달 완료" value={outbox === null ? '조회 불가' : `${outbox.delivered}건`} />
        <DeliverySummary
          icon={outbox !== null && outbox.outstanding > 0 ? TriangleAlert : RotateCcw}
          label="진행 중 · 재시도 이력"
          value={outbox === null ? '조회 불가' : `${outbox.outstanding}건 · ${outbox.retried}건`}
          attention={outbox !== null && outbox.outstanding > 0}
        />
        <DeliverySummary
          icon={TriangleAlert}
          label="보류·실패 (전달 제외·최종 실패)"
          value={outbox === null ? '조회 불가' : `${outbox.terminal}건`}
          attention={outbox !== null && outbox.terminal > 0}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">최근 최대 30건 전달 내역</CardTitle>
              <CardDescription className="mt-1">
                PostgreSQL의 최근 이벤트 상태입니다. 전체 전달 내역이나 실제 Discord 수신 확인을 보증하지 않습니다.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="min-h-11">
              <Link href="/admin/discord">전달 경로 설정 보기</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {outbox !== null && filter !== null ? (
            <form method="get" action="/admin/logs/delivery" role="search" aria-label="전달 기록 검색" className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end">
              <div className="grid min-w-0 gap-1">
                <label htmlFor="delivery-status" className="text-sm font-medium">전달 상태</label>
                <select id="delivery-status" name="status" defaultValue={filter.status} className="min-h-11 w-full min-w-0 rounded-md border bg-background px-3 text-sm">
                  <option value="all">전체 상태</option>
                  <option value="outstanding">진행 중·재시도 대기</option>
                  <option value="terminal">전달 제외·최종 실패</option>
                  <option value="delivered">전달 완료</option>
                  <option value="retried">재시도 이력 (2회 이상)</option>
                </select>
              </div>
              <div className="grid min-w-0 gap-1">
                <label htmlFor="delivery-event" className="text-sm font-medium">사건 유형 검색</label>
                <Input id="delivery-event" name="event" type="search" maxLength={64} defaultValue={filter.event} placeholder="wallet.deposit" autoComplete="off" className="min-h-11 min-w-0" />
              </div>
              <Button type="submit" className="min-h-11">검색</Button>
              <Button asChild variant="outline" className="min-h-11"><Link href="/admin/logs/delivery">필터 초기화</Link></Button>
            </form>
          ) : null}
          {outbox !== null && filter !== null ? (
            <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
              검색 결과 {visibleEvents.length}건 / 최근 {events.length}건 (최대 30건 조회 범위, 전체 전달 이력 아님)
            </p>
          ) : null}
          {outbox === null ? (
            <div role="alert" aria-live="polite" className="grid gap-3">
              <EmptyState title="Discord 전달 현황 조회 불가" description="API 응답을 확인할 수 없어 전달 건수와 상태를 표시하지 않습니다." />
              <Button asChild variant="outline" className="min-h-11 w-full sm:w-fit">
                <Link href="/admin/logs/delivery">다시 조회</Link>
              </Button>
            </div>
          ) : filter === null ? (
            <div role="alert" className="grid gap-3 rounded-lg border border-destructive/40 p-4">
              <p>잘못된 검색 조건입니다. 상태와 사건 유형을 확인해 주세요.</p>
              <Button asChild variant="outline" className="min-h-11 w-full sm:w-fit"><Link href="/admin/logs/delivery">필터 초기화</Link></Button>
            </div>
          ) : events.length === 0 ? (
            <EmptyState title="전달 기록이 없습니다." />
          ) : visibleEvents.length === 0 ? (
            <EmptyState title="조건에 맞는 전달 기록이 없습니다." description="최근 최대 30건 내에서 다른 조건을 선택하거나 필터를 초기화해 주세요." />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <caption className="sr-only">최근 최대 30건에서 검색 조건에 맞는 Discord 전달 이벤트</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead>시각</TableHead>
                    <TableHead>사건 유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">전달 시도</TableHead>
                    <TableHead>완료 시각</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleEvents.map((event) => (
                    <TableRow key={event.event_id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatMoment(event.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.event_type}</TableCell>
                      <TableCell>
                        <DeliveryStatus status={event.delivery_status} />
                      </TableCell>
                      <TableCell className="tabular text-right">{event.delivery_attempts}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {event.delivered_at ? formatMoment(event.delivered_at) : ['suppressed', 'dead_letter'].includes(event.delivery_status) ? '해당 없음' : '대기 중'}
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

function DeliverySummary({
  icon: Icon,
  label,
  value,
  attention = false,
}: {
  readonly icon: typeof Send;
  readonly label: string;
  readonly value: string;
  readonly attention?: boolean;
}) {
  return (
    <Card className={attention ? 'border-clay bg-clay-soft/20' : undefined}>
      <CardContent className="flex items-center gap-3 py-5">
        <Icon className={`size-5 ${attention ? 'text-clay' : 'text-primary'}`} />
        <span className="grid gap-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <strong className="text-xl tabular">{value}</strong>
        </span>
      </CardContent>
    </Card>
  );
}

function DeliveryStatus({ status }: { readonly status: string }) {
  const complete = status === 'delivered';
  const terminal = status === 'suppressed' || status === 'dead_letter';
  return (
    <Badge variant={complete ? 'secondary' : 'outline'}>
      {complete ? <CheckCircle2 className="size-3" /> : terminal ? <TriangleAlert className="size-3" /> : <Clock3 className="size-3" />}
      {complete ? '전달 완료' : status === 'suppressed' ? '전달 제외' : status === 'dead_letter' ? '최종 실패' : status === 'retry_pending' ? '재시도 대기' : status === 'delivering' ? '전달 중' : '대기 중'}
    </Badge>
  );
}
