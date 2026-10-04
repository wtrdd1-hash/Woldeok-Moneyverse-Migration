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
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { GLOSSARY_TERMS, GlossaryTerm } from '@/config/pseo-glossary.config';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';
import { Locale, isLocale } from '@/lib/locale';

export const revalidate = 86400; // 24시간 정적 캐싱

interface PageProps {
  params: Promise<{ locale: string; term: string }>;
}

const SUPPORTED_LOCALES: Locale[] = ['en', 'ja', 'zh'];

export async function generateStaticParams() {
  const params: { locale: string; term: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const item of GLOSSARY_TERMS) {
      params.push({
        locale,
        term: item.slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, term } = await params;
  if (!isLocale(locale) || locale === 'ko') {
    return {};
  }

  const item = GLOSSARY_TERMS.find((t) => t.slug === term);
  if (!item) {
    return { title: 'Term Not Found' };
  }

  const url = canonicalUrl(`/${locale}/guide/glossary/${item.slug}`);

  let title = '';
  let description = '';
  let termName = '';

  if (locale === 'en') {
    termName = item.termEn;
    title = `${item.termEn} Definition, Formula & Guide | Finance Glossary`;
    description = `${item.termEn} (${item.termKo}) explained simply. Formula: ${item.formula || 'N/A'}. Key takeaways, calculation principles, and practical investment strategy.`;
  } else if (locale === 'ja') {
    termName = item.termJa;
    title = `${item.termJa}とは？ 計算式と実戦投資ガイド | 金融用語辞典`;
    description = `${item.termJa}（${item.termEn}）の基礎知識と計算式をわかりやすく解説。${item.formula ? `計算式: ${item.formula}。` : ''} 株式投資や資産形成に役立つ重要ポイント。`;
  } else if (locale === 'zh') {
    termName = item.termZh;
    title = `${item.termZh} 是什么意思？计算公式与实战指南 | 金融词典`;
    description = `${item.termZh}（${item.termEn}）详细通俗解析。计算公式：${item.formula || '无'}。掌握核心估值与投资策略，轻松看懂财报与股市。`;
  }

  const ogImageUrl = buildOgImageUrl({
    title: termName,
    description: locale === 'en' ? item.keyTakeawayEn : item.keyTakeawayKo,
    type: 'default',
    badge: 'Finance Glossary',
  });

  return {
    title,
    description,
    keywords: [
      item.termEn,
      item.termJa,
      item.termZh,
      item.termKo,
      `${termName} definition`,
      `${termName} formula`,
      'financial glossary',
      'stock terms',
    ],
    alternates: {
      canonical: url,
      languages: {
        ko: canonicalUrl(`/guide/glossary/${item.slug}`),
        en: canonicalUrl(`/en/guide/glossary/${item.slug}`),
        ja: canonicalUrl(`/ja/guide/glossary/${item.slug}`),
        zh: canonicalUrl(`/zh/guide/glossary/${item.slug}`),
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
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: termName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocalizedGlossaryDetailPage({ params }: PageProps) {
  const { locale, term } = await params;
  if (!isLocale(locale) || locale === 'ko') {
    notFound();
  }

  const item = GLOSSARY_TERMS.find((t) => t.slug === term);
  if (!item) {
    notFound();
  }

  const isEn = locale === 'en';
  const isJa = locale === 'ja';
  const isZh = locale === 'zh';

  const localizedTermName = isEn ? item.termEn : isJa ? item.termJa : item.termZh;
  const localizedDescription = isEn ? item.descriptionEn : isJa ? item.descriptionJa : item.descriptionZh;
  const localizedKeyTakeaway = isEn ? item.keyTakeawayEn : item.keyTakeawayKo;

  const breadcrumbs = breadcrumbJsonLd([
    { name: isEn ? 'Home' : isJa ? 'ホーム' : '首页', path: `/${locale}` },
    { name: isEn ? 'Guides' : isJa ? 'ガイド' : '指南', path: `/${locale}/guide` },
    { name: isEn ? 'Glossary' : isJa ? '用語辞典' : '金融词典', path: `/${locale}/guide/glossary` },
    { name: localizedTermName, path: `/${locale}/guide/glossary/${item.slug}` },
  ]);

  const definedTermJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: localizedTermName,
    alternateName: [item.termEn, item.termJa, item.termZh, item.termKo],
    description: localizedDescription,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Woldeok Moneyverse Global Financial Glossary',
      url: canonicalUrl(`/${locale}/guide/glossary`),
    },
  };

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
            <Link href={`/${locale}/guide/glossary`}>
              <ArrowLeft className="size-4 mr-1.5" />
              {isEn ? 'Back to Glossary' : isJa ? '用語辞典に戻る' : '返回词典列表'}
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
              {localizedTermName}
            </h1>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-medium">🇰🇷 {item.termKo}</span>
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-medium">🇺🇸 {item.termEn}</span>
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-medium">🇯🇵 {item.termJa}</span>
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-medium">🇨🇳 {item.termZh}</span>
            </div>
          </div>
        </div>

        {/* 최상단 AdSense 광고 슬롯 */}
        <InArticleAdvertisement className="my-2" />

        {/* 핵심 요약 & 시사점 박스 */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {isEn ? 'Key Takeaway' : isJa ? '重要チェックポイント' : '核心重点笔记'}
              </h3>
              <p className="text-sm text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                {localizedKeyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* 본문 상세 설명 카드 */}
        <Card className="border-border/80 bg-card/80 shadow-sm">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="size-5 text-primary" />
              {isEn ? 'Core Concept & Explanation' : isJa ? '概念と仕組みの解説' : '核心概念与原理说明'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEn ? 'Essential mechanics every investor should understand' : isJa ? '投資家が理解しておくべき基礎原理' : '投资者必须掌握的底层机制'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-3 space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <p className="text-base font-normal leading-relaxed">{localizedDescription}</p>

            {/* 교차 언어 참조 (KO / EN) */}
            <div className="mt-4 pt-4 border-t border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {isEn ? 'Original Korean Reference' : 'Global English Summary'}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{isEn ? item.descriptionKo : item.descriptionEn}"
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
                {isEn ? 'Calculation Formula' : isJa ? '計算式とメカニズム' : '计算公式与运作机制'}
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

        {/* 연관 계산기 링크 */}
        {item.relatedCalculatorUrl && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-semibold text-primary uppercase">
                {isEn ? 'Interactive Simulation' : isJa ? 'シミュレーターで試す' : '直接进行在线试算'}
              </span>
              <h4 className="text-base font-bold text-foreground">
                {item.relatedCalculatorLabelKo || 'Financial Calculator Tool'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isEn
                  ? 'Calculate post-tax returns, escape targets, and compound growth instantly.'
                  : isJa
                  ? '複雑な計算不要、数値を入力するだけで税引後リターンを瞬時に算出します。'
                  : '无需复杂计算，输入基础参数即可即时测算税后净收益。'}
              </p>
            </div>
            <Button asChild className="shrink-0 w-full sm:w-auto font-medium">
              <Link href={item.relatedCalculatorUrl}>
                {isEn ? 'Launch Calculator' : isJa ? '計算機を起動' : '立即启动计算器'}
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* 포트폴리오 저장 브릿지 액션 */}
        <CalculatorSaveAction
          scenario={{
            type: 'stock',
            title: `${localizedTermName}`,
            badge: item.category.toUpperCase(),
            primaryMetric: {
              label: 'Metric',
              value: item.slug.toUpperCase(),
            },
            ...(item.formula
              ? {
                  secondaryMetric: {
                    label: 'Formula',
                    value: item.formula,
                  },
                }
              : {}),
            details: {
              slug: item.slug,
              category: item.category,
              takeaway: localizedKeyTakeaway,
            },
            sourceUrl: `/${locale}/guide/glossary/${item.slug}`,
          }}
        />

        {/* 중간 AdSense 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 다른 추천 용어 둘러보기 */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-foreground">
            {isEn ? 'Related Financial Terms' : isJa ? 'あわせて学びたい関連用語' : '推荐相关金融词汇'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherTerms.map((other) => {
              const otherName = isEn ? other.termEn : isJa ? other.termJa : other.termZh;
              const otherTakeaway = isEn ? other.keyTakeawayEn : other.keyTakeawayKo;

              return (
                <Link
                  key={other.slug}
                  href={`/${locale}/guide/glossary/${other.slug}`}
                  className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {other.category}
                    </Badge>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {otherName}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {otherTakeaway}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 하단 푸터 네비게이션 */}
        <div className="text-center pt-8 border-t border-border/60">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/guide/glossary`}>
              <BookOpen className="size-4 mr-1.5" />
              {isEn ? 'View All 50 Terms' : isJa ? '全50用語の目次を見る' : '查看完整50大金融词典'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
