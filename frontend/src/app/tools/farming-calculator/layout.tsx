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
  title: '직업별 일일 파밍 수익 시뮬레이터 — 5대 전문직 숙련도 & 복리 예금 최적화 | 월덕 머니버스',
  description:
    '개발자, 트레이더, 광부, 요리사, 보안관 5대 전문 직업의 숙련도 레벨과 일일 퀘스트, 가상 은행 복리 이자를 결합한 30일/1년 누적 WLD 자산 성장을 실시간 시뮬레이션하세요.',
  keywords: [
    '직업 파밍 계산기',
    '가상경제 수익 계산기',
    '앱테크 파밍 루틴',
    '일일 퀘스트 수익',
    '숙련도 레벨 보너스',
    'WLD 채굴 시뮬레이션',
    '월덕 머니버스 직업',
  ],
  alternates: {
    canonical: '/tools/farming-calculator',
  },
  openGraph: {
    title: '직업별 일일 파밍 수익 시뮬레이터 | 월덕 머니버스',
    description: '5대 전문 직업 숙련도 레벨별 일일 WLD 기대 수익 및 30일/1년 복리 누적 자산 시뮬레이터',
    url: canonicalUrl('/tools/farming-calculator'),
    images: [
      {
        url: buildOgImageUrl({
          title: '직업별 일일 파밍 수익 시뮬레이터',
          description: '5대 전문직 숙련도 · 일일 퀘스트 보상 · 은행 복리 결합 시뮬레이션',
          badge: 'Farming Calculator',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '직업별 일일 파밍 수익 시뮬레이터',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '직업별 일일 파밍 수익 시뮬레이터 | 월덕 머니버스',
    description: '5대 전문 직업 숙련도 레벨별 일일 WLD 기대 수익 및 30일/1년 복리 누적 자산 시뮬레이터',
  },
};

const FAQS = [
  {
    question: '직업 숙련도 레벨이 오르면 파밍 보상이 얼마나 증가하나요?',
    answer:
      '각 직업의 숙련도 레벨이 1단계 오를 때마다 기본 업무 완료 보상이 +15%씩 누적 복리로 증가하며, 최대 10레벨 달성 시 기본 보상의 약 3.5배를 수령합니다.',
  },
  {
    question: '일일 퀘스트 보상과 결합하면 하루에 얼마를 벌 수 있나요?',
    answer:
      '5회 업무 수행과 4종 일일 퀘스트를 모두 완료하면 5레벨 기준 하루 약 12,000 ~ 15,000 WLD의 순수익을 달성할 수 있습니다.',
  },
  {
    question: '파밍한 WLD를 가상 은행에 예치하면 추가 수익이 발생하나요?',
    answer:
      '일일 파밍 수익을 가상 중앙은행 10% APY 복리 계좌에 자동 예치할 경우 30일 후 원금 대비 약 108% 이상의 복리 증식 효과를 얻을 수 있습니다.',
  },
];

export default function FarmingCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '직업별 일일 파밍 시뮬레이터', path: '/tools/farming-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '직업별 일일 파밍 수익 시뮬레이터',
    description: '5대 직업 숙련도와 일일 퀘스트를 반영한 WLD 자산 성장 예측 웹 시뮬레이터',
    urlPath: '/tools/farming-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '5대 전문 직업(개발자, 트레이더, 광부, 요리사, 보안관) 지원',
      '숙련도 레벨(1~10)에 따른 실시간 기대수익 곡선 계산',
      '일일 퀘스트 및 가상은행 복리 예금 결합 시뮬레이션',
      '30일/1년 누적 자산 성장 예측 차트',
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
