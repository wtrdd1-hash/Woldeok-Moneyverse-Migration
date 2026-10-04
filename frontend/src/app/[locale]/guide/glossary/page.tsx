import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Search, HelpCircle, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, buildOgImageUrl, breadcrumbJsonLd } from '@/lib/seo';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '@/config/pseo-glossary.config';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';
import { Locale, isLocale } from '@/lib/locale';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SUPPORTED_LOCALES: Locale[] = ['en', 'ja', 'zh'];

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') {
    return {};
  }

  const url = canonicalUrl(`/${locale}/guide/glossary`);

  let title = '';
  let description = '';

  if (locale === 'en') {
    title = '50 Essential Investment & Finance Terms Glossary | Woldeok Moneyverse';
    description = 'Master 50 core financial concepts: P/E, P/B, ROE, Ex-Dividend Dates, Dividend Taxes, Dollar-Cost Averaging, Short Selling, and Macro Yield Curves.';
  } else if (locale === 'ja') {
    title = '株式・資産運用 50大金融用語辞典 | Woldeok Moneyverse';
    description = 'PER、PBR、ROE、配当落ち日、配当所得税、ナンピン買い、空売り、逆イールドなど、実践的な50大投資指標と計算式を総まとめ。';
  } else if (locale === 'zh') {
    title = '全球50大投资与金融核心词典 | Woldeok Moneyverse';
    description = '一文读懂50个核心股票与理财概念：市盈率(PE)、市净率(PB)、净资产收益率(ROE)、除息日、股息税、补仓定投、做空与收益率倒挂。';
  }

  const ogImageUrl = buildOgImageUrl({
    title,
    description,
    type: 'default',
    badge: 'Glossary',
  });

  return {
    title,
    description,
    keywords: [
      'finance glossary',
      'investment terms',
      'stock market concepts',
      'pe ratio',
      'dividend yield',
      'financial indicators',
    ],
    alternates: {
      canonical: url,
      languages: {
        ko: canonicalUrl('/guide/glossary'),
        en: canonicalUrl('/en/guide/glossary'),
        ja: canonicalUrl('/ja/guide/glossary'),
        zh: canonicalUrl('/zh/guide/glossary'),
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function LocalizedGlossaryHubPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') {
    notFound();
  }

  const isEn = locale === 'en';
  const isJa = locale === 'ja';
  const isZh = locale === 'zh';

  const breadcrumbs = breadcrumbJsonLd([
    { name: isEn ? 'Home' : isJa ? 'ホーム' : '首页', path: `/${locale}` },
    { name: isEn ? 'Guides' : isJa ? 'ガイド' : '指南', path: `/${locale}/guide` },
    { name: isEn ? 'Finance Glossary' : isJa ? '金融用語辞典' : '金融词典', path: `/${locale}/guide/glossary` },
  ]);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GLOSSARY_TERMS.slice(0, 20).map((item) => ({
      '@type': 'Question',
      name: isEn ? item.termEn : isJa ? item.termJa : item.termZh,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${isEn ? item.descriptionEn : isJa ? item.descriptionJa : item.descriptionZh} ${item.formula ? `Formula: ${item.formula}` : ''}`,
      },
    })),
  };

  return (
    <div data-page="localized-guide-glossary" className="mv-page mv-page--public min-h-screen py-8 px-4 sm:px-6">
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
          <Link href={`/${locale}/guide`}>
            <ArrowLeft className="size-4 mr-1.5" />
            {isEn ? 'Back to Guides' : isJa ? 'ガイドセンターへ戻る' : '返回指南中心'}
          </Link>
        </Button>

        <PageHeader
          eyebrow="GLOBAL FINANCIAL GLOSSARY"
          title={
            isEn
              ? '50 Essential Investment & Finance Terms'
              : isJa
              ? '実戦投資・資産運用の50大金融用語辞典'
              : '实战投资与财富管理的50大金融核心词典'
          }
        >
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            {isEn
              ? 'Comprehensive definitions, formulas, and actionable strategies for 50 essential finance terms covering Valuation, Dividends, Taxes, and Trading.'
              : isJa
              ? 'PER・PBRなどの株価評価指標から、配当落ち日、ナンピン買い、空売り、長短金利逆転まで、投資家必修の50大指標をわかりやすく解説。'
              : '从估值指标（PE/PB/ROE）到除息日、股息税、补仓定投公式与宏观利率，一网打尽核心财富与股市概念。'}
          </p>
        </PageHeader>

        {/* 상단 통계 하이라이트 바 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">
              {isEn ? 'Total Terms' : isJa ? '収録用語数' : '总收录词条'}
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground mt-0.5">50</div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">
              {isEn ? 'Global Locales' : isJa ? '対応言語' : '支持语种'}
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground mt-0.5">4 Languages</div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">
              {isEn ? 'Linked Calculators' : isJa ? '連動計算ツール' : '联动试算工具'}
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground mt-0.5">4 Web Apps</div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground font-medium">
              {isEn ? 'SEO Prerendering' : isJa ? '静的ページ生成' : '全静态页面'}
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">100% Static</div>
          </div>
        </div>

        {/* 최상단 AdSense 광고 */}
        <InArticleAdvertisement className="my-2" />

        {/* 50대 용어 카드 그리드 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              {isEn ? 'Complete Terms Directory' : isJa ? '全用語インデックス' : '完整词条总目录'}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">50 Terms Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {GLOSSARY_TERMS.map((item, index) => {
              const termName = isEn ? item.termEn : isJa ? item.termJa : item.termZh;
              const termDesc = isEn ? item.descriptionEn : isJa ? item.descriptionJa : item.descriptionZh;

              return (
                <React.Fragment key={item.slug}>
                  <Link
                    href={`/${locale}/guide/glossary/${item.slug}`}
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
                          {termName}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {item.slug.toUpperCase()} • {item.termKo}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {termDesc}
                      </p>
                    </div>

                    {item.formula && (
                      <div className="mt-3 pt-2.5 border-t border-border/50 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {item.formula}
                      </div>
                    )}
                  </Link>

                  {/* 중간 6번째에 인아티클 광고 배치 */}
                  {index === 5 && (
                    <div className="md:col-span-2 my-2">
                      <InArticleAdvertisement />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 하단 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 도구 허브 연결 배너 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <div>
            <h4 className="font-bold text-base text-foreground">
              {isEn ? 'Looking for Interactive Financial Calculators?' : isJa ? '対話型金融計算ツールをお探しですか？' : '寻找可交互的金融计算器工具？'}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isEn
                ? 'Check out our dividend tax, CAGR, loan interest, and dollar-cost averaging tools.'
                : isJa
                ? '配当所得税、CAGR複利成長、融資利息、ナンピン脱出計算機を無料でお試しください。'
                : '免费试用股息红利税、复利增长、贷款利息与股票补仓回本计算工具。'}
            </p>
          </div>
          <Button asChild className="shrink-0 w-full sm:w-auto">
            <Link href="/tools">
              <Sparkles className="size-4 mr-1.5" />
              {isEn ? 'Go to Calculator Hub' : isJa ? '金融計算ツール一覧' : '前往计算器中心'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
