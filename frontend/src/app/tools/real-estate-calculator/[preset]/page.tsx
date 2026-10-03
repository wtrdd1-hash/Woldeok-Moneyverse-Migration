import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RealEstateCalculatorView } from '@/components/real-estate-calculator-view';
import { REAL_ESTATE_PRESETS, getRealEstatePreset } from '@/config/real-estate-presets.config';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';

interface Props {
  params: Promise<{ preset: string }>;
}

export async function generateStaticParams() {
  return REAL_ESTATE_PRESETS.map((p) => ({
    preset: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { preset } = await params;
  const p = getRealEstatePreset(preset);
  if (!p) {
    return {
      title: '부동산 월세 수익률 계산기 | 월덕 머니버스',
    };
  }

  const title = `2026 ${p.name} 월세/임대 수익률 계산기 [Cap Rate ${(p.monthlyRent * 12 / p.purchasePrice * 100).toFixed(1)}%]`;
  const description = `${p.locationTag} ${p.name} 매매가 ${(p.purchasePrice / 100000000).toFixed(1)}억, 월세 ${(p.monthlyRent / 10000)}만원 기준 레버리지 자기자본 수익률(ROE)과 월 순현금흐름 0.1초 무료 계산.`;

  return {
    title,
    description,
    keywords: p.seoKeywords,
    alternates: {
      canonical: `https://easy-scraping.com/tools/real-estate-calculator/${p.slug}`,
      languages: {
        'ko-KR': `https://easy-scraping.com/tools/real-estate-calculator/${p.slug}`,
        'en-US': `https://easy-scraping.com/en/tools/real-estate-calculator/${p.slug}`,
        'ja-JP': `https://easy-scraping.com/ja/tools/real-estate-calculator/${p.slug}`,
        'zh-CN': `https://easy-scraping.com/zh/tools/real-estate-calculator/${p.slug}`,
        'x-default': `https://easy-scraping.com/tools/real-estate-calculator/${p.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://easy-scraping.com/tools/real-estate-calculator/${p.slug}`,
      type: 'website',
    },
  };
}

export default async function RealEstatePresetPage({ params }: Props) {
  const { preset } = await params;
  const p = getRealEstatePreset(preset);
  if (!p) {
    notFound();
  }

  const richSnippet = buildCalculatorRichSnippet({
    name: `${p.name} 월세 임대 수익률 계산기`,
    description: `${p.locationTag} ${p.name}의 연간 순수익률(Net Cap Rate) 및 대출 레버리지 ROE 시뮬레이터`,
    url: `https://easy-scraping.com/tools/real-estate-calculator/${p.slug}`,
    category: 'FinanceApplication',
    faqItems: [
      {
        question: `${p.name}의 예상 월 순수익은 얼마인가요?`,
        answer: `월세 ${(p.monthlyRent / 10000).toLocaleString()}만원에서 대출이자 및 재산세를 차감한 실질 월 순현금흐름을 실시간 계산할 수 있습니다.`,
      },
    ],
    howToSteps: [
      { name: '프리셋 조건 확인', text: `${p.name}의 기본 매매가 및 월세 조건을 확인합니다.` },
      { name: '본인 대출/보증금 커스텀', text: '실제 투자 조건에 맞게 수치를 조정합니다.' },
      { name: '진단서 생성 및 공유', text: '1초 바이럴 카드로 친구나 오픈채팅에 공유합니다.' },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(richSnippet) }}
      />
      <RealEstateCalculatorView initialPreset={p} />
    </>
  );
}
