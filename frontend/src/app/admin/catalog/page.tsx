import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { requireAdministrator } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AdminBusiness, AdminSeasonEvent } from '../types';
import { NewSeasonEventForm, ToggleActive } from '../admin-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/catalog');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminCatalogPage() {
  await requireAdministrator();
  const [businesses, events] = await Promise.all([
    apiOrNull<{ businessTypes: AdminBusiness[] }>('/api/v1/admin/business-types'),
    apiOrNull<{ events: AdminSeasonEvent[] }>('/api/v1/admin/season-events'),
  ]);

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">사업 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {businesses === null ? (
              <EmptyState title="사업 목록을 불러오지 못했어요." />
            ) : businesses.businessTypes.length === 0 ? (
              <EmptyState title="등록된 사업이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>코드</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">구입 비용</TableHead>
                      <TableHead className="text-right">일 매출</TableHead>
                      <TableHead className="text-right">일 운영비</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.businessTypes.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-mono text-xs">{business.symbol}</TableCell>
                        <TableCell>{business.name}</TableCell>
                        <TableCell className="text-right">
                          <Amount value={business.purchase_cost} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Amount value={business.daily_revenue} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Amount value={business.daily_operating_cost} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ToggleActive
                            id={business.id}
                            active={business.active}
                            kind="business"
                          />
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
            <CardTitle className="text-base">시즌 이벤트 목록</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <NewSeasonEventForm />
            {events === null ? (
              <EmptyState title="시즌 이벤트를 불러오지 못했어요." />
            ) : events.events.length === 0 ? (
              <EmptyState title="등록된 시즌 이벤트가 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시즌</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead className="text-right">참가비</TableHead>
                      <TableHead className="text-right">점수</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-muted-foreground">
                          {event.season_name}
                        </TableCell>
                        <TableCell>{event.title}</TableCell>
                        <TableCell className="text-right">
                          <Amount value={event.cost_wld} />
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {event.points_per_entry}
                        </TableCell>
                        <TableCell className="text-right">
                          <ToggleActive id={event.id} active={event.active} kind="season" />
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
