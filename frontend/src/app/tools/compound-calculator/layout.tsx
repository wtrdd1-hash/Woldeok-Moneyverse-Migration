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
  title: '복리 예금·적금 이자 계산기 — 일/월/연 복리 및 만기 수령액 시뮬레이터 | 월덕 머니버스',
  description:
    '초기 예치 원금, 매월 적립액, 연 이자율, 투자 기간을 입력하여 만기 수령액과 단리 대비 복리 초과 수익을 실시간으로 정밀 계산하세요.',
  keywords: [
    '복리 계산기',
    '예금 이자 계산기',
    '적금 이자 계산기',
    '복리 수익률 계산',
    '월복리 계산기',
    '일복리 계산기',
    '72의 법칙',
    '목돈 굴리기 계산기',
  ],
  alternates: {
    canonical: '/tools/compound-calculator',
  },
  openGraph: {
    title: '복리 예금·적금 이자 계산기 | 월덕 머니버스',
    description: '초기 원금과 매월 적립액, 연 이자율로 만기 수령액과 복리 초과 수익을 실시간 시뮬레이션하세요.',
    url: canonicalUrl('/tools/compound-calculator'),
    images: [
      {
        url: buildOgImageUrl({
          title: '복리 예금·적금 이자 계산기',
          description: '일/월/연 복리 만기 수령액 · 단리 대비 초과 수익 시뮬레이터',
          badge: 'Compound Calculator',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '복리 예금·적금 이자 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '복리 예금·적금 이자 계산기 | 월덕 머니버스',
    description: '초기 원금과 매월 적립액, 연 이자율로 만기 수령액과 복리 초과 수익을 실시간 시뮬레이션하세요.',
  },
};

const FAQS = [
  {
    question: '복리와 단리의 차이점은 무엇인가요?',
    answer:
      '단리는 초기 원금에 대해서만 이자가 붙지만, 복리는 원금에 더해 발생한 이자에도 다음 주기에 다시 이자가 붙는 구조입니다. 따라서 기간이 길어질수록 자산 성장 속도가 기하급수적으로 빨라집니다.',
  },
  {
    question: '복리 계산 주기가 수익에 어떤 영향을 미치나요?',
    answer:
      '동일한 연 이자율이라도 이자가 재투자되는 주기(일복리 > 월복리 > 연복리)가 짧을수록 실효 이자율(APY)이 높아져 더 많은 이자 수익을 얻을 수 있습니다.',
  },
  {
    question: '월덕 머니버스 가상 은행 예금 이자율은 얼마인가요?',
    answer:
      '월덕 머니버스 가상 중앙은행에서는 기본 연 5%에서 프레스티지 등급 및 챌린지 팟 참여 시 최대 연 15% 복리 이자율을 제공합니다.',
  },
];

export default function CompoundCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '복리 예금·적금 이자 계산기', path: '/tools/compound-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '복리 예금·적금 이자 계산기',
    description: '일/월/연 복리 주기별 만기 수령액과 단리 대비 초과 수익을 계산하는 실시간 웹 시뮬레이터',
    urlPath: '/tools/compound-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '일복리/월복리/연복리 비교 계산',
      '매월 추가 적립액 반영 적금 시뮬레이션',
      '연도별 누적 자산 성장 타임라인 표 제공',
      '원화(KRW) 및 WLD 가상화폐 완벽 지원',
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
