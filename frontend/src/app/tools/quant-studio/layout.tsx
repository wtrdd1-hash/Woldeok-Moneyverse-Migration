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
  title: '노코드 퀀트 봇 스튜디오 — DCA·그리드·RSI 알고리즘 백테스팅 & 자동 매매 | 월덕 머니버스',
  description:
    '코딩 없이 클릭 몇 번으로 가상 주식 DCA 분할 매수, 20단 그리드 무한 차익, RSI 스윙 퀀트 봇을 설계하고 과거 시세로 수익률을 정밀 백테스팅하세요.',
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
    description: '코딩 없는 알고리즘 봇 설계, DCA/그리드/RSI 실시간 백테스팅 및 가상 주식 자동 매매 툴킷.',
    url: canonicalUrl('/tools/quant-studio'),
    images: [
      {
        url: buildOgImageUrl({
          title: '노코드 퀀트 봇 스튜디오',
          description: 'DCA · 20단 그리드 · RSI 스윙 봇 실시간 백테스팅 시뮬레이터',
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
    description: '코딩 없는 알고리즘 봇 설계, DCA/그리드/RSI 실시간 백테스팅 및 가상 주식 자동 매매 툴킷.',
  },
};

const FAQS = [
  {
    question: '노코드 퀀트 봇 스튜디오는 코딩 지식이 없어도 쓸 수 있나요?',
    answer:
      '네, 파이썬이나 프로그래밍 코드 작성 없이 DCA 분할 매수, 그리드 레벨, 익절/손절 비율을 슬라이더와 입력창으로 손쉽게 조절하여 나만의 알고리즘 봇을 생성할 수 있습니다.',
  },
  {
    question: '백테스팅 시뮬레이션은 어떤 데이터를 기반으로 작동하나요?',
    answer:
      '침팬지 반도체, 월덕 인더스트리 등 10대 가상 주식의 과거 틱 데이터 및 분봉 차트를 기반으로 승률, 최대 낙폭(MDD), 총 수익률을 1초 만에 정밀 역산합니다.',
  },
  {
    question: '생성한 봇을 실전 가상 거래에 투입할 수 있나요?',
    answer:
      '네, 백테스팅을 통과한 봇을 활성화하면 백그라운드에서 지정된 조건에 맞춰 자동으로 매수/매도 주문을 체결합니다.',
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
      '과거 시세 기반 1초 백테스팅 엔진 (승률, 수익률, MDD)',
      '10대 가상 종목 실시간 차트 및 호가 연동',
      '익절 및 손절매 리스크 관리 자동화',
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
