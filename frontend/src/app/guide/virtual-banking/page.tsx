import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Landmark, PiggyBank, Sparkles, Percent, ShieldCheck, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { getServerLocale } from '@/lib/locale-server';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/guide/virtual-banking');
  const ogImageUrl = buildOgImageUrl({
    title: '가상 금융 & 복리 예금·국채 전략 가이드',
    description: '일일 복리 이자 극대화 공식, 가상 국채 만기 수익률 시뮬레이션 및 다중 세이빙 포켓 자산 관리법.',
    type: 'default',
    badge: '가상 뱅킹 가이드',
  });

  return {
    title: '가상 금융 & 복리 예금·국채 전략 가이드 — 월덕 머니버스',
    description: '월덕 머니버스 가상 중앙은행 복리 예금 이자 계산법, 가상 국채 만기 투자 전략, 4인 공동 저축 팟 보너스 획득 노하우를 안내합니다.',
    keywords: [
      '가상 은행',
      '복리 예금 이자',
      '가상 국채',
      '가상경제 자산관리',
      '저축 챌린지',
      '월덕 머니버스 은행',
      'WLD 복리',
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
      title: '가상 금융 & 복리 예금·국채 전략 가이드',
      description: '복리 예금 이자 극대화 및 가상 국채 자산 배분 전략',
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function VirtualBankingGuidePage() {
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isEn
      ? 'Virtual Banking, Compound Interest & Treasury Bond Guide'
      : '가상 금융 & 복리 예금·국채 전략 가이드',
    description: isEn
      ? 'Comprehensive guide to compounding daily interest, treasury bond yield curves, and savings pockets in Woldeok Moneyverse.'
      : '가상 중앙은행 복리 이자 공식, 가상 국채 만기 투자 전략 및 다중 세이빙 포켓 활용 가이드.',
    author: {
      '@type': 'Organization',
      name: 'Woldeok Central Bank Research',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Woldeok Moneyverse',
    },
  };

  return (
    <div data-page="guide-virtual-banking" className="mv-page mv-page--finance grid gap-6 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/guide">
          <ArrowLeft />
          {isEn ? 'Back to guides' : '가이드 센터로 돌아가기'}
        </Link>
      </Button>

      <PageHeader
        eyebrow="FINANCE STRATEGY PILLAR"
        title={isEn ? 'Virtual Banking & Compound Interest Strategy' : '가상 금융 & 복리 예금·국채 전략 가이드'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Discover how to accelerate your WLD wealth using automated daily compounding deposits, high-yield virtual government bonds, and cooperative 4-player savings pots.'
            : '단순 지갑 보유보다 훨씬 빠른 자산 증식을 가능하게 하는 가상 중앙은행의 일일 복리 예금, 고수익 가상 국채 만기 배분, 4인 공동 저축 챌린지 팟의 복리 레버리지 전략을 공개합니다.'}
        </p>
      </PageHeader>

      <div className="grid gap-6">
        {/* Section 1: Compound Interest Formula */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Percent className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '1. Daily Compounding Deposit Power' : '1. 매일 자정 자동 지급되는 일일 복리 예금 공식'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'How compound cycles amplify passive WLD income.' : '원금에 이자가 더해져 다시 이자를 낳는 지수적 자산 증식'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isEn
                ? 'Woldeok Central Bank calculates interest on your active bank balance daily. Because interest is credited directly to your principal, each subsequent day generates a higher return.'
                : '가상 중앙은행에 예치된 WLD 잔액은 매일 자정 기준 연 3.5%~7.2%(경제 통화 정책 변동)의 기본 예금 금리가 일할 복리로 자동 결산됩니다. 이자가 원금에 즉시 누적되므로 장기 예치 시 폭발적인 수익을 얻을 수 있습니다.'}
            </p>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 font-mono text-xs space-y-1">
              <div className="text-foreground font-bold">{isEn ? 'Daily Compound Calculation:' : '일일 복리 수식:'}</div>
              <div className="text-primary font-semibold">Future Value = Principal × (1 + APR / 365)^Days</div>
              <div className="text-muted-foreground text-[11px] pt-1">
                * 예시: 100,000 WLD를 연 5.0% 금리로 30일간 예치 시 매일 증가하는 일일 이자가 원금에 자동 재투자됨.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Virtual Government Bonds */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Landmark className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '2. Virtual Treasury Bonds (Fixed Maturity Yield)' : '2. 확정 고수익 가상 국채(Treasury Bonds) 만기 운용'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'Locking in guaranteed returns immune to market volatility.' : '시세 변동 리스크 없이 만기 시 확정 수익을 지급받는 국채 포트폴리오'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isEn
                ? 'Virtual treasury bonds offer fixed annual coupon rates (up to 12.0% APR) for 7-day, 30-day, and 90-day lockup maturities. The central bank treasury guarantees principal redemption upon maturity.'
                : '가상 국채는 7일 단기채, 30일 중기채, 90일 장기채로 구성되며 연 최대 12.0%의 확정 만기 수익률을 제공합니다. 시장 주가 급락 시에도 중앙은행 금고에서 100% 원금과 확정 이자를 보장합니다.'}
            </p>
            <div className="grid sm:grid-cols-3 gap-2.5 pt-2">
              <div className="rounded-lg border bg-surface p-3 text-center">
                <div className="text-xs text-muted-foreground">7일 단기채</div>
                <div className="text-sm font-bold text-emerald-500 mt-1">연 4.5% APR</div>
              </div>
              <div className="rounded-lg border bg-surface p-3 text-center">
                <div className="text-xs text-muted-foreground">30일 중기채</div>
                <div className="text-sm font-bold text-emerald-500 mt-1">연 8.0% APR</div>
              </div>
              <div className="rounded-lg border bg-surface p-3 text-center">
                <div className="text-xs text-muted-foreground">90일 장기채</div>
                <div className="text-sm font-bold text-cyan-500 mt-1">연 12.0% APR</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: 4-Player Savings Pot */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <PiggyBank className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '3. 4-Player Cooperative Savings Pot & Nudge' : '3. 토스형 4인 공동 저축 챌린지 팟 & 친구 찌르기'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'Team up with 4 friends to earn +5% bonus jackpot.' : '친구들과 함께 목표 금액을 모아 추가 보너스 이자 획득하기'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isEn
                ? 'Invite 3 friends to create a 4-player savings pot. If all 4 members reach the savings goal before the deadline, every participant receives a +5.0% bonus interest payout.'
                : '친구 4명이 모여 10만 WLD 모으기 챌린지를 진행합니다. 목표 달성 시 전원에게 +5.0% 추가 보너스 이자가 지급되며, 저축을 잊은 친구에게는 무료로 찌르기(Nudge) 알림을 전송할 수 있습니다.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 mt-4">
        <div>
          <h4 className="font-bold text-sm text-foreground">
            {isEn ? 'Ready to grow your savings?' : '지금 가상 중앙은행에 예치하고 복리 이자를 받아보세요'}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEn
              ? 'Safe, server-verified automated compound accounts.'
              : '원금 손실 없는 100% 안전 자산 복리 계좌를 개설하세요.'}
          </p>
        </div>
        <Button asChild className="shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/bank">
            <Wallet className="size-4 mr-1.5" />
            {isEn ? 'Go to Virtual Bank' : '가상 은행 바로가기'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
