import type { Metadata } from 'next';
import {
  canonicalUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
  softwareApplicationJsonLd,
  buildOgImageUrl,
} from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '주식 물타기·평단가 & 수익률 계산기 — 추가 매수 평단 및 목표 매도가 산출 | 월덕 머니버스',
  description:
    '기존 보유 단가와 수량, 추가 매수가를 입력하여 실시간 평단가 변동을 계산하고 손익분기점 탈출 및 목표 수익률 달성을 위한 매도가를 정밀 산출하세요.',
  keywords: [
    '주식 물타기 계산기',
    '주식 평단가 계산기',
    '추가매수 계산기',
    '평단가 낮추기',
    '주식 수익률 계산기',
    '손익분기점 계산기',
    '가상주식 평단가',
    '물타기 탈출 계산',
  ],
  alternates: {
    canonical: '/tools/stock-calculator',
  },
  openGraph: {
    title: '주식 물타기·평단가 & 수익률 계산기 | 월덕 머니버스',
    description: '추가 매수 시 변동 평단가와 목표 수익률 도달 매도가를 실시간으로 정밀 계산하세요.',
    url: canonicalUrl('/tools/stock-calculator'),
    images: [
      {
        url: buildOgImageUrl({
          title: '주식 물타기·평단가 & 수익률 계산기',
          description: '추가 매수 평단가 · 손익분기점 · 목표 수익률 매도가 산출',
          badge: 'Stock Calculator',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '주식 물타기·평단가 & 수익률 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '주식 물타기·평단가 & 수익률 계산기 | 월덕 머니버스',
    description: '추가 매수 시 변동 평단가와 목표 수익률 도달 매도가를 실시간으로 정밀 계산하세요.',
  },
};

const FAQS = [
  {
    question: '주식 물타기 계산 공식은 어떻게 되나요?',
    answer:
      '최종 평단가는 (1차 매수가 × 1차 수량 + 추가 매수가 × 추가 수량) ÷ (총 보유 수량)으로 계산됩니다. 수수료 및 제세금이 포함된 실질 손익분기 매도가도 함께 산출됩니다.',
  },
  {
    question: '목표 수익률 달성을 위한 매도가는 어떻게 구하나요?',
    answer:
      '산출된 최종 평단가에 목표 수익률(%)과 왕복 거래 수수료를 가산하여 목표 수익을 실현할 수 있는 호가 단위 기준 매도가를 역산합니다.',
  },
  {
    question: '가상 종목 시세와 자동 연동되나요?',
    answer:
      '침팬지 반도체(CHIPS), 월덕 인더스트리(DUCKS), 도지 밈 파이낸스(COIN) 등 10대 가상 종목의 실시간 호가 버튼을 클릭하면 현재가가 자동으로 입력됩니다.',
  },
];

export default function StockCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '주식 물타기·평단가 계산기', path: '/tools/stock-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '주식 물타기·평단가 & 수익률 계산기',
    description: '추가 매수 평단가 변동 및 손익분기점 탈출 매도가를 계산하는 무료 실시간 주식 시뮬레이터',
    urlPath: '/tools/stock-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '추가 매수 물타기 평단가 실시간 산출',
      '손익분기점 탈출 매도가 및 수익률 역산',
      '10대 가상 주식 실시간 호가 원클릭 프리셋',
      '거래 수수료 및 세금 공제 정밀 계산',
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(appSchema) }}
      />
      {children}
    </>
  );
}
