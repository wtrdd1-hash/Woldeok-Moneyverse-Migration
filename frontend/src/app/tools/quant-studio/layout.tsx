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
  title: '노코드 퀀트 전략 연습 — DCA·그리드·RSI 예시 시뮬레이션 | 월덕 머니버스',
  description:
    'DCA·그리드·RSI 전략을 가상 예시 가격으로 연습하는 교육용 시뮬레이션입니다. 실제 시세·주문·검증된 수익률을 제공하지 않습니다.',
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
    description: '코딩 없는 알고리즘 봇 설계, DCA/그리드/RSI 가상 예시 기반 연습 도구입니다. 실제 거래나 검증된 백테스트가 아닙니다.',
    url: canonicalUrl('/tools/quant-studio'),
    images: [
      {
        url: buildOgImageUrl({
          title: '노코드 퀀트 봇 스튜디오',
          description: 'DCA · 그리드 · RSI 전략 예시 시뮬레이터',
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
    description: '코딩 없는 알고리즘 봇 설계, DCA/그리드/RSI 가상 예시 기반 연습 도구입니다. 실제 거래나 검증된 백테스트가 아닙니다.',
  },
};

const FAQS = [
  {
    question: '노코드 퀀트 봇 스튜디오는 코딩 지식이 없어도 쓸 수 있나요?',
    answer:
      '네, 슬라이더와 입력창으로 DCA·그리드·RSI 조건을 연습할 수 있습니다. 실제 거래 봇은 생성되지 않습니다.',
  },
  {
    question: '백테스팅 시뮬레이션은 어떤 데이터를 기반으로 작동하나요?',
    answer:
      '교육용 예시 가격과 가정된 수익률로 계산합니다. 실제 과거 틱·분봉 데이터나 검증된 체결 기록을 사용하지 않습니다.',
  },
  {
    question: '생성한 봇을 실전 가상 거래에 투입할 수 있나요?',
    answer:
      '아니요. 실제 자동매매와 WLD 정산은 제공하지 않습니다. 이 화면은 연습용 시뮬레이션입니다.',
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
    description: '가상 예시 데이터로 DCA/그리드/RSI 전략을 연습하는 교육용 웹 시뮬레이터',
    urlPath: '/tools/quant-studio',
    applicationCategory: 'FinanceApplication',
    features: [
      'DCA 분할매수 / 그리드 차익 / RSI 모멘텀 전략 프리셋',
      '예시 가격 기반 시뮬레이션 (검증된 성과 아님)',
      '가상 종목 예시 차트',
      '가상 손절·익절 조건 연습',
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
