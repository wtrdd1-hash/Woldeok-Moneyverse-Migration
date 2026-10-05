import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { AnalyticsClientView } from './analytics-client-view';
import type {
  AdminStock,
  AdminUser,
  FeatureSwitch,
  ReconciliationHealth,
} from '../types';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/analytics');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  await requireAdminConsole(AREA.href);

  const [usersRes, stocksRes, healthRes, controlsRes] = await Promise.all([
    apiOrNull<{ readonly users: readonly AdminUser[] }>('/api/admin/users'),
    apiOrNull<{ readonly stocks: readonly AdminStock[] }>('/api/admin/stocks'),
    apiOrNull<ReconciliationHealth>('/api/admin/economy/reconciliation'),
    apiOrNull<{ readonly featureSwitches: readonly FeatureSwitch[] }>('/api/admin/controls'),
  ]);

  const allUsers = usersRes?.users ?? [];
  const stocksList = stocksRes?.stocks ?? [];
  const health = healthRes ?? null;
  const controls = controlsRes?.featureSwitches ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      <AnalyticsClientView
        users={allUsers}
        stocks={stocksList}
        health={health}
        controls={controls}
      />
    </div>
  );
}
