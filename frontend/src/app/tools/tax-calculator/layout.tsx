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
  title: '가상자산·금융투자 세금 계산기 — 2026/2027 양도소득세 & 배당소득세 | 월덕 머니버스',
  description:
    '가상자산 매매 차익 22% 양도소득세, 해외주식 기본공제 250만 원, 배당소득세 15.4% 및 금융소득 종합과세(2,000만 원 초과 시 건보료 피부양자 영향)를 실시간 정밀 계산하세요.',
  keywords: [
    '가상자산 세금 계산기',
    '코인 세금 계산기',
    '가상자산 양도소득세',
    '해외주식 양도소득세 계산기',
    '배당소득세 계산기',
    '금융소득종합과세',
    '건보료 피부양자 탈락 기준',
    '비트코인 세금',
  ],
  alternates: {
    canonical: '/tools/tax-calculator',
  },
  openGraph: {
    title: '가상자산·금융투자 세금 계산기 | 월덕 머니버스',
    description: '가상자산·해외주식 22% 양도소득세와 배당소득세 15.4%를 실시간 정밀 계산하고 절세 전략을 수립하세요.',
    url: canonicalUrl('/tools/tax-calculator'),
    images: [
      {
        url: buildOgImageUrl({
          title: '가상자산·금융투자 세금 계산기',
          description: '2026/2027 가상자산 22% 양도세 · 배당소득세 및 건보료 영향 시뮬레이터',
          badge: 'Tax Calculator',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '가상자산·금융투자 세금 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '가상자산·금융투자 세금 계산기 | 월덕 머니버스',
    description: '가상자산·해외주식 22% 양도소득세와 배당소득세 15.4%를 실시간 정밀 계산하고 절세 전략을 수립하세요.',
  },
};

const FAQS = [
  {
    question: '가상자산(코인) 과세 세율과 기본공제액은 얼마인가요?',
    answer:
      '가상자산 양도차익은 기타소득 또는 금융투자소득 체계로 분류되며, 양도차익에서 기본공제(연 250만 원, 개정안 5,000만 원 논의)를 차감한 과세표준에 국세 20% + 지방소득세 2% = 총 22% 단일 세율이 적용됩니다.',
  },
  {
    question: '해외주식과 가상자산은 손익 통산이 가능한가요?',
    answer:
      '현행 세법상 해외주식과 가상자산은 소득 분류가 달라 상호 손익 통산이 불가능합니다. 해외주식 매매 손익은 해외주식 상호 간에만 통산되며, 가상자산 매매 손익 역시 가상자산 거래 간에만 통산됩니다.',
  },
  {
    question: '배당소득이 2,000만 원을 초과하면 어떤 불이익이 있나요?',
    answer:
      '연간 금융소득(이자+배당)이 2,000만 원을 초과하면 2,000만 원 초과분이 다른 소득(근로·사업소득 등)과 합산되어 기본 누진세율(최대 49.5%)이 적용되는 금융소득종합과세 대상이 됩니다. 또한 건강보험 피부양자 자격이 즉시 박탈되어 지역가입자로 전환될 수 있습니다.',
  },
];

export default function TaxCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '가상자산·금융투자 세금 계산기', path: '/tools/tax-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '가상자산·금융투자 세금 계산기',
    description: '가상자산 양도소득세 22%, 해외주식 기본공제 250만 원, 배당소득세 15.4% 및 건보료 피부양자 영향을 정밀 계산하는 무료 웹 도구',
    urlPath: '/tools/tax-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '가상자산 22% 단일세율 및 250만/5000만 기본공제 시뮬레이션',
      '해외주식 매매차익 및 손실상계 반영 양도소득세 계산',
      '배당소득 15.4% 원천징수 및 2천만원 초과 종합과세 감지',
      '건강보험 피부양자 자격 박탈 위험 실시간 경고',
      '합법적 절세 팁(손익 상계, 분할 매도) 가이드 제공',
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
