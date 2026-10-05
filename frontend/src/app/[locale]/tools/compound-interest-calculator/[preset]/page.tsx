import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calculator, TrendingUp, Sparkles, DollarSign, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, buildOgImageUrl, breadcrumbJsonLd } from '@/lib/seo';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';
import { Locale, isLocale } from '@/lib/locale';
import { GLOBAL_COMPOUND_PRESETS, calculateGlobalCompound } from '@/config/pseo-compound-global.config';
import { CompoundCalculatorClient } from '../compound-calculator-client';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ locale: string; preset: string }>;
}

const SUPPORTED_LOCALES: Locale[] = ['en', 'ja', 'zh'];

export async function generateStaticParams() {
  const params: { locale: string; preset: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const p of GLOBAL_COMPOUND_PRESETS) {
      params.push({
        locale,
        preset: p.slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, preset } = await params;
  if (!isLocale(locale) || locale === 'ko') {
    return {};
  }

  const item = GLOBAL_COMPOUND_PRESETS.find((p) => p.slug === preset);
  if (!item) {
    return { title: 'Preset Not Found' };
  }

  const url = canonicalUrl(`/${locale}/tools/compound-interest-calculator/${item.slug}`);
  const result = calculateGlobalCompound(item.initialDeposit, item.monthlyContribution, item.annualRate, item.years);

  let title = '';
  let description = '';

  if (locale === 'en') {
    title = `${item.titleEn} — Compound Calculator`;
    description = `${item.titleEn}. Total future value: $${result.totalFutureValue.toLocaleString()}. Invested: $${result.totalPrincipalInvested.toLocaleString()}, compound interest earned: $${result.totalInterestEarned.toLocaleString()}.`;
  } else if (locale === 'ja') {
    title = `${item.titleJa} — 複利シミュレーター`;
    description = `${item.titleJa}。将来資産総額：$${result.totalFutureValue.toLocaleString()}（約${Math.round(result.totalFutureValue * 150 / 10000)}万円）。元本倍率：${(result.totalFutureValue / result.totalPrincipalInvested).toFixed(2)}倍。`;
  } else if (locale === 'zh') {
    title = `${item.titleZh} — 复利投资测算`;
    description = `${item.titleZh}。预估期末总资产：$${result.totalFutureValue.toLocaleString()}。复利净收益：$${result.totalInterestEarned.toLocaleString()}。`;
  }

  const ogImageUrl = buildOgImageUrl({
    title: locale === 'en' ? item.titleEn : item.titleJa,
    description: `Future Value: $${result.totalFutureValue.toLocaleString()}`,
    type: 'default',
    badge: 'FIRE Goal',
  });

  return {
    title,
    description,
    keywords: [
      item.slug,
      'compound interest calculation',
      'investment timeline',
      '401k return',
      'S&P 500 compounding',
    ],
    alternates: {
      canonical: url,
      languages: {
        en: canonicalUrl(`/en/tools/compound-interest-calculator/${item.slug}`),
        ja: canonicalUrl(`/ja/tools/compound-interest-calculator/${item.slug}`),
        zh: canonicalUrl(`/zh/tools/compound-interest-calculator/${item.slug}`),
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function GlobalCompoundPresetPage({ params }: PageProps) {
  const { locale, preset } = await params;
  if (!isLocale(locale) || locale === 'ko') {
    notFound();
  }

  const item = GLOBAL_COMPOUND_PRESETS.find((p) => p.slug === preset);
  if (!item) {
    notFound();
  }

  const isEn = locale === 'en';
  const isJa = locale === 'ja';
  const isZh = locale === 'zh';

  const localizedTitle = isEn ? item.titleEn : isJa ? item.titleJa : item.titleZh;
  const localizedDesc = isEn ? item.descriptionEn : isJa ? item.descriptionJa : item.descriptionZh;

  const result = calculateGlobalCompound(item.initialDeposit, item.monthlyContribution, item.annualRate, item.years);

  const breadcrumbs = breadcrumbJsonLd([
    { name: isEn ? 'Home' : isJa ? 'ホーム' : '首页', path: `/${locale}` },
    { name: isEn ? 'Tools' : isJa ? 'ツール' : '工具', path: `/${locale}/tools` },
    { name: isEn ? 'Compound Calculator' : isJa ? '複利計算機' : '复利计算器', path: `/${locale}/tools/compound-interest-calculator` },
    { name: localizedTitle, path: `/${locale}/tools/compound-interest-calculator/${item.slug}` },
  ]);

  const otherPresets = GLOBAL_COMPOUND_PRESETS.filter((p) => p.slug !== item.slug).slice(0, 3);

  return (
    <div className="mv-page mv-page--public min-h-screen py-8 px-4 sm:px-6">
      <DesktopStickyAdRails />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href={`/${locale}/tools/compound-interest-calculator`}>
            <ArrowLeft className="size-4 mr-1.5" />
            {isEn ? 'Back to Calculator' : isJa ? '複利計算機トップへ' : '返回复利计算器'}
          </Link>
        </Button>

        <PageHeader
          eyebrow="COMPOUNDING MILESTONE"
          title={localizedTitle}
        >
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {localizedDesc}
          </p>
        </PageHeader>

        {/* 상단 AdSense 인아티클 광고 */}
        <InArticleAdvertisement className="my-2" />

        {/* 정밀 산출 요약 카드 */}
        <Card className="border-border/80 bg-card/90 shadow-sm overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {isEn ? 'Milestone Growth Summary' : isJa ? '運用成果サマリー' : '预期收益一览'}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {item.years} Yrs Projection
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    {isEn ? 'Total Future Value' : isJa ? '将来資産総額' : '最终预期总资产'}
                  </span>
                  <div className="text-2xl sm:text-4xl font-mono tabular-nums font-extrabold text-emerald-950 dark:text-emerald-100 mt-1">
                    ${result.totalFutureValue.toLocaleString()}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground">
                    {isEn ? 'Return On Investment' : isJa ? '投資収益率 (ROI)' : '总投资收益率'}
                  </span>
                  <div className="text-lg font-mono font-bold text-foreground">
                    +{Math.round((result.totalInterestEarned / Math.max(result.totalPrincipalInvested, 1)) * 100)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">{isEn ? 'Initial Deposit' : isJa ? '初期投資' : '初始资金'}</span>
                  <div className="font-mono font-bold mt-0.5">${item.initialDeposit.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">{isEn ? 'Monthly' : isJa ? '毎月積立' : '每月定投'}</span>
                  <div className="font-mono font-bold mt-0.5">${item.monthlyContribution.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">{isEn ? 'Interest Profit' : isJa ? '純利益' : '纯复利收益'}</span>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +${result.totalInterestEarned.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">{isEn ? 'Annual Return' : isJa ? '年利' : '年化收益率'}</span>
                  <div className="font-mono font-bold mt-0.5">{item.annualRate}%</div>
                </div>
              </div>
            </div>

            {/* 토스형 1초 시나리오 저장 & 온보딩 브릿지 */}
            <CalculatorSaveAction
              scenario={{
                type: 'stock',
                title: localizedTitle,
                badge: 'FIRE STRATEGY',
                primaryMetric: {
                  label: isEn ? 'Goal Target' : '목표 자산',
                  value: `$${result.totalFutureValue.toLocaleString()}`,
                },
                secondaryMetric: {
                  label: isEn ? 'Net Gain' : '순수익',
                  value: `+$${result.totalInterestEarned.toLocaleString()}`,
                },
                details: {
                  slug: item.slug,
                  monthly: `$${item.monthlyContribution.toLocaleString()}`,
                  period: `${item.years} years`,
                },
                sourceUrl: `/${locale}/tools/compound-interest-calculator/${item.slug}`,
              }}
            />
          </CardContent>
        </Card>

        {/* 인터랙티브 커스텀 수정 시뮬레이터 임베드 */}
        <div className="pt-4 space-y-3">
          <h3 className="text-base font-bold text-foreground">
            {isEn ? 'Customize Parameters in Real-Time' : isJa ? 'パラメータを自由に変更して再試算' : '实时调整参数在线测算'}
          </h3>
          <CompoundCalculatorClient
            initialDepositDefault={item.initialDeposit}
            monthlyContributionDefault={item.monthlyContribution}
            annualRateDefault={item.annualRate}
            yearsDefault={item.years}
            locale={locale}
          />
        </div>

        {/* 중간 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 연관 시나리오 목록 */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-foreground">
            {isEn ? 'Other Popular Compounding Strategies' : isJa ? 'その他の人気複利シミュレーション' : '其他热门定投策略'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherPresets.map((other) => (
              <Link
                key={other.slug}
                href={`/${locale}/tools/compound-interest-calculator/${other.slug}`}
                className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {other.annualRate}% APR
                  </Badge>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {isEn ? other.titleEn : isJa ? other.titleJa : other.titleZh}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                  {isEn ? other.descriptionEn : isJa ? other.descriptionJa : other.descriptionZh}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
