import React from 'react';
import type { Metadata } from 'next';
import { RealEstateCalculatorView } from '@/components/real-estate-calculator-view';
import { REAL_ESTATE_PRESETS } from '@/config/real-estate-presets.config';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '2026 무료 부동산 월세/임대 수익률 계산기 | 오피스 상가 Cap Rate & ROE 시뮬레이터',
  description: '매매가, 보증금, 월세, 대출금리 입력 시 0.1초 만에 연간 순수익률(Cap Rate), 레버리지 ROE, 월 순현금흐름을 무료 진단합니다. 강남 오피스·판교 스튜디오 10대 프리셋 지원.',
  keywords: [
    '부동산 임대수익률 계산기',
    '오피스텔 월세 수익률',
    '상가 임대수익률 계산',
    'Cap Rate 계산기',
    '부동산 ROE 계산기',
    '월세 계산기',
  ],
  alternates: {
    canonical: 'https://easy-scraping.com/tools/real-estate-calculator',
    languages: {
      'ko-KR': 'https://easy-scraping.com/tools/real-estate-calculator',
      'en-US': 'https://easy-scraping.com/en/tools/real-estate-calculator',
      'ja-JP': 'https://easy-scraping.com/ja/tools/real-estate-calculator',
      'zh-CN': 'https://easy-scraping.com/zh/tools/real-estate-calculator',
      'x-default': 'https://easy-scraping.com/tools/real-estate-calculator',
    },
  },
};

export default function RealEstateCalculatorPage() {
  const defaultPreset = REAL_ESTATE_PRESETS[0];
  const richSnippet = buildCalculatorRichSnippet({
    name: '2026 무료 부동산 월세/임대 수익률 계산기',
    description: '매매가, 보증금, 월세, 대출금리 입력 시 연간 순수익률(Cap Rate) 및 레버리지 ROE를 0.1초 만에 산출하는 실시간 핀테크 도구',
    url: 'https://easy-scraping.com/tools/real-estate-calculator',
    category: 'FinanceApplication',
    faqItems: [
      {
        question: '부동산 임대 순수익률(Net Cap Rate)이란 무엇인가요?',
        answer: '대출을 끼지 않고 총 매수금액 대비 연간 순수 임대료(재산세 및 관리비 차감 후)의 비율을 의미하며, 부동산 자산 자체의 본질적인 수익성을 나타냅니다.',
      },
      {
        question: '레버리지 자기자본 수익률(ROE)은 어떻게 계산되나요?',
        answer: '실제 투자된 본인 자본(매매가 - 보증금 - 대출금) 대비 연간 순수익(월세 - 대출이자 - 세금)의 비율로, 대출 레버리지를 활용했을 때의 순수익률을 뜻합니다.',
      },
    ],
    howToSteps: [
      { name: '매매가 및 보증금 입력', text: '부동산 매입 금액과 세입자 임대 보증금, 월세를 입력합니다.' },
      { name: '대출 조건 설정', text: '대출 원금과 적용 금리(%)를 설정하여 이자 비용을 반영합니다.' },
      { name: '실시간 ROE 및 월 순수익 확인', text: '0.1초 만에 계산된 연간 수익률과 월 순현금흐름을 확인하고 바이럴 카드를 공유합니다.' },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(richSnippet) }}
      />
      <RealEstateCalculatorView initialPreset={defaultPreset} />
    </>
  );
}
