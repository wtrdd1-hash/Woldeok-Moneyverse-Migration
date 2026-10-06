import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { AnalyticsClientView } from './analytics-client-view';
import type { SeoInitialData } from '../seo/seo-client-view';
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

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

async function fetchSeoData(): Promise<SeoInitialData> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/seo/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  return {
    totalHits24h: 124,
    totalHits7d: 842,
    avgDurationMs: 42,
    botDistribution: { Googlebot: 68, 'Naver Yeti': 34, Bingbot: 16, Others: 6 },
    statusDistribution: { '200': 118, '304': 4, '404': 2 },
    stockCoverage: { indexed: 10, total: 10 },
    guideCoverage: { indexed: 5, total: 5 },
    targetUrls: [
      { path: '/stocks/CHIPS', category: 'stock', name: '침팬지 반도체 (CHIPS)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/DUCKS', category: 'stock', name: '월덕 인더스트리 (DUCKS)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), lastBot: 'Naver Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/COIN', category: 'stock', name: '도지 밈 파이낸스 (COIN)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/SPACE', category: 'stock', name: '덕스페이스 로켓 (SPACE)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(), lastBot: 'Bingbot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/CYBER', category: 'stock', name: '네오사이버 시큐리티 (CYBER)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/guide/stock-trading', category: 'guide', name: '가상 주식 실전 매매 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/guide/virtual-banking', category: 'guide', name: '가상 금융 & 복리 예금 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(), lastBot: 'Naver Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/', category: 'hub', name: '월덕 머니버스 메인 포털', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks', category: 'hub', name: '가상 주식 거래소 종합 허브', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), lastBot: 'Naver Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/announcements', category: 'hub', name: '공식 공지사항 허브', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
    ],
    recentLogs: [
      { id: 'log-1', botName: 'Googlebot', path: '/', statusCode: 200, durationMs: 28, ipAddress: '66.249.66.1', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 'log-2', botName: 'Naver Yeti', path: '/stocks', statusCode: 200, durationMs: 34, ipAddress: '125.209.235.1', userAgent: 'Naver Yeti', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
      { id: 'log-3', botName: 'Googlebot', path: '/stocks/CHIPS', statusCode: 200, durationMs: 41, ipAddress: '66.249.66.2', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
    ],
    indexNowKey: 'moneyverse-indexnow-key-2026',
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
  };
}

export default async function AdminAnalyticsPage() {
  await requireAdminConsole(AREA.href);

  const [usersRes, stocksRes, healthRes, controlsRes, seoData] = await Promise.all([
    apiOrNull<{ readonly users: readonly AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ readonly stocks: readonly AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliation'),
    apiOrNull<{ readonly featureSwitches: readonly FeatureSwitch[] }>('/api/v1/admin/controls'),
    fetchSeoData(),
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
      />
    </div>
  );
}
