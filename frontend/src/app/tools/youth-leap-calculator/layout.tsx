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
  title: '청년도약계좌 만기 수령액 계산기 — 5,000만원 목돈 만들기 & 정부기여금 비과세 시뮬레이터 | 월덕 머니버스',
  description:
    '청년도약계좌 월 70만원 5년 납입 시 은행 최고금리(최대 6.0%)와 정부기여금(월 최대 3.3만원 매칭) 및 이자소득세 전액 비과세 혜택을 반영한 만기 실수령액(최대 5,000만원)을 실시간으로 확인하세요.',
  keywords: [
    '청년도약계좌 계산기',
    '청년도약계좌 만기 수령액',
    '청년도약계좌 정부기여금',
    '5000만원 모으기',
    '청년도약계좌 비과세',
    '청년도약계좌 이자',
    '청년도약계좌 조건',
    '청년 적금 계산기',
  ],
  alternates: {
    canonical: canonicalUrl('/tools/youth-leap-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/youth-leap-calculator'),
      'en-US': canonicalUrl('/en/tools/youth-leap-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/youth-leap-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/youth-leap-calculator'),
      'x-default': canonicalUrl('/tools/youth-leap-calculator'),
    },
  },
  openGraph: {
    title: '청년도약계좌 만기 수령액 계산기 — 5,000만원 정부기여금 & 비과세 | 월덕 머니버스',
    description: '월 70만원 납입 시 정부기여금 매칭과 비과세 복리 이자 합산 만기 수령액 실시간 시뮬레이션',
    url: canonicalUrl('/tools/youth-leap-calculator'),
    type: 'website',
    images: [
      {
        url: buildOgImageUrl({
          title: '청년도약계좌 계산기',
          description: '5,000만원 목돈 만들기 · 정부기여금 & 비과세 혜택 시뮬레이터',
          badge: 'Youth Leap Account',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '청년도약계좌 만기 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '청년도약계좌 만기 수령액 계산기 — 5,000만원 정부기여금 & 비과세 | 월덕 머니버스',
    description: '월 70만원 납입 시 정부기여금 매칭과 비과세 복리 이자 합산 만기 수령액 실시간 시뮬레이션',
  },
};

const FAQS = [
  {
    question: '청년도약계좌 만기 시 실제로 얼마를 수령할 수 있나요?',
    answer:
      '매월 70만 원씩 5년간 총 4,200만 원을 납입할 경우, 은행 이자(최고 연 6.0% 가정 시 약 640만 원)와 정부 기여금(최대 약 144만 원) 및 전액 비과세 혜택이 더해져 만기 시 약 4,900만~5,000만 원 수준의 목돈을 수령할 수 있습니다.',
  },
  {
    question: '정부기여금 지급 기준과 매칭 비율은 어떻게 되나요?',
    answer:
      '개인 소득(총급여 2,400만 원 이하, 3,600만 원 이하, 4,800만 원 이하 등 구간별 차등)에 따라 월 최대 2.1만~3.3만 원의 기여금이 매칭 적립되며, 육아휴직자 및 청년 우대 정책에 따라 기여금 한도가 추가 상향됩니다.',
  },
  {
    question: '청년도약계좌 이자소득세 15.4% 비과세 혜택의 가치는 얼마인가요?',
    answer:
      '일반 적금의 경우 발생 이자에 대해 15.4%의 소득세가 원천징수되지만, 청년도약계좌는 조세특례제한법에 따라 전액 비과세되므로 약 100만 원 상당의 세금을 전액 절약할 수 있습니다.',
  },
];

export default function YouthLeapCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '청년도약계좌 만기 수령액 계산기', path: '/tools/youth-leap-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '청년도약계좌 만기 수령액 계산기',
    description: '정부기여금 매칭과 비과세 이자 합산 5,000만원 목돈 수령액 시뮬레이터',
    urlPath: '/tools/youth-leap-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '월 납입금(10만~70만원) 및 기간별 만기 원리금 산출',
      '개인소득 구간별 정부기여금 매칭 금액 자동 반영',
      '일반 적금(15.4% 과세) 대비 비과세 절세 이자 비교',
      '5년 누적 자산 형성 그래프 및 타임라인 제공',
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
