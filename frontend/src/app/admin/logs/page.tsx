import type { Metadata } from 'next';
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
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AuditEvent, OutboxEvent } from '../types';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminLogsPage() {
  await requireAdminConsole();
  const [audit, outbox] = await Promise.all([
    apiOrNull<{ events: AuditEvent[] }>('/api/v1/admin/audit-events'),
    apiOrNull<{ events: OutboxEvent[] }>('/api/v1/admin/discord-outbox-events'),
  ]);

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">운영 감사 로그</CardTitle>
            <CardDescription>
              각 항목은 앞 항목의 해시를 포함하는 사슬로 이어집니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {audit === null ? (
              <EmptyState title="감사 이벤트를 불러오지 못했어요." />
            ) : audit.events.length === 0 ? (
              <EmptyState title="기록된 감사 이벤트가 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시각</TableHead>
                      <TableHead>작업</TableHead>
                      <TableHead>대상</TableHead>
                      <TableHead>무결성 해시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.events.map((event) => (
                      <TableRow key={event.audit_id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatMoment(event.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{event.action}</TableCell>
                        <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                          {event.target_id ?? '—'}
                        </TableCell>
                        <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                          {event.integrity_hash.slice(0, 16)}…
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discord 전달 로그</CardTitle>
          </CardHeader>
          <CardContent>
            {outbox === null ? (
              <EmptyState title="Discord 전달 현황을 불러오지 못했어요." />
            ) : outbox.events.length === 0 ? (
              <EmptyState title="전달 기록이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시각</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">시도</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outbox.events.map((event) => (
                      <TableRow key={event.event_id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatMoment(event.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{event.event_type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.delivery_status === 'delivered' ? 'secondary' : 'outline'
                            }
                          >
                            {event.delivery_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {event.delivery_attempts}
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
