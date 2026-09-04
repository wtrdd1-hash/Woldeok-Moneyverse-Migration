import type { Metadata } from 'next';
import { AdminBack } from '../admin-back';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { adminArea } from '../areas';
import type { AdminUser } from '../types';
import { UserDirectory } from './user-directory';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/users');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  await requireAdminConsole(AREA.href);
  const users = await apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users');

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>
      <p className="text-sm text-muted-foreground">
        사용자를 검색해 상세 화면에서 활동 로그, 이용 제한, 로그인 세션을 함께 관리할 수 있습니다.
      </p>
      {users === null ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState title="사용자 목록을 불러오지 못했어요." />
          </CardContent>
        </Card>
      ) : users.users.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState title="표시할 사용자가 없습니다." />
          </CardContent>
        </Card>
      ) : (
        <UserDirectory users={users.users} />
      )}
    </div>
  );
}
