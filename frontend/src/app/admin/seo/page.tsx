import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Activity } from 'lucide-react';
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
    totalHits24h: 0,
    totalHits7d: 0,
    avgDurationMs: 0,
    botDistribution: { Googlebot: 0, 'Naver Yeti': 0, Bingbot: 0, Others: 0 },
    statusDistribution: { '200': 0, '304': 0, '404': 0 },
    stockCoverage: { indexed: 0, total: 10 },
    guideCoverage: { indexed: 0, total: 5 },
    targetUrls: [
      { path: '/stocks/CHIPS', category: 'stock', name: '침팬지 반도체 (CHIPS)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/DUCKS', category: 'stock', name: '월덕 인더스트리 (DUCKS)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/COIN', category: 'stock', name: '도지 밈 파이낸스 (COIN)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/SPACE', category: 'stock', name: '덕스페이스 로켓 (SPACE)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/CYBER', category: 'stock', name: '네오사이버 시큐리티 (CYBER)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/ROBOT', category: 'stock', name: '휴머노이드 다이내믹스 (ROBOT)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/GOLD', category: 'stock', name: '골든덕 홀딩스 (GOLD)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/ENERGY', category: 'stock', name: '쿼크 에너지 코퍼레이션 (ENERGY)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/BIO', category: 'stock', name: '바이오덕 테라퓨틱스 (BIO)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks/GAME', category: 'stock', name: '도파민 게임즈 (GAME)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/guide/stock-trading', category: 'guide', name: '가상 주식 실전 매매 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/guide/virtual-banking', category: 'guide', name: '가상 금융 & 복리 예금 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/guide/career-mastery', category: 'guide', name: '직업 & 일일 파밍 루틴 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/guide/glossary', category: 'guide', name: '핀테크 & 가상경제 핵심 용어사전', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/guide/dopamine-system', category: 'guide', name: '도파민 보상 & 확률 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/', category: 'hub', name: '월덕 머니버스 메인 포털', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/stocks', category: 'hub', name: '가상 주식 거래소 종합 허브', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      { path: '/announcements', category: 'hub', name: '공식 공지사항 허브', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
    ],
    recentLogs: [],
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

      <div className="flex border-b border-border/60">
        <div className="flex gap-2">
          <Link
            href="/admin/seo"
            className="flex items-center gap-2 border-b-2 border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors"
          >
            <Globe className="size-4" />
            실시간 수집 로그 & 상태
          </Link>
          <Link
            href="/admin/seo-audit"
            className="flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Activity className="size-4" />
            크롤러 수집 감사 타워
          </Link>
        </div>
      </div>

      <SeoClientView initialData={initialData} initialNowMs={initialNowMs} />
    </div>
  );
}
