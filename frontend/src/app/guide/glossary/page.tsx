import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Search, HelpCircle, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, buildOgImageUrl, breadcrumbJsonLd } from '@/lib/seo';
import { getServerLocale } from '@/lib/locale-server';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '@/config/pseo-glossary.config';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';
import { SearchAutocompletePopover } from '@/components/search-autocomplete-popover';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/guide/glossary');
  const ogImageUrl = buildOgImageUrl({
    title: '글로벌 50대 투자 & 금융 용어사전',
    description: 'PER, PBR, ROE, 배당락일, 금융소득종합과세 등 50대 실전 금융 개념과 공식 완벽 정리.',
    type: 'default',
    badge: '금융 백과사전',
  });

  return {
    title: '50대 핵심 투자 & 금융 용어사전 — 월덕 머니버스',
    description: '주식 밸류에이션(PER·PBR·ROE), 배당락일 및 배당소득세, 물타기 평단가 계산, 공매도·숏스퀴즈, 거시경제 금리 지표까지 50대 핵심 재테크 개념과 실전 공식을 한눈에 확인하세요.',
    keywords: [
      '금융 용어사전',
      '주식 용어 정리',
      'PER 뜻',
      'PBR 뜻',
      'ROE 계산',
      '배당락일 뜻',
      '배당소득세율',
      '금융소득종합과세 기준',
      '물타기 뜻',
      '재테크 용어',
    ],
    alternates: {
      canonical: url,
      languages: {
        ko: url,
        en: url,
        ja: url,
        zh: url,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: '50대 핵심 투자 & 금융 용어사전 | 월덕 머니버스',
      description: '실전 주식 투자와 절세, 배당 전략을 위한 50대 핵심 금융 용어와 계산 공식 총정리',
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function GlossaryPage() {
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '가이드 허브', path: '/guide' },
    { name: '금융 용어사전', path: '/guide/glossary' },
  ]);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GLOSSARY_TERMS.slice(0, 20).map((item) => ({
      '@type': 'Question',
      name: `${item.termKo} (${item.termEn})`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${item.descriptionKo} ${item.formula ? `공식: ${item.formula}` : ''}`,
      },
    })),
  };

  return (
    <div data-page="guide-glossary" className="mv-page mv-page--public min-h-screen py-8 px-4 sm:px-6">
      <DesktopStickyAdRails />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
          <Link href="/guide">
            <ArrowLeft className="size-4 mr-1.5" />
            {isEn ? 'Back to guides' : '가이드 센터로 돌아가기'}
          </Link>
        </Button>

        <PageHeader
          eyebrow="GLOBAL FINANCIAL GLOSSARY"
          title={isEn ? '50 Essential Investment & Finance Terms' : '50대 핵심 실전 투자 & 금융 용어사전'}
        >
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            {isEn
              ? 'Comprehensive definitions, formulas, and actionable strategies for 50 essential finance terms covering Valuation, Dividends, Taxes, and Trading.'
              : '주식 가치평가(PER·PBR·ROE)부터 배당락일, 금융소득종합과세, 물타기 평단가 공식까지 실전 투자와 절세를 위한 50대 핵심 지표를 완벽 정리했습니다.'}
          </p>
        </PageHeader>

        {/* 상단 통계 하이라이트 바 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">총 수록 용어</span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground mt-0.5">50개</div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">지원 글로벌 언어</span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground mt-0.5">4개 국어</div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">연계 계산기 도구</span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground mt-0.5">4종 웹앱</div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">구글 검색 색인</span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">100% 정적 생성</div>
          </div>
        </div>

        {/* 실시간 금융 용어 & 계산기 자동완성 검색창 */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              실시간 스마트 검색 & 바로가기
            </span>
            <span className="text-[11px] text-muted-foreground">50대 용어 • 580개 주식 • 배당/대출 계산기 통합</span>
          </div>
          <SearchAutocompletePopover placeholder="금융 용어(PER, ROE...), 주식(삼성전자, 애플...), 배당주, 대출이자 검색..." />
        </div>

        {/* 최상단 AdSense 광고 */}
        <InArticleAdvertisement className="my-2" />

        {/* 50대 용어 카드 그리드 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              전체 용어 백과사전 목차
            </h3>
            <span className="text-xs text-muted-foreground font-mono">50 Terms Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {GLOSSARY_TERMS.map((item, index) => (
              <React.Fragment key={item.slug}>
                <Link
                  href={`/guide/glossary/${item.slug}`}
                  className="group rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 p-4 sm:p-5 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono bg-zinc-100 dark:bg-zinc-800">
                        {item.category}
                      </Badge>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.termKo}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {item.termEn}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.descriptionKo}
                    </p>
                  </div>

                  {item.formula && (
                    <div className="mt-3 pt-2.5 border-t border-border/50 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {item.formula}
                    </div>
                  )}
                </Link>

                {/* 중간 6번째, 20번째에 AdSense 인아티클 광고 배치 */}
                {index === 5 && (
                  <div className="md:col-span-2 my-2">
                    <InArticleAdvertisement />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 하단 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 초보자 가이드 연결 배너 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <div>
            <h4 className="font-bold text-base text-foreground">
              {isEn ? 'Looking for interactive calculators?' : '직접 계산해볼 수 있는 웹 도구가 필요하신가요?'}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isEn
                ? 'Check out our escape price, dividend tax, and compound interest calculators.'
                : '물타기 본전 탈출 계산기, 배당소득세 계산기, 대출이자 계산기를 무료로 실행해보세요.'}
            </p>
          </div>
          <Button asChild className="shrink-0 w-full sm:w-auto">
            <Link href="/tools">
              <Sparkles className="size-4 mr-1.5" />
              금융 계산기 허브 바로가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
