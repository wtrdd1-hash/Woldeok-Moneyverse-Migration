import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CapitalGainsTaxCalculatorView } from '@/components/capital-gains-tax-calculator-view';
import { CAPITAL_GAINS_TAX_PRESETS, getCapitalGainsTaxPreset } from '@/config/capital-gains-tax-presets.config';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';

interface Props {
  params: Promise<{ preset: string }>;
}

export async function generateStaticParams() {
  return CAPITAL_GAINS_TAX_PRESETS.map((p) => ({
    preset: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { preset } = await params;
  const p = getCapitalGainsTaxPreset(preset);
  if (!p) {
    return {
      title: '주식 양도소득세 계산기 | 월덕 머니버스',
    };
  }

  const taxable = Math.max(0, p.realizedGainKrw - (p.applyLossHarvesting ? p.unrealizedLossKrw : 0) - (p.applyBasicDeduction ? 2500000 : 0));
  const tax = Math.round(taxable * 0.22);

  const title = `2026 ${p.name} | 예상 세금 ${tax.toLocaleString()}원 & 절세 시뮬레이터`;
  const description = `${p.name} - 실현수익 ${(p.realizedGainKrw / 10000).toLocaleString()}만원 기준 22% 양도소득세 및 250만원 공제 후 예상 납부 세액 0.1초 무료 계산.`;

  return {
    title,
    description,
    keywords: p.seoKeywords,
    alternates: {
      canonical: `https://easy-scraping.com/tools/capital-gains-tax-calculator/${p.slug}`,
      languages: {
        'ko-KR': `https://easy-scraping.com/tools/capital-gains-tax-calculator/${p.slug}`,
        'en-US': `https://easy-scraping.com/en/tools/capital-gains-tax-calculator/${p.slug}`,
        'ja-JP': `https://easy-scraping.com/ja/tools/capital-gains-tax-calculator/${p.slug}`,
        'zh-CN': `https://easy-scraping.com/zh/tools/capital-gains-tax-calculator/${p.slug}`,
        'x-default': `https://easy-scraping.com/tools/capital-gains-tax-calculator/${p.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://easy-scraping.com/tools/capital-gains-tax-calculator/${p.slug}`,
      type: 'website',
    },
  };
}

export default async function CapitalGainsTaxPresetPage({ params }: Props) {
  const { preset } = await params;
  const p = getCapitalGainsTaxPreset(preset);
  if (!p) {
    notFound();
  }

  const richSnippet = buildCalculatorRichSnippet({
    name: `${p.name} 절세 계산기`,
    description: `${p.description} - 22% 양도소득세 및 손익 통산 시뮬레이터`,
    url: `https://easy-scraping.com/tools/capital-gains-tax-calculator/${p.slug}`,
    category: 'FinanceApplication',
    faqItems: [
      {
        question: `${p.name}의 최종 예상 납부 세액은 얼마인가요?`,
        answer: `수익 ${(p.realizedGainKrw / 10000).toLocaleString()}만원에서 기본공제와 손익 상계를 반영하여 0.1초 만에 산출됩니다.`,
      },
    ],
    howToSteps: [
      { name: '절세 프리셋 선택', text: `${p.name} 프리셋을 확인합니다.` },
      { name: '본인 수익/손실 입력', text: '실제 투자 계좌의 수익과 손실을 입력합니다.' },
      { name: '절세 진단서 공유', text: '1초 바이럴 카드로 오픈채팅에 공유합니다.' },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(richSnippet) }}
      />
      <CapitalGainsTaxCalculatorView initialPreset={p} />
    </>
  );
}
