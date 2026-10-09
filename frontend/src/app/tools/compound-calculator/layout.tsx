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
  title: '복리·CAGR 계산기 — 연평균 복리수익률 & DCA 적립식 월복리 시뮬레이터 | 월덕 머니버스',
  description:
    'CAGR(연평균 복리 수익률)과 DCA(적립식 분할투자) 효과를 실시간 시뮬레이션! 초기 예치 원금, 매월 적립액, 연 이자율, 투자 기간별 만기 수령액과 단리 대비 복리 초과 수익을 정밀 계산하세요.',
  keywords: [
    'cagr',
    'cagr 계산기',
    '복리 계산기',
    '연평균 복리수익률',
    'dca 효과',
    '적립식 복리 계산기',
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
    title: '복리·CAGR 계산기 — 연평균 복리수익률 & DCA 적립식 시뮬레이터 | 월덕 머니버스',
    description: 'CAGR 공식과 DCA 적립식 분할투자 효과, 일/월/연 복리 만기 수령액을 실시간 정밀 시뮬레이션하세요.',
    url: canonicalUrl('/tools/compound-calculator'),
    images: [
      {
        url: buildOgImageUrl({
          title: '복리·CAGR 계산기',
          description: '연평균 복리수익률(CAGR) · DCA 적립식 월복리 만기 시뮬레이터',
          badge: 'CAGR & Compound',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '복리·CAGR 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '복리·CAGR 계산기 — 연평균 복리수익률 & DCA 적립식 시뮬레이터 | 월덕 머니버스',
    description: 'CAGR 공식과 DCA 적립식 분할투자 효과, 일/월/연 복리 만기 수령액을 실시간 정밀 시뮬레이션하세요.',
  },
};

const FAQS = [
  {
    question: 'CAGR(연평균 복리 수익률)이란 무엇이며 어떻게 계산하나요?',
    answer:
      'CAGR(Compound Annual Growth Rate)은 여러 해 동안의 투자 수익률을 매년 일정한 복리로 성장했다고 가정한 연평균 성장률입니다. 공식은 [(최종 가치 / 초기 원금) ^ (1 / 기간)] - 1 이며, 변동성이 큰 주식·펀드·부동산 투자의 장기 실질 성과를 측정하는 글로벌 표준 지표입니다.',
  },
  {
    question: 'DCA(달러 코스트 애버리징) 적립식 투자의 복리 효과는 무엇인가요?',
    answer:
      'DCA(Dollar-Cost Averaging)는 시장 가격의 고점·저점에 연연하지 않고 정기적으로 일정 금액을 분할 매수하는 적립식 투자 기법입니다. 매월 적립된 원금에 복리 이자가 누적되면서 장기적으로 평균 매수 단가는 낮아지고 복리 수익률은 극대화됩니다.',
  },
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
