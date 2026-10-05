import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calculator, ShieldCheck, Sparkles, TrendingUp, HelpCircle, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, buildOgImageUrl, breadcrumbJsonLd } from '@/lib/seo';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';
import { GIFT_TAX_PRESETS, calculateGiftTax } from '@/config/pseo-gift-tax.config';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ preset: string }>;
}

export async function generateStaticParams() {
  return GIFT_TAX_PRESETS.map((p) => ({
    preset: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { preset } = await params;
  const item = GIFT_TAX_PRESETS.find((p) => p.slug === preset);

  if (!item) {
    return { title: '프리셋을 찾을 수 없습니다' };
  }

  const url = canonicalUrl(`/tools/gift-tax-calculator/${item.slug}`);
  const result = calculateGiftTax(item.giftAmount, item.deductionAmount);
  const title = `${item.title} — 2026 증여세 계산기`;
  const description = `${item.title}. 증여재산가액 ₩${(item.giftAmount / 10000).toLocaleString()}만원, 공제액 ₩${(item.deductionAmount / 10000).toLocaleString()}만원, 과세표준 ₩${(result.taxableBase / 10000).toLocaleString()}만원, 최종 납부 예상 증여세 ₩${result.finalTax.toLocaleString()}원.`;

  const ogImageUrl = buildOgImageUrl({
    title: item.title,
    description: `최종 세금: ₩${result.finalTax.toLocaleString()} (실효세율 ${result.effectiveTaxRate}%)`,
    type: 'default',
    badge: '증여세 시뮬레이터',
  });

  return {
    title,
    description,
    keywords: [
      item.title,
      '증여세 계산',
      '증여세 면제 한도',
      `${item.giver} 증여세`,
      '2026 증여세율',
      '상속세 및 증여세법',
    ],
    alternates: { canonical: url },
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

export default async function GiftTaxPresetPage({ params }: PageProps) {
  const { preset } = await params;
  const item = GIFT_TAX_PRESETS.find((p) => p.slug === preset);

  if (!item) {
    notFound();
  }

  const result = calculateGiftTax(item.giftAmount, item.deductionAmount);

  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '증여세 계산기', path: '/tools/gift-tax-calculator' },
    { name: item.title, path: `/tools/gift-tax-calculator/${item.slug}` },
  ]);

  const otherPresets = GIFT_TAX_PRESETS.filter((p) => p.slug !== item.slug).slice(0, 3);

  return (
    <div className="mv-page mv-page--public min-h-screen py-8 px-4 sm:px-6">
      <DesktopStickyAdRails />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/tools/gift-tax-calculator">
            <ArrowLeft className="size-4 mr-1.5" />
            증여세 계산기 메인으로
          </Link>
        </Button>

        <PageHeader
          eyebrow="2026 GIFT TAX SCENARIO"
          title={item.title}
        >
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {item.descriptionKo} 2026년 현행 세법 기준 증여재산공제와 누진세율 및 자진신고 3% 공제를 적용한 법정 세액 산출 결과입니다.
          </p>
        </PageHeader>

        {/* 상단 AdSense 인아티클 광고 */}
        <InArticleAdvertisement className="my-2" />

        {/* 시나리오 결과 패널 카드 */}
        <Card className="border-border/80 bg-card/90 shadow-sm overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-primary" />
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  증여세 산출 결과 요약
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {item.giver}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            {/* 최종 세액 하이라이트 박스 */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                <div>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">최종 납부 예상 증여세</span>
                  <div className="text-2xl sm:text-3xl font-mono tabular-nums font-extrabold text-emerald-950 dark:text-emerald-100 mt-0.5">
                    ₩{result.finalTax.toLocaleString()}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground">실효 세율</span>
                  <div className="text-lg font-mono font-bold text-foreground">
                    {result.effectiveTaxRate}%
                  </div>
                </div>
              </div>

              {/* 세부 공제 및 과세표준 명세 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">증여 재산가액</span>
                  <div className="font-mono font-bold mt-0.5">₩{item.giftAmount.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">증여재산 공제액</span>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    -₩{item.deductionAmount.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">과세표준</span>
                  <div className="font-mono font-bold mt-0.5">₩{result.taxableBase.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <span className="text-muted-foreground">적용 세율</span>
                  <div className="font-mono font-bold mt-0.5">{result.rate}%</div>
                </div>
              </div>
            </div>

            {/* 절세 및 실전 가이드 박스 */}
            <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-2 text-xs sm:text-sm">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                전문가 절세 팁 & 체크포인트
              </h4>
              <ul className="space-y-1.5 text-muted-foreground list-disc pl-4 leading-relaxed">
                <li>
                  <strong>10년 주기 증여 리셋</strong>: 동일인으로부터 받은 증여는 10년간 합산 과세되므로, 10년 단위로 나누어 분할 증여하면 비과세 혜택을 극대화할 수 있습니다.
                </li>
                <li>
                  <strong>자진신고 3% 공제</strong>: 증여일이 속하는 달의 말일부터 3개월 이내에 관할 세무서에 자진 신고·납부할 경우 산출세액의 3%가 추가 감면됩니다.
                </li>
                <li>
                  <strong>평가액 기준</strong>: 상장주식은 증여일 전후 2개월(총 4개월) 종가 평균, 부동산은 시가(유사매매사례가액 또는 감정평가액)를 원칙으로 적용합니다.
                </li>
              </ul>
            </div>

            {/* 토스형 1초 시나리오 저장 & 회원 전환 액션 */}
            <CalculatorSaveAction
              scenario={{
                type: 'tax',
                title: item.title,
                badge: '증여세',
                primaryMetric: {
                  label: '예상 납부세액',
                  value: `₩${result.finalTax.toLocaleString()}`,
                },
                secondaryMetric: {
                  label: '실효세율',
                  value: `${result.effectiveTaxRate}%`,
                },
                details: {
                  slug: item.slug,
                  giftAmount: `₩${item.giftAmount.toLocaleString()}`,
                  deduction: `₩${item.deductionAmount.toLocaleString()}`,
                },
                sourceUrl: `/tools/gift-tax-calculator/${item.slug}`,
              }}
            />
          </CardContent>
        </Card>

        {/* 중간 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 연관 증여 시나리오 추천 */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-foreground">함께 확인하면 좋은 연관 증여 시나리오</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherPresets.map((other) => (
              <Link
                key={other.slug}
                href={`/tools/gift-tax-calculator/${other.slug}`}
                className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {other.giver}
                  </Badge>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {other.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                  {other.descriptionKo}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
