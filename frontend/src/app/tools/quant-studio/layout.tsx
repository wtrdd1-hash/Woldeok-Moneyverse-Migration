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
  title: '노코드 퀀트 시뮬레이션 — DCA·그리드·RSI 교육용 샘플 | 월덕 머니버스',
  description:
    '교육용 샘플 가격으로 DCA·그리드·RSI 전략을 모의 계산합니다. 실제 주문을 실행하지 않으며 과거 시장 데이터 검증을 제공하지 않습니다.',
  keywords: [
    '노코드 퀀트',
    '퀀트 봇 스튜디오',
    '주식 그리드 매매',
    'DCA 분할매수 봇',
    'RSI 퀀트 전략',
    '주식 백테스팅 시뮬레이터',
    '자동매매 봇',
    '월덕 머니버스 퀀트',
  ],
  alternates: {
    canonical: '/tools/quant-studio',
  },
  openGraph: {
    title: '노코드 퀀트 봇 스튜디오 | 월덕 머니버스',
    description: '교육용 샘플 가격을 이용한 DCA/그리드/RSI 모의 계산 도구입니다. 실제 주문을 실행하지 않습니다.',
    url: canonicalUrl('/tools/quant-studio'),
    images: [
      {
        url: buildOgImageUrl({
          title: '노코드 퀀트 봇 스튜디오',
          description: 'DCA · 그리드 · RSI 교육용 샘플 시뮬레이터',
          badge: 'Quant Studio',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '노코드 퀀트 봇 스튜디오',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '노코드 퀀트 봇 스튜디오 | 월덕 머니버스',
    description: '교육용 샘플 가격을 이용한 DCA/그리드/RSI 모의 계산 도구입니다. 실제 주문을 실행하지 않습니다.',
  },
};

const FAQS = [
  {
    question: '노코드 퀀트 봇 스튜디오는 코딩 지식이 없어도 쓸 수 있나요?',
    answer:
      '네, 코딩 없이 교육용 DCA·그리드·RSI 모의 전략을 구성할 수 있습니다. 실제 자동매매 봇이 생성되지는 않습니다.',
  },
  {
    question: '백테스팅 시뮬레이션은 어떤 데이터를 기반으로 작동하나요?',
    answer:
      '고정된 교육용 샘플 가격 배열로 계산합니다. 실제 과거 틱 데이터나 검증된 투자 성과를 제공하지 않습니다.',
  },
  {
    question: '생성한 봇을 실전 가상 거래에 투입할 수 있나요?',
    answer:
      '아니요. 전략과 성과는 교육용 시뮬레이션이며 실제 주문을 체결하지 않습니다.',
  },
];

export default function QuantStudioLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '노코드 퀀트 봇 스튜디오', path: '/tools/quant-studio' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '노코드 퀀트 봇 스튜디오',
    description: '코딩 없이 DCA/그리드/RSI 퀀트 전략을 설계하고 백테스팅하는 웹 시뮬레이터',
    urlPath: '/tools/quant-studio',
    applicationCategory: 'FinanceApplication',
    features: [
      'DCA 분할매수 / 그리드 차익 / RSI 모멘텀 전략 프리셋',
      '샘플 가격 기반 모의 계산 (승률, 수익률, MDD)',
      '고정 샘플 가격 기반 전략 계산',
      '익절 및 손절 조건의 교육용 시뮬레이션',
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
