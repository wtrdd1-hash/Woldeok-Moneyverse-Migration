import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calculator, ShieldCheck, Sparkles, TrendingUp, HelpCircle, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, buildOgImageUrl, breadcrumbJsonLd } from '@/lib/seo';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';
import { GIFT_TAX_PRESETS, GIFT_TAX_DEDUCTIONS, calculateGiftTax } from '@/config/pseo-gift-tax.config';
import { GiftTaxInteractiveClient } from './gift-tax-interactive-client';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/tools/gift-tax-calculator');
  const title = '2026 증여세 계산기 & 면제 한도 총정리 — 월덕 머니버스';
  const description = '부모-자녀 5,000만원, 배우자 6억원, 혼인·출산 1.5억원 증여재산공제 한도 및 과세표준 구간별 세율(10%~50%) 0초 실시간 증여세 모의계산기.';

  const ogImageUrl = buildOgImageUrl({
    title: '2026 증여세 계산기 & 비과세 한도',
    description: '배우자 6억, 성인자녀 5천만, 혼인특례 1.5억 증여세 0초 계산',
    type: 'default',
    badge: '절세 시뮬레이터',
  });

  return {
    title,
    description,
    keywords: [
      '증여세 계산기',
      '증여세 면제 한도',
      '부모 자식 증여세',
      '배우자 증여세 6억',
      '혼인 증여세 공제 1.5억',
      '출산 증여세 공제',
      '증여세율',
      '증여세 신고기한',
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

export default function GiftTaxCalculatorPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '증여세 계산기', path: '/tools/gift-tax-calculator' },
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
          <Link href="/tools">
            <ArrowLeft className="size-4 mr-1.5" />
            금융 도구 전체 목록으로
          </Link>
        </Button>

        <PageHeader
          eyebrow="2026 GIFT TAX CALCULATOR"
          title="2026 증여세 계산기 & 면제 한도 시뮬레이터"
        >
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            배우자 6억원, 성인 자녀 5,000만원, 혼인·출산 1.5억원 증여재산공제와 10%~50% 누진세율 및 자진신고 3% 공제를 반영하여 최종 실부담 증여세를 즉시 산출합니다.
          </p>
        </PageHeader>

        {/* 상단 4대 비과세 면제 한도 하이라이트 배너 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/80 bg-card p-3.5 text-center">
            <span className="text-xs text-muted-foreground">배우자 간 증여</span>
            <div className="text-lg sm:text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              6억원 비과세
            </div>
            <span className="text-[10px] text-muted-foreground">10년간 누적 한도</span>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-3.5 text-center">
            <span className="text-xs text-muted-foreground">부모 ➡️ 성인자녀</span>
            <div className="text-lg sm:text-xl font-mono font-bold text-foreground mt-1">
              5,000만원
            </div>
            <span className="text-[10px] text-muted-foreground">미성년 자녀 2,000만</span>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-3.5 text-center">
            <span className="text-xs text-muted-foreground">결혼·출산 특례</span>
            <div className="text-lg sm:text-xl font-mono font-bold text-primary mt-1">
              최대 1.5억원
            </div>
            <span className="text-[10px] text-muted-foreground">혼인 전후 2년 내</span>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-3.5 text-center">
            <span className="text-xs text-muted-foreground">자진신고 공제</span>
            <div className="text-lg sm:text-xl font-mono font-bold text-foreground mt-1">
              3% 추가 감면
            </div>
            <span className="text-[10px] text-muted-foreground">증여월 말일부터 3개월</span>
          </div>
        </div>

        {/* 최상단 고단가 AdSense 인아티클 광고 */}
        <InArticleAdvertisement className="my-2" />

        {/* 인터랙티브 실시간 증여세 계산기 클라이언트 컴포넌트 */}
        <GiftTaxInteractiveClient />

        {/* 중간 멀티플렉스 추천 광고 */}
        <MultiplexAdvertisement className="my-6" />

        {/* 인기 롱테일 증여 시나리오 프리셋 링크 목록 */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              자주 찾는 증여세 시나리오 분석
            </h3>
            <span className="text-xs text-muted-foreground">13개 롱테일 프리셋</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {GIFT_TAX_PRESETS.map((preset) => (
              <Link
                key={preset.slug}
                href={`/tools/gift-tax-calculator/${preset.slug}`}
                className="group p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {preset.giver}
                    </Badge>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {preset.descriptionKo}
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-border/50 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  증여가액: ₩{(preset.giftAmount / 10000).toLocaleString()}만원
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
