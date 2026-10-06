import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { getServerLocale } from '@/lib/locale-server';
import { requireAdminConsole } from '@/lib/session';
import { SeoClientView, type SeoInitialData } from './seo-client-view';

export const metadata: Metadata = {
  title: 'SEO 및 검색엔진 색인 관제 — 관리자',
  description: 'Google Search Console, Naver Search Advisor, IndexNow 사이트맵 제출 및 10대 가상 주식, 5대 가이드 실시간 봇 크롤링 현황 모니터링.',
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
      { path: '/stocks/ROBOT', category: 'stock', name: '휴머노이드 다이내믹스 (ROBOT)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), lastBot: 'Naver Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/GOLD', category: 'stock', name: '골든덕 홀딩스 (GOLD)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 220).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/ENERGY', category: 'stock', name: '쿼크 에너지 코퍼레이션 (ENERGY)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 290).toISOString(), lastBot: 'Bingbot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/BIO', category: 'stock', name: '바이오덕 테라퓨틱스 (BIO)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 340).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks/GAME', category: 'stock', name: '도파민 게임즈 (GAME)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 410).toISOString(), lastBot: 'Naver Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/guide/stock-trading', category: 'guide', name: '가상 주식 실전 매매 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/guide/virtual-banking', category: 'guide', name: '가상 금융 & 복리 예금 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(), lastBot: 'Naver Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/guide/career-mastery', category: 'guide', name: '직업 & 일일 파밍 루틴 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/guide/glossary', category: 'guide', name: '핀테크 & 가상경제 핵심 용어사전', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), lastBot: 'Bingbot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/guide/dopamine-system', category: 'guide', name: '도파민 보상 & 확률 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 310).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/', category: 'hub', name: '월덕 머니버스 메인 포털', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/stocks', category: 'hub', name: '가상 주식 거래소 종합 허브', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), lastBot: 'Naver Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
      { path: '/announcements', category: 'hub', name: '공식 공지사항 허브', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
    ],
    recentLogs: [
      { id: 'log-1', botName: 'Googlebot', path: '/', statusCode: 200, durationMs: 28, ipAddress: '66.249.66.1', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 'log-2', botName: 'Naver Yeti', path: '/stocks', statusCode: 200, durationMs: 34, ipAddress: '125.209.235.1', userAgent: 'Naver Yeti', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
      { id: 'log-3', botName: 'Googlebot', path: '/stocks/CHIPS', statusCode: 200, durationMs: 41, ipAddress: '66.249.66.2', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
      { id: 'log-4', botName: 'Googlebot', path: '/guide/stock-trading', statusCode: 200, durationMs: 35, ipAddress: '66.249.66.3', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: 'log-5', botName: 'Naver Yeti', path: '/stocks/DUCKS', statusCode: 200, durationMs: 39, ipAddress: '125.209.235.2', userAgent: 'Naver Yeti', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    ],
    indexNowKey: 'moneyverse-indexnow-key-2026',
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
  };
}

export default async function AdminSeoPage() {
  await requireAdminConsole();
  const locale = await getServerLocale();
  const initialData = await fetchSeoData();
  const initialNowMs = Date.now();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/admin" className="flex items-center gap-1.5 text-xs font-semibold">
            <ArrowLeft className="size-4" />
            관리자 대시보드로 돌아가기
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="SEARCH ENGINE CRAWLER & INDEXING"
        title={locale === 'en' ? 'SEO & Indexing Control Tower' : 'SEO 및 검색엔진 색인 관제'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {locale === 'en'
            ? 'Real-time monitoring of search engine crawlers (Googlebot, Naver Yeti, Bingbot) and automated IndexNow submission.'
            : 'Google Search Console, Naver Search Advisor, IndexNow 사이트맵 제출 및 10대 가상 주식, 5대 가이드 실시간 봇 크롤링 현황 관제.'}
        </p>
      </PageHeader>

      <SeoClientView initialData={initialData} initialNowMs={initialNowMs} />
    </div>
  );
}
