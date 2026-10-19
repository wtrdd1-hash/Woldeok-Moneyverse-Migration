import type { Metadata } from 'next';
import {
  canonicalUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
  softwareApplicationJsonLd,
} from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'FIRE족 조기은퇴 4% 룰 계산기 — [무료] 목표 은퇴자산 & 안전 인출률 30년 시뮬레이션 | 월덕 머니버스',
  description:
    '[로그인 없이 1초 산출] 현재 자산, 월 저축액, 기대 투자수익률로 조기 은퇴 가능 연도와 트리니티 4% 법칙 필요 순자산을 즉시 계산! Lean/Fat/Barista FIRE 유형별 맞춤 로드맵 정밀 시뮬레이터.',
  keywords: [
    'fire족 계산기',
    '조기은퇴 계산기',
    '4프로 룰 계산기',
    '트리니티 스터디',
    '은퇴 자금 계산기',
    'lean fire 계산',
    '안전 인출률 시뮬레이션',
    '파이어족 자산 목표',
  ],
  alternates: {
    canonical: canonicalUrl('/tools/fire-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/fire-calculator'),
      'en-US': canonicalUrl('/en/tools/fire-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/fire-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/fire-calculator'),
      'x-default': canonicalUrl('/tools/fire-calculator'),
    },
  },
  openGraph: {
    title: 'FIRE족 조기은퇴 4% 룰 계산기 — 목표 은퇴자산 시뮬레이터 | 월덕 머니버스',
    description: '트리니티 대학교 4% 안전 인출률에 기반한 은퇴 가능 시점 및 30년 자산 고갈 방어 시뮬레이션',
    url: canonicalUrl('/tools/fire-calculator'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIRE족 조기은퇴 4% 룰 계산기 — [무료] 은퇴자산 시뮬레이터 | 월덕 머니버스',
    description: '조기은퇴 필요 자산과 4% 안전 인출률 실시간 정밀 시뮬레이터',
  },
};

const BREADCRUMB_SCHEMA = breadcrumbJsonLd([
  { name: '홈', url: '/' },
  { name: '금융 도구 허브', url: '/tools' },
  { name: 'FIRE 조기은퇴 계산기', url: '/tools/fire-calculator' },
]);

const FAQ_SCHEMA = faqPageJsonLd([
  {
    question: 'FIRE족의 4% 룰(Four Percent Rule)이란 무엇인가요?',
    answer:
      '미국 트리니티 대학의 연구에 따르면, 총 은퇴 자산의 4%를 첫해에 생활비로 인출하고 매년 물가상승률만큼 증액 인출하더라도 30년 이상 자산이 고갈되지 않을 확률이 95% 이상이라는 금융 통계 법칙입니다. 따라서 연간 생활비의 25배를 모으면 경제적 자유를 달성한 것으로 간주합니다.',
  },
  {
    question: 'Lean FIRE와 Fat FIRE의 차이는 무엇인가요?',
    answer:
      'Lean FIRE는 극단적인 절약으로 최소 생활비(예: 월 150~200만 원)만 인출하여 빠르게 은퇴하는 방식이며, Fat FIRE는 풍요로운 생활비(예: 월 500~1,000만 원 이상)를 유지하며 여유롭게 은퇴하는 방식입니다.',
  },
]);

const APP_SCHEMA = softwareApplicationJsonLd({
  name: 'FIRE족 조기은퇴 4% 룰 계산기',
  description: '트리니티 4% 안전 인출률 기반 은퇴 목표 자산 및 달성 가능 연도 실시간 시뮬레이터',
  path: '/tools/fire-calculator',
  applicationCategory: 'FinanceApplication',
});

export default function FireCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(BREADCRUMB_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(FAQ_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(APP_SCHEMA) }}
      />
      {children}
    </>
  );
}
