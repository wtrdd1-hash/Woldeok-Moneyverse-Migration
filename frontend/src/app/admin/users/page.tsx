import type { Metadata } from 'next';
import { AdminBack } from '../admin-back';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { getServerLocale } from '@/lib/locale-server';
import { adminArea, areaSummary, areaTitle } from '../areas';
import { copyText } from '../admin-copy';
import { ADMIN_USERS_COPY } from './copy';
import { parseAdminUserSnapshot } from './user-directory-evidence';
import { UserDirectory } from './user-directory';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/users');

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: areaTitle(AREA, await getServerLocale()),
    robots: { index: false, follow: false },
  };
}

export default async function AdminUsersPage() {
  await requireAdminConsole(AREA.href);
  const users = parseAdminUserSnapshot(await apiOrNull<unknown>('/api/v1/admin/users'));
  const locale = await getServerLocale();
  const t = (key: keyof typeof ADMIN_USERS_COPY) => copyText(locale, ADMIN_USERS_COPY[key]);

  return (
    <div data-page="admin-users" className="mv-page mv-page--admin grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={areaTitle(AREA, locale)}>
        {areaSummary(AREA, locale)}
      </PageHeader>
      <p className="text-sm text-muted-foreground">
        {t('pageIntro')}
      </p>
      {users === null ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState title={t('pageUnavailable')} />
          </CardContent>
        </Card>
      ) : users.users.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState title={t('pageEmpty')} />
          </CardContent>
        </Card>
      ) : (
        <UserDirectory users={users.users} scope={users.scope} />
      )}
    </div>
  );
}
