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
  title: '국민연금 & 은퇴 자금 계산기 — 예상 연금 수령액·FIRE 조기은퇴 은퇴자금 시뮬레이터 | 월덕 머니버스',
  description:
    '국민연금 가입 기간 및 월 소득에 따른 만 65세 예상 노령연금액, 은퇴 후 필요한 월 생활비 충당을 위한 총 은퇴 필요자금(4% 룰) 및 은퇴 가능 시점을 실시간 시뮬레이션하세요.',
  keywords: [
    '은퇴 계산기',
    '국민연금 예상 수령액',
    '노후 준비 자금 계산',
    'FIRE족 은퇴자금',
    '4%의 법칙 은퇴',
    '은퇴 생활비 계산',
    '국민연금 만기 수령',
    '조기은퇴 시뮬레이터',
  ],
  alternates: {
    canonical: canonicalUrl('/tools/retirement-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/retirement-calculator'),
      'en-US': canonicalUrl('/en/tools/retirement-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/retirement-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/retirement-calculator'),
      'x-default': canonicalUrl('/tools/retirement-calculator'),
    },
  },
  openGraph: {
    title: '국민연금 & 은퇴 자금 계산기 — 예상 연금 수령액 및 FIRE 목표자산 | 월덕 머니버스',
    description: '국민연금 예상 노령연금액 산출 및 4% 룰 기반 은퇴 자금 필요액 시뮬레이터',
    url: canonicalUrl('/tools/retirement-calculator'),
    type: 'website',
    images: [
      {
        url: buildOgImageUrl({
          title: '국민연금 & 은퇴 자금 계산기',
          description: '국민연금 예상 수령액 · 은퇴 목표자산 4% 룰 시뮬레이터',
          badge: 'Retirement & NPS',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '국민연금 & 은퇴 자금 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '국민연금 & 은퇴 자금 계산기 — 예상 연금 수령액 및 FIRE 목표자산 | 월덕 머니버스',
    description: '국민연금 예상 노령연금액 산출 및 4% 룰 기반 은퇴 자금 필요액 시뮬레이터',
  },
};

const FAQS = [
  {
    question: '국민연금 예상 수령액은 어떻게 결정되나요?',
    answer:
      '국민연금 노령연금액은 가입자의 평균 소득월액(B값)과 전체 가입자의 평균 소득월액(A값), 그리고 총 가입 기간(최소 10년 이상)에 의해 소득대체율에 따라 산정됩니다. 가입 기간이 10년을 초과하는 매 1년마다 기본연금액이 증액됩니다.',
  },
  {
    question: 'FIRE족의 은퇴 자금 4% 룰(Trinity Study)이란 무엇인가요?',
    answer:
      '은퇴 첫해에 총 투자 자산의 4%를 인출하고, 이후 매년 물가상승률만큼 인출액을 조정하더라도 주식/채권 포트폴리오의 장기 복리 성장 덕분에 30년 이상 자산이 고갈되지 않을 확률이 95% 이상이라는 금융 이론입니다. 즉, 연간 생활비의 25배를 모으면 경제적 자유를 달성할 수 있습니다.',
  },
  {
    question: '조기노령연금과 연기연금의 차이는 무엇인가요?',
    answer:
      '정상 수령 나이보다 최대 5년 일찍 수령하는 조기노령연금은 1년당 6%(최대 30%) 감액되며, 반대로 수령 시기를 최대 5년 늦추는 연기연금은 1년당 7.2%(최대 36%) 증액되어 지급됩니다.',
  },
];

export default function RetirementCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '국민연금 & 은퇴 자금 계산기', path: '/tools/retirement-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '국민연금 & 은퇴 자금 계산기',
    description: '가입기간별 국민연금 예상 수령액과 4% 룰 기반 은퇴 필요자산 계산 시뮬레이터',
    urlPath: '/tools/retirement-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '국민연금 소득대체율 기반 만 65세 예상 노령연금액 산출',
      '목표 월 생활비 대비 은퇴 필요 총자산(25배수) 역산',
      '조기은퇴(FIRE) 달성 가능 시점 타임라인 제공',
      '물가상승률 및 투자수익률 반영 자산 지속성 분석',
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
