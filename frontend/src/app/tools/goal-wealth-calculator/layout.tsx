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
  title: '목표 자산·은퇴·FIRE 달성 계산기 — 4% 룰 및 자금 고갈 시뮬레이터 | 월덕 머니버스',
  description:
    '현재 순자산, 매월 저축액, 연 투자수익률, 은퇴 후 월 소비액을 입력하여 목표 금액 달성 시점과 4% 룰(Trinity Study) 기반 은퇴 자금 유지 기간을 정밀 시뮬레이션하세요.',
  keywords: [
    'FIRE 계산기',
    '조기은퇴 계산기',
    '목표 자산 계산기',
    '4% 룰',
    '은퇴 자금 고갈 시뮬레이터',
    '목돈 모으기 계산기',
    '재정적 자유 계산기',
    '복리 시뮬레이터',
  ],
  alternates: {
    canonical: '/tools/goal-wealth-calculator',
  },
  openGraph: {
    title: '목표 자산·은퇴·FIRE 달성 계산기 | 월덕 머니버스',
    description: '현재 자산과 월 저축액, 투자 수익률로 은퇴 시점과 4% 룰 안전 인출 기간을 실시간 시뮬레이션하세요.',
    url: canonicalUrl('/tools/goal-wealth-calculator'),
    images: [
      {
        url: buildOgImageUrl({
          title: '목표 자산·은퇴·FIRE 계산기',
          description: '4% 룰 기반 조기은퇴 시점 및 자금 수명 시뮬레이터',
          badge: 'FIRE & Wealth Calculator',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '목표 자산·은퇴·FIRE 달성 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '목표 자산·은퇴·FIRE 달성 계산기 | 월덕 머니버스',
    description: '현재 자산과 월 저축액, 투자 수익률로 은퇴 시점과 4% 룰 안전 인출 기간을 실시간 시뮬레이션하세요.',
  },
};

const FAQS = [
  {
    question: 'FIRE족(Financial Independence, Retire Early)과 4% 룰이란 무엇인가요?',
    answer:
      'FIRE는 조기 은퇴를 목표로 저축과 투자를 극대화하는 운동입니다. 트리니티 대학의 연구에서 유래한 4% 룰은 은퇴 첫해에 총 자산의 4%를 인출하고 매년 인플레이션만큼 조정하여 인출하면 30년 이상 자산이 고갈되지 않을 확률이 95% 이상이라는 원칙입니다.',
  },
  {
    question: '인플레이션(물가상승률)은 계산에 어떻게 반영되나요?',
    answer:
      '명목 수익률에서 인플레이션율을 조정한 실질 수익률(Fisher 방정식)을 적용하여, 수십 년 후 목표 자산에 도달했을 때의 미래 화폐 가치가 현재의 구매력 기준으로 얼마인지 정확하게 환산합니다.',
  },
  {
    question: '월덕 머니버스에서 가상 자산(WLD)으로도 시뮬레이션할 수 있나요?',
    answer:
      '네, 원화(KRW) 수치뿐만 아니라 머니버스 가상경제의 WLD 통화 단위로도 동일하게 목표 자산 및 파밍 저축액을 대입하여 시뮬레이션할 수 있습니다.',
  },
];

export default function GoalWealthCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '목표 자산·은퇴·FIRE 달성 계산기', path: '/tools/goal-wealth-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '목표 자산·은퇴·FIRE 달성 계산기',
    description: '현재 자산, 월 저축액, 기대수익률, 은퇴 소비액을 분석하여 목표 달성 기간과 4% 룰 자금 수명을 시뮬레이션하는 무료 웹 도구',
    urlPath: '/tools/goal-wealth-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '목표 자산 도달 소요 개월/연도 역산',
      '4% 룰 기반 연간/월간 안전 인출액 산출',
      '인플레이션 반영 실질 자산 성장 시뮬레이션',
      '은퇴 후 자금 고갈 시점 타임라인 표 제공',
      '사회초년생/FIRE족/안정형 노후 3대 프리셋 원터치 적용',
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
