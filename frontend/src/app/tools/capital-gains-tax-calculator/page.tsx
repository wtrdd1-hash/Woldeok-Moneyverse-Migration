import React from 'react';
import type { Metadata } from 'next';
import { CapitalGainsTaxCalculatorView } from '@/components/capital-gains-tax-calculator-view';
import { CAPITAL_GAINS_TAX_PRESETS } from '@/config/capital-gains-tax-presets.config';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '[2026 최신] 해외주식 양도소득세 계산기 — [무료/1초] 미국주식 250만원 기본공제 & 손익통산 예상 세액 | 월덕 머니버스',
  description: '[로그인 없이 1초 산출] 미국주식 및 해외주식 22% 양도소득세, 연간 250만원 기본공제, 손익통산을 가정한 예상 세액을 무료로 확인하세요. 실제 신고 시에는 국세청 기준과 개인별 요건을 확인해야 합니다.',
  keywords: [
    '해외주식 양도소득세 계산기',
    '미국주식 250만원 기본공제',
    '주식 양도세 계산기',
    '손익상계 계산기',
    '해외주식 22% 세금',
    '미국주식 절세법',
  ],
  alternates: {
    canonical: 'https://easy-scraping.com/tools/capital-gains-tax-calculator',
    languages: {
      'ko-KR': 'https://easy-scraping.com/tools/capital-gains-tax-calculator',
      'en-US': 'https://easy-scraping.com/en/tools/capital-gains-tax-calculator',
      'ja-JP': 'https://easy-scraping.com/ja/tools/capital-gains-tax-calculator',
      'zh-CN': 'https://easy-scraping.com/zh/tools/capital-gains-tax-calculator',
      'x-default': 'https://easy-scraping.com/tools/capital-gains-tax-calculator',
    },
  },
};

export default function CapitalGainsTaxCalculatorPage() {
  const defaultPreset = CAPITAL_GAINS_TAX_PRESETS[0];
  const richSnippet = buildCalculatorRichSnippet({
    name: '2026 해외주식 양도소득세 기본공제 예상 계산기',
    description: '미국주식 실현수익에 대한 22% 양도소득세 및 손실 실현을 가정한 세액 추정 시뮬레이터',
    url: 'https://easy-scraping.com/tools/capital-gains-tax-calculator',
    category: 'FinanceApplication',
    faqItems: [
      {
        question: '해외주식 양도소득세 기본공제 250만원은 어떻게 적용되나요?',
        answer: '매년 1월 1일부터 12월 31일까지 발생한 해외주식 전체 실현손익 합산액에서 250만원 기본공제를 반영한 추정치를 보여 줍니다. 개별 거래 및 신고 요건은 별도로 확인해야 합니다.',
      },
      {
        question: '손익 상계(Tax-loss harvesting) 절세란 무엇인가요?',
        answer: '수익이 발생한 해에 손실 중인 종목을 함께 매도하여 실현손실이 같은 과세연도에 통산 가능한 경우 예상 과세표준이 낮아질 수 있습니다. 보유 중 평가손실은 확정손실이 아닙니다.',
      },
    ],
    howToSteps: [
      { name: '실현수익 및 손실금액 입력', text: '올해 매도하여 발생한 수익과 보유 중인 손실액을 입력합니다.' },
      { name: '절세 옵션 선택', text: '기본공제 및 손익 상계 매도 체크박스를 선택합니다.' },
      { name: '예상 세액 및 절세액 확인', text: '0.1초 만에 최종 납부 세액과 절세 금액을 확인하고 공유 카드를 생성합니다.' },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(richSnippet) }}
      />
      <CapitalGainsTaxCalculatorView initialPreset={defaultPreset} />
    </>
  );
}
