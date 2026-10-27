import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Activity } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { getServerLocale } from '@/lib/locale-server';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import { SeoClientView, type SeoInitialData } from './seo-client-view';
import { parseSeoObservation } from './seo-observation';
import { SeoFunnelCard } from './seo-funnel-card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SEO 및 검색엔진 색인 관제 — 관리자',
  description: 'Google Search Console, Naver Search Advisor, IndexNow 사이트맵 제출 및 10대 가상 주식, 5대 가이드 실시간 봇 크롤링 현황 모니터링.',
  robots: { index: false, follow: false },
};

async function fetchSeoData(): Promise<SeoInitialData | null> {
  try {
    const response = await api<unknown>('/api/v1/seo/status/admin');
    return parseSeoObservation(response, new Date().toISOString());
  } catch {
    // A public aggregate cannot prove administrator-only crawler observations.
    return null;
  }
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

      <nav aria-label="SEO administrator sections" className="min-w-0 border-b border-border/60">
        <div className="grid grid-cols-1 gap-1 sm:flex sm:flex-wrap sm:gap-2">
          <Link
            href="/admin/seo"
            className="inline-flex min-h-[44px] min-w-0 items-center gap-2 whitespace-normal break-keep border-b-2 border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors" aria-current="page"
          >
            <Globe className="size-4" />
            {locale === 'en' ? 'Crawler activity & status' : locale === 'ja' ? 'クローラー履歴・状態' : locale === 'zh' ? '抓取日志与状态' : '실시간 수집 로그 & 상태'}
          </Link>
          <Link
            href="/admin/seo-audit"
            className="inline-flex min-h-[44px] min-w-0 items-center gap-2 whitespace-normal break-keep border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Activity className="size-4" />
            {locale === 'en' ? 'Crawler audit' : locale === 'ja' ? 'クロール監査' : locale === 'zh' ? '抓取审计' : '크롤러 수집 감사 타워'}
          </Link>
        </div>
      </nav>

      <SeoFunnelCard />

      {initialData ? (
        <SeoClientView initialData={initialData} initialNowMs={initialNowMs} />
      ) : (
        <div role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-700 dark:text-amber-300">
          <p>관리자 SEO 데이터를 불러올 수 없습니다. 권한 및 서버 연결을 확인해 주세요. 관측값은 표시하지 않습니다.</p>
          <Link href="/admin/seo?retry=1" className="mt-3 inline-flex min-h-[44px] items-center rounded-lg border border-current px-4 py-2 font-semibold">
            다시 조회
          </Link>
        </div>
      )}
    </div>
  );
}