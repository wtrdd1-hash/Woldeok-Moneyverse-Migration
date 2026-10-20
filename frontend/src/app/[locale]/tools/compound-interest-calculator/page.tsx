import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calculator, TrendingUp, Sparkles, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, buildOgImageUrl, breadcrumbJsonLd } from '@/lib/seo';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';
import { isLocale, type Locale } from '@/lib/locale';
import { getCountryCompoundTitle, getCountryCompoundDescription, getCountryCompoundExample } from '@/lib/compound-country-scenarios';
import { formatCountryMoney, moneyCountryForLocale } from '@/lib/country-money';
import { GLOBAL_COMPOUND_PRESETS } from '@/config/pseo-compound-global.config';
import { CompoundCalculatorClient } from './compound-calculator-client';

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

  const url = canonicalUrl(`/${locale}/tools/compound-interest-calculator`);
  let title = '';
  let description = '';

  if (locale === 'en') {
    title = 'Compound Interest Calculator | Monthly Savings & Growth';
    description = 'Estimate the future value of monthly savings and initial deposits in USD. Choose a hypothetical return, amount and time horizon; investment results are not guaranteed.';
  } else if (locale === 'ja') {
    title = '複利計算シミュレーター｜毎月の積立額と運用期間';
    description = '日本円で初期元本と毎月の積立額を設定し、複利の効果を試算。想定利回りは保証されず、税金・手数料を含まない計算例です。';
  } else if (locale === 'zh') {
    title = '复利计算器｜每月定投与长期储蓄试算';
    description = '以人民币为单位输入初始本金、每月投入与年化收益率，估算长期复利增长。结果是计算示例，不代表保证收益或实时汇率。';
  }

  const ogImageUrl = buildOgImageUrl({
    title: locale === 'en' ? 'Compound Interest Calculator' : '複利シミュレーター',
    description: 'Calculate investment growth & FIRE milestone in real time',
    type: 'default',
    badge: 'Finance Simulator',
  });

  return {
    title,
    description,
    keywords: [
      'compound interest calculator',
      'investment growth calculator',
      '401k calculator',
      'FIRE number',
      'S&P 500 return calculator',
      'monthly investment compound',
    ],
    alternates: {
      canonical: url,
      languages: {
        ko: canonicalUrl('/tools/compound-calculator'),
        'ko-KR': canonicalUrl('/tools/compound-calculator'),
        en: canonicalUrl('/en/tools/compound-interest-calculator'),
        ja: canonicalUrl('/ja/tools/compound-interest-calculator'),
        zh: canonicalUrl('/zh/tools/compound-interest-calculator'),
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

export default async function GlobalCompoundPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') {
    notFound();
  }

  const isEn = locale === 'en';
  const isJa = locale === 'ja';
  const isZh = locale === 'zh';

  const breadcrumbs = breadcrumbJsonLd([
    { name: isEn ? 'Home' : isJa ? 'ホーム' : '首页', path: `/${locale}` },
    { name: isEn ? 'Tools' : isJa ? 'ツール' : '工具', path: `/${locale}/tools` },
    { name: isEn ? 'Compound Calculator' : isJa ? '複利計算機' : '复利计算器', path: `/${locale}/tools/compound-interest-calculator` },
  ]);

  return (
    <div className="mv-page mv-page--public min-h-screen py-8 px-4 sm:px-6">
      <DesktopStickyAdRails />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href={`/${locale}`}>
            <ArrowLeft className="size-4 mr-1.5" />
            {isEn ? 'Back to Overview' : isJa ? 'トップに戻る' : '返回主页'}
          </Link>
        </Button>

        <PageHeader
          eyebrow="COMPOUNDING EXAMPLE"
          title={isEn ? 'Compound Interest & FIRE Nest Egg Calculator' : isJa ? '複利＆資産形成シミュレーター' : '全球复利定投增长计算器'}
        >
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {isEn
              ? 'Calculate the power of compound interest with recurring monthly contributions. Project long-term stock portfolio values and visualize your journey to Financial Independence.'
              : isJa
              ? '初期投資と毎月の積立額を入力し、複利効果による資産の加速度的増加をシミュレーション。長期投資による経済的自立をサポートします。'
              : '测算每月定期定投下的复利威力。输入本金与回报率，即刻获取未来资产总值与财务自由时间线。'}
          </p>
        </PageHeader>

        {/* 3대 핵심 복리 원칙 배너 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground">Rule of 72</span>
            <div className="text-lg font-mono font-bold text-foreground mt-0.5">72 ÷ Return % = Years</div>
            <span className="text-[10px] text-muted-foreground">Doubling Time Formula</span>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground">Illustrative returns</span>
            <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">User-defined rate</div>
            <span className="text-[10px] text-muted-foreground">Not a live quote</span>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 text-center">
            <span className="text-xs text-muted-foreground">Illustrative planning</span>
            <div className="text-lg font-mono font-bold text-primary mt-0.5">Change assumptions</div>
            <span className="text-[10px] text-muted-foreground">Not guaranteed</span>
          </div>
        </div>

        {/* 고단가 AdSense 인아티클 광고 */}
        <InArticleAdvertisement className="my-2" />

        {/* 인터랙티브 복리 계산기 위젯 */}
        <CompoundCalculatorClient locale={locale} />

        {/* 중간 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 인기 프리셋 바로가기 */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            {isEn ? 'Popular Compounding & FIRE Scenarios' : isJa ? '注目の複利シミュレーション' : '热门复利策略方案'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {GLOBAL_COMPOUND_PRESETS.map((preset) => {
              const title = getCountryCompoundTitle(preset, locale);
              const desc = getCountryCompoundDescription(locale);

              return (
                <Link
                  key={preset.slug}
                  href={`/${locale}/tools/compound-interest-calculator/${preset.slug}`}
                  className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {preset.annualRate}% APR
                      </Badge>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {desc}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-border/50 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatCountryMoney(getCountryCompoundExample(preset, locale).monthlyContribution || getCountryCompoundExample(preset, locale).initialDeposit, moneyCountryForLocale(locale))} · {preset.years} {isEn ? 'years' : '年'}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
