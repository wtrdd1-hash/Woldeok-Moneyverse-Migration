import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Clock3, RotateCcw, Send, TriangleAlert } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { OutboxEvent } from '../../types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Discord 전달 로그',
  robots: { index: false, follow: false },
};

export default async function AdminDeliveryLogsPage() {
  await requireAdminConsole();
  const outbox = await apiOrNull<{ events: OutboxEvent[] }>(
    '/api/v1/admin/discord-outbox-events',
  );
  const events = outbox?.events ?? [];
  const delivered = events.filter((event) => event.delivery_status === 'delivered').length;
  const pending = events.filter((event) => event.delivery_status !== 'delivered').length;
  const retried = events.filter((event) => event.delivery_attempts > 1).length;

  return (
    <div className="grid gap-5">
      <AdminBack href="/admin/logs" label="감사 로그로" />
      <PageHeader eyebrow="DELIVERY LOG" title="Discord 전달 로그">
        감사 기록과 분리해 알림 전달 성공 여부와 재시도 상태만 빠르게 확인합니다.
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <DeliverySummary icon={Send} label="최근 기록" value={`${events.length}건`} />
        <DeliverySummary icon={CheckCircle2} label="전달 완료" value={`${delivered}건`} />
        <DeliverySummary
          icon={pending > 0 ? TriangleAlert : RotateCcw}
          label="미완료 · 재시도"
          value={`${pending}건 · ${retried}건`}
          attention={pending > 0}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">전달 내역</CardTitle>
              <CardDescription className="mt-1">
                원장 사건이 Discord 알림으로 전달된 상태입니다. 감사 사슬과는 별도 기록입니다.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="min-h-10">
              <Link href="/admin/discord">전달 경로 설정 보기</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {outbox === null ? (
            <EmptyState title="Discord 전달 현황을 불러오지 못했어요." />
          ) : events.length === 0 ? (
            <EmptyState title="전달 기록이 없습니다." />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
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
                  {events.map((event) => (
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
                        {event.delivered_at ? formatMoment(event.delivered_at) : '대기 중'}
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
  return (
    <Badge variant={complete ? 'secondary' : 'outline'}>
      {complete ? <CheckCircle2 className="size-3" /> : <Clock3 className="size-3" />}
      {complete ? '전달 완료' : status}
    </Badge>
  );
}
