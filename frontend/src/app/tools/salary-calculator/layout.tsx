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
  title: '2026 연봉 실수령액 계산기 — 4대보험·근로소득세·부양가족 공제 실수령 월급 | 월덕 머니버스',
  description:
    '2026년 최신 국민연금, 건강보험, 장기요양, 고용보험 요율과 간이세액표 근로소득세를 적용한 연봉별(3천만~1억) 세후 실수령액과 공제 총액을 실시간으로 확인하세요.',
  keywords: [
    '연봉 실수령액 계산기',
    '2026 연봉 계산기',
    '세후 월급 계산',
    '4대보험 공제액',
    '근로소득세 간이세액표',
    '연봉 5000 실수령액',
    '연봉 1억 실수령액',
    '월급 실수령액 표',
  ],
  alternates: {
    canonical: canonicalUrl('/tools/salary-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/salary-calculator'),
      'en-US': canonicalUrl('/en/tools/salary-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/salary-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/salary-calculator'),
      'x-default': canonicalUrl('/tools/salary-calculator'),
    },
  },
  openGraph: {
    title: '2026 연봉 실수령액 계산기 — 4대보험 및 세후 월급 정밀 계산 | 월덕 머니버스',
    description: '2026년 요율 반영 4대보험 공제액 및 근로소득세 차감 후 실수령 월급 실시간 산출',
    url: canonicalUrl('/tools/salary-calculator'),
    type: 'website',
    images: [
      {
        url: buildOgImageUrl({
          title: '2026 연봉 실수령액 계산기',
          description: '4대보험 요율 · 근로소득세 공제 후 실수령 월급 정밀 비교',
          badge: 'Salary Calculator',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '2026 연봉 실수령액 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 연봉 실수령액 계산기 — 4대보험 및 세후 월급 정밀 계산 | 월덕 머니버스',
    description: '2026년 요율 반영 4대보험 공제액 및 근로소득세 차감 후 실수령 월급 실시간 산출',
  },
};

const FAQS = [
  {
    question: '2026년 4대보험 근로자 부담 요율은 어떻게 되나요?',
    answer:
      '국민연금 4.5%, 건강보험 3.545%, 장기요양보험은 건강보험료의 12.95%(급여 대비 약 0.459%), 고용보험 0.9%가 근로자 급여에서 원천징수됩니다.',
  },
  {
    question: '비과세 식대 한도는 실수령액에 어떻게 반영되나요?',
    answer:
      '식대 비과세 한도는 월 20만 원입니다. 비과세 식대는 4대보험료 및 근로소득세 산정 기준이 되는 과세급여에서 제외되므로 과세표준을 낮춰 실수령액이 증가하는 효과가 있습니다.',
  },
  {
    question: '연봉 5,000만 원 근로자의 실제 월 수령액은 얼마인가요?',
    answer:
      '부양가족 1인(본인), 비과세 식대 20만 원 기준 연봉 5,000만 원 근로자의 세후 월 실수령액은 약 355만~360만 원 수준입니다(4대보험 합계 약 36만 원, 근로소득세 및 지방소득세 약 21만 원 공제).',
  },
];

export default function SalaryCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '2026 연봉 실수령액 계산기', path: '/tools/salary-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '2026 연봉 실수령액 계산기',
    description: '4대보험 및 근로소득세 공제 후 실제 세후 월급을 계산하는 정밀 시뮬레이터',
    urlPath: '/tools/salary-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '2026년 최신 4대보험(국민연금, 건보, 요양, 고용) 요율 자동 적용',
      '국세청 간이세액표 기준 근로소득세 및 지방소득세 정밀 계산',
      '부양가족 수 및 20세 이하 자녀 수에 따른 공제 반영',
      '비과세 식대(월 20만원) 반영 과세표준 절세 효과 산출',
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
