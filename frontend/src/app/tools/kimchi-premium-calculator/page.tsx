import React from 'react';
import type { Metadata } from 'next';
import { KimchiPremiumCalculatorView } from '@/components/kimchi-premium-calculator-view';
import { KIMCHI_PREMIUM_PRESETS } from '@/config/kimchi-premium-presets.config';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '2026 무료 코인 김치프리미엄 계산기 | 업비트 바이낸스 실시간 시세 격차 & 차익거래 시뮬레이터',
  description: '비트코인, 이더리움, 리플, 솔라나 등 10대 코인의 국내외 실시간 김치프리미엄(김프/역프)과 환율, 전송 수수료 차감 후 순차익을 0.1초 만에 무료 계산합니다.',
  keywords: [
    '김치프리미엄 계산기',
    '코인 김프 계산기',
    '비트코인 김치프리미엄',
    '업비트 바이낸스 가격차이',
    '코인 보따리 차익거래',
    '가상화폐 환율 계산기',
  ],
  alternates: {
    canonical: 'https://easy-scraping.com/tools/kimchi-premium-calculator',
    languages: {
      'ko-KR': 'https://easy-scraping.com/tools/kimchi-premium-calculator',
      'en-US': 'https://easy-scraping.com/en/tools/kimchi-premium-calculator',
      'ja-JP': 'https://easy-scraping.com/ja/tools/kimchi-premium-calculator',
      'zh-CN': 'https://easy-scraping.com/zh/tools/kimchi-premium-calculator',
      'x-default': 'https://easy-scraping.com/tools/kimchi-premium-calculator',
    },
  },
};

export default function KimchiPremiumCalculatorPage() {
  const defaultPreset = KIMCHI_PREMIUM_PRESETS[0];
  const richSnippet = buildCalculatorRichSnippet({
    name: '2026 무료 코인 김치프리미엄 & 환율 차익 계산기',
    description: '업비트/빗썸과 바이낸스/바이비트 간의 실시간 김치프리미엄(%)과 코인 전송 수수료를 반영한 재정거래 순수익 시뮬레이터',
    url: 'https://easy-scraping.com/tools/kimchi-premium-calculator',
    category: 'FinanceApplication',
    faqItems: [
      {
        question: '김치프리미엄(Kimchi Premium)이란 무엇인가요?',
        answer: '국내 암호화폐 거래소의 원화(KRW) 가격이 해외 거래소의 달러(USD) 환산 가격보다 높게 형성되는 현상을 의미합니다.',
      },
      {
        question: '역프리미엄(역프)일 때는 어떻게 거래하는 것이 유리한가요?',
        answer: '국내 거래소 가격이 해외보다 저렴한 상태이므로 국내에서 코인을 매수하여 해외로 전송하거나 장기 보유하기에 최적의 시기입니다.',
      },
    ],
    howToSteps: [
      { name: '코인 및 거래소 시세 확인', text: '국내 가격과 해외 가격, USD/KRW 환율을 확인합니다.' },
      { name: '투자금액 및 전송 수수료 입력', text: '차익 거래를 진행할 금액과 코인별 출금 수수료를 입력합니다.' },
      { name: '실시간 김프 및 순차익 확인', text: '전송 수수료 차감 후 최종 순차익과 진단서를 확인합니다.' },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(richSnippet) }}
      />
      <KimchiPremiumCalculatorView initialPreset={defaultPreset} />
    </>
  );
}
