import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { AnalyticsClientView } from './analytics-client-view';
import type { SeoInitialData } from '../seo/seo-client-view';
import type { ApiHealthResponse } from '../api-health/api-health-dashboard';
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

function validSeoStatus(value: unknown): value is SeoInitialData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<SeoInitialData>;
  return [data.totalHits24h, data.totalHits7d, data.avgDurationMs].every(
    (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0,
  ) && !!data.stockCoverage && !!data.guideCoverage &&
    typeof data.stockCoverage.indexed === 'number' &&
    typeof data.stockCoverage.total === 'number' &&
    typeof data.guideCoverage.indexed === 'number' &&
    typeof data.guideCoverage.total === 'number' &&
    !!data.botDistribution && !!data.statusDistribution &&
    Array.isArray(data.targetUrls) && Array.isArray(data.recentLogs);
}

async function fetchSeoData(): Promise<SeoInitialData | null> {
  // The authenticated admin endpoint, not an unauthenticated raw network fetch.
  const response = await apiOrNull<SeoInitialData>('/api/v1/seo/status/admin');
  return validSeoStatus(response) ? response : null;
}

export default async function AdminAnalyticsPage() {
  await requireAdminConsole(AREA.href);

  const [usersRes, stocksRes, healthRes, controlsRes, seoData, domainHealth] = await Promise.all([
    apiOrNull<{ readonly users: readonly AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ readonly stocks: readonly AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliation'),
    apiOrNull<{ readonly featureSwitches: readonly FeatureSwitch[] }>('/api/v1/admin/controls'),
    fetchSeoData(),
    apiOrNull<ApiHealthResponse>('/api/v1/admin/api-health/status'),
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
        seoData={seoData}
        domainHealth={domainHealth}
      />
    </div>
  );
}
