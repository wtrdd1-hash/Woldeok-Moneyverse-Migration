import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KimchiPremiumCalculatorView } from '@/components/kimchi-premium-calculator-view';
import { KIMCHI_PREMIUM_PRESETS, getKimchiPremiumPreset } from '@/config/kimchi-premium-presets.config';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';

interface Props {
  params: Promise<{ preset: string }>;
}

export async function generateStaticParams() {
  return KIMCHI_PREMIUM_PRESETS.map((p) => ({
    preset: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { preset } = await params;
  const p = getKimchiPremiumPreset(preset);
  if (!p) {
    return {
      title: '코인 김치프리미엄 계산기 | 월덕 머니버스',
    };
  }

  const foreignKrw = Math.round(p.foreignPriceUsd * p.usdKrwExchangeRate);
  const premium = (((p.domesticPriceKrw - foreignKrw) / foreignKrw) * 100).toFixed(2);

  const title = `2026 ${p.name}(${p.symbol}) 김치프리미엄 계산기 [실시간 김프 ${premium}%]`;
  const description = `${p.name}(${p.symbol}) 업비트 ${p.domesticPriceKrw.toLocaleString()}원 vs 바이낸스 $${p.foreignPriceUsd} 실시간 김치프리미엄 ${premium}% 및 전송 수수료 차감 후 순차익 무료 계산.`;

  return {
    title,
    description,
    keywords: p.seoKeywords,
    alternates: {
      canonical: `https://easy-scraping.com/tools/kimchi-premium-calculator/${p.slug}`,
      languages: {
        'ko-KR': `https://easy-scraping.com/tools/kimchi-premium-calculator/${p.slug}`,
        'en-US': `https://easy-scraping.com/en/tools/kimchi-premium-calculator/${p.slug}`,
        'ja-JP': `https://easy-scraping.com/ja/tools/kimchi-premium-calculator/${p.slug}`,
        'zh-CN': `https://easy-scraping.com/zh/tools/kimchi-premium-calculator/${p.slug}`,
        'x-default': `https://easy-scraping.com/tools/kimchi-premium-calculator/${p.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://easy-scraping.com/tools/kimchi-premium-calculator/${p.slug}`,
      type: 'website',
    },
  };
}

export default async function KimchiPremiumPresetPage({ params }: Props) {
  const { preset } = await params;
  const p = getKimchiPremiumPreset(preset);
  if (!p) {
    notFound();
  }

  const richSnippet = buildCalculatorRichSnippet({
    name: `${p.name}(${p.symbol}) 김치프리미엄 계산기`,
    description: `${p.name}의 국내외 거래소 시세 격차 및 재정거래 마진 시뮬레이터`,
    url: `https://easy-scraping.com/tools/kimchi-premium-calculator/${p.slug}`,
    category: 'FinanceApplication',
    faqItems: [
      {
        question: `${p.name}의 실시간 김치프리미엄은 몇 %인가요?`,
        answer: `${p.koreanExchange}와 ${p.globalExchange} 간의 환율 반영 실시간 가격 격차를 0.1초 만에 확인하고 진단할 수 있습니다.`,
      },
    ],
    howToSteps: [
      { name: '코인 프리셋 선택', text: `${p.name}(${p.symbol}) 프리셋을 선택합니다.` },
      { name: '실시간 호가 확인', text: '국내외 시세와 USD/KRW 환율을 확인합니다.' },
      { name: '진단서 생성 및 공유', text: '바이럴 카드를 생성하여 친구들에게 공유합니다.' },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(richSnippet) }}
      />
      <KimchiPremiumCalculatorView initialPreset={p} />
    </>
  );
}
