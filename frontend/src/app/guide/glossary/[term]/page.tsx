import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Calculator, TrendingUp, CheckCircle2, ShieldCheck, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, buildOgImageUrl, breadcrumbJsonLd } from '@/lib/seo';
import { getServerLocale } from '@/lib/locale-server';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { GLOSSARY_TERMS, GlossaryTerm } from '@/config/pseo-glossary.config';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';

export const revalidate = 86400; // 24시간 정적 캐싱

interface PageProps {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  return GLOSSARY_TERMS.map((item) => ({
    term: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { term } = await params;
  const item = GLOSSARY_TERMS.find((t) => t.slug === term);

  if (!item) {
    return {
      title: '용어를 찾을 수 없습니다 | 월덕 머니버스',
    };
  }

  const url = canonicalUrl(`/guide/glossary/${item.slug}`);
  const title = `${item.termKo} 완벽 해설 & 실전 투자 공식 | 금융 용어사전`;
  const description = `${item.termKo} (${item.termEn}) 정의, 계산 공식, 실전 투자 팁 및 위험 관리 가이드. ${item.formula ? `공식: ${item.formula}.` : ''} 초보자도 쉽게 이해하는 핵심 재테크 사전.`;

  const ogImageUrl = buildOgImageUrl({
    title: item.termKo,
    description: item.keyTakeawayKo,
    type: 'default',
    badge: '투자 백과사전',
  });

  return {
    title,
    description,
    keywords: [
      item.termKo,
      item.termEn,
      item.termJa,
      item.termZh,
      `${item.termKo} 뜻`,
      `${item.termKo} 계산법`,
      `${item.termKo} 공식`,
      '금융 용어사전',
      '주식 용어 정리',
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
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: item.termKo }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function GlossaryDetailPage({ params }: PageProps) {
  const { term } = await params;
  const item = GLOSSARY_TERMS.find((t) => t.slug === term);

  if (!item) {
    notFound();
  }

  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '가이드 허브', path: '/guide' },
    { name: '금융 용어사전', path: '/guide/glossary' },
    { name: item.termKo, path: `/guide/glossary/${item.slug}` },
  ]);

  const definedTermJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: item.termKo,
    alternateName: [item.termEn, item.termJa, item.termZh],
    description: item.descriptionKo,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: '월덕 머니버스 글로벌 금융 투자 용어사전',
      url: canonicalUrl('/guide/glossary'),
    },
  };

  // 연관 다른 용어 3개 추천
  const otherTerms = GLOSSARY_TERMS.filter((t) => t.slug !== item.slug).slice(0, 3);

  return (
    <div className="mv-page mv-page--public min-h-screen py-8 px-4 sm:px-6">
      <DesktopStickyAdRails />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/guide/glossary">
              <ArrowLeft className="size-4 mr-1.5" />
              용어사전 목록으로
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono uppercase bg-primary/5 text-primary border-primary/20">
              {item.category}
            </Badge>
          </div>
        </div>

        {/* 헤더 섹션 */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-mono">
              <span>FINANCIAL GLOSSARY</span>
              <span>•</span>
              <span className="text-primary font-medium">{item.slug.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              {item.termKo}
            </h1>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-medium">🇺🇸 {item.termEn}</span>
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-medium">🇯🇵 {item.termJa}</span>
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-medium">🇨🇳 {item.termZh}</span>
            </div>
          </div>
        </div>

        {/* 최상단 AdSense 광고 슬롯 (High RPM Hero Banner) */}
        <InArticleAdvertisement className="my-2" />

        {/* 핵심 요약 & 핵심 시사점 박스 */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                핵심 체크 포인트 (Key Takeaway)
              </h3>
              <p className="text-sm text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                {item.keyTakeawayKo}
              </p>
            </div>
          </div>
        </div>

        {/* 본문 상세 설명 카드 */}
        <Card className="border-border/80 bg-card/80 shadow-sm">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="size-5 text-primary" />
              상세 개념 및 원리
            </CardTitle>
            <CardDescription className="text-xs">
              투자자가 반드시 숙지해야 할 기본 원리와 해석법
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-3 space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <p className="text-base font-normal leading-relaxed">{item.descriptionKo}</p>

            {/* 영어 해설 토글/블록 */}
            <div className="mt-4 pt-4 border-t border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Global English Summary
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{item.descriptionEn}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 공식(Formula) 카드 */}
        {item.formula && (
          <Card className="border-border/80 bg-card/80 shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Calculator className="size-5 text-indigo-500" />
                핵심 계산 공식 & 메커니즘
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-sm sm:text-base border border-zinc-800 shadow-inner overflow-x-auto">
                <code>{item.formula}</code>
              </div>
              {item.formulaDescriptionKo && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  💡 {item.formulaDescriptionKo}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 연관 계산기 브릿지 카드 */}
        {item.relatedCalculatorUrl && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-semibold text-primary uppercase">직접 시뮬레이션해보기</span>
              <h4 className="text-base font-bold text-foreground">
                {item.relatedCalculatorLabelKo || '연관 금융 계산기 실행하기'}
              </h4>
              <p className="text-xs text-muted-foreground">
                복잡한 수식 계산 없이 입력값만 넣으면 즉시 세후 수익과 결과를 산출합니다.
              </p>
            </div>
            <Button asChild className="shrink-0 w-full sm:w-auto font-medium">
              <Link href={item.relatedCalculatorUrl}>
                계산기 실행하기
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* 포트폴리오 저장 / 회원 전환 브릿지 액션 */}
        <CalculatorSaveAction
          scenario={{
            type: 'stock',
            title: `금융 용어: ${item.termKo}`,
            badge: item.category.toUpperCase(),
            primaryMetric: {
              label: '핵심 지표',
              value: item.termKo.split(' ')[0] || item.slug.toUpperCase(),
            },
            ...(item.formula
              ? {
                  secondaryMetric: {
                    label: '공식',
                    value: item.formula,
                  },
                }
              : {}),
            details: {
              slug: item.slug,
              category: item.category,
              takeaway: item.keyTakeawayKo,
            },
            sourceUrl: `/guide/glossary/${item.slug}`,
          }}
        />



        {/* 중간 AdSense 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 다른 추천 용어 둘러보기 */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-foreground">함께 공부하면 좋은 연관 용어</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherTerms.map((other) => (
              <Link
                key={other.slug}
                href={`/guide/glossary/${other.slug}`}
                className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {other.category}
                  </Badge>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {other.termKo}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {other.keyTakeawayKo}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* 하단 푸터 네비게이션 */}
        <div className="text-center pt-8 border-t border-border/60">
          <Button asChild variant="outline" size="sm">
            <Link href="/guide/glossary">
              <BookOpen className="size-4 mr-1.5" />
              50대 전체 금융 용어사전 보러가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
