import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { AnalyticsClientView } from './analytics-client-view';
import { parseAnalyticsApiHealth, parseAnalyticsSeo } from './analytics-evidence';
import type {
  AdminStock,
  AdminUser,
} from '../types';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/analytics');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  await requireAdminConsole(AREA.href);

  const [usersRes, stocksRes, seoRes, apiHealthRes] = await Promise.all([
    apiOrNull<{ readonly users: readonly AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ readonly stocks: readonly AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<unknown>('/api/v1/seo/status/admin'),
    apiOrNull<unknown>('/api/v1/admin/api-health/status'),
  ]);

  const allUsers = usersRes?.users ?? [];
  const stocksList = stocksRes?.stocks ?? [];
  const seoData = parseAnalyticsSeo(seoRes);
  const apiDomains = parseAnalyticsApiHealth(apiHealthRes);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      <AnalyticsClientView
        users={allUsers}
        stocks={stocksList}
        seoData={seoData}
        apiDomains={apiDomains}
        usersAvailable={Array.isArray(usersRes?.users)}
      />
    </div>
  );
}
