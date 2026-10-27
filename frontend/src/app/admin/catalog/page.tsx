import type { Metadata } from 'next';
import Link from 'next/link';
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
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { NewSeasonEventForm, ToggleActive } from '../admin-forms';
import { parseBusinessCatalog, parseSeasonCatalog } from './catalog-evidence';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/catalog');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminCatalogPage() {
  await requireAdminConsole(AREA.href);
  const [businessPayload, seasonPayload] = await Promise.all([
    apiOrNull<unknown>('/api/v1/admin/business-types'),
    apiOrNull<unknown>('/api/v1/admin/season-events'),
  ]);
  const businesses = parseBusinessCatalog(businessPayload);
  const events = parseSeasonCatalog(seasonPayload);

  return (
    <div data-page="admin-catalog" className="mv-page mv-page--admin grid gap-5">
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
              <div role="alert" className="grid gap-3">
                <EmptyState title="사업 목록을 확인하지 못했어요. 데이터가 유효하지 않거나 서버에 연결할 수 없습니다." />
                <Link href="/admin/catalog" className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">사업 목록 다시 조회</Link>
              </div>
            ) : businesses.length === 0 ? (
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
                    {businesses.map((business) => (
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
            {events !== null ? <NewSeasonEventForm /> : null}
            {events === null ? (
              <div role="alert" className="grid gap-3">
                <EmptyState title="시즌 이벤트를 확인하지 못했어요. 등록 및 변경은 확인 후 다시 시도해 주세요." />
                <Link href="/admin/catalog" className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">시즌 이벤트 다시 조회</Link>
              </div>
            ) : events.length === 0 ? (
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
                    {events.map((event) => (
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
