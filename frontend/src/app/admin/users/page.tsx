import type { Metadata } from 'next';
import { AdminBack } from '../admin-back';
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
import { requireAdministrator } from '@/lib/session';
import { adminArea } from '../areas';
import type { AdminUser } from '../types';
import { RestrictionDialog } from '../admin-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/users');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  await requireAdministrator();
  const users = await apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users');

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">사용자 제한 관리</CardTitle>
            <CardDescription>
              제한과 해제 모두 사유가 필요하고, 최근 본인 확인을 요구합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users === null ? (
              <EmptyState title="사용자 목록을 불러오지 못했어요." />
            ) : users.users.length === 0 ? (
              <EmptyState title="표시할 사용자가 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>표시 이름</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>사유</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.users.map((user) => {
                      const restricted = user.restricted_at !== null;
                      return (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <span className="block">{user.display_name}</span>
                            <code className="font-mono text-[0.7rem] text-muted-foreground">
                              {user.user_id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={restricted ? 'destructive' : 'secondary'}>
                              {restricted ? '제한됨' : user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-56 text-xs text-muted-foreground">
                            {user.restriction_reason ?? '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <RestrictionDialog
                              userId={user.user_id}
                              displayName={user.display_name}
                              restricted={restricted}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
