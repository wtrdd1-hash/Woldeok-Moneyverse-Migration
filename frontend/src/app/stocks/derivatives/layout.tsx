import type { Metadata } from 'next';
import { canonicalUrl, breadcrumbJsonLd, faqPageJsonLd, buildOgImageUrl } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '10X 레버리지 가상 파생상품/선물 거래소 — 시뮬레이션 예시 · 실제 주문 미지원 | 월덕 머니버스',
  description:
    '10대 가상 주식(WDG, BIO, CHIPS 등)에 대해 1x~10x 레버리지 계산 예시를 제공합니다. 실제 회원 포지션, 체결, 정산 및 실시간 가격은 지원하지 않습니다.',
  robots: { index: false, follow: false },
  keywords: [
    '가상 선물 거래소',
    '가상 파생상품',
    '10배 레버리지',
    '롱 숏 포지션',
    '청산 히트맵',
    '격리 마진',
    '펀딩비',
    '월덕 파생상품',
  ],
  alternates: {
    canonical: '/stocks/derivatives',
  },
  openGraph: {
    title: '10X 레버리지 가상 파생상품/선물 거래소 | 월덕 머니버스',
    description: '10대 가상 주식 1x~10x 계산 예시 화면입니다. 실제 주문과 체결은 지원하지 않습니다.',
    url: canonicalUrl('/stocks/derivatives'),
    images: [
      {
        url: buildOgImageUrl({
          title: '10X 가상 파생상품 선물 거래소',
          description: '시뮬레이션 예시 · 실제 주문 미지원',
          badge: 'Derivatives 10x',
          type: 'stock',
        }),
        width: 1200,
        height: 630,
        alt: '10X 레버리지 가상 파생상품 선물 거래소',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '10X 레버리지 가상 파생상품/선물 거래소 | 월덕 머니버스',
    description: '10대 가상 주식 1x~10x 계산 예시 화면입니다. 실제 주문과 체결은 지원하지 않습니다.',
  },
};

const FAQS = [
  {
    question: '격리 마진(Isolated Margin) 모드는 어떻게 동작하나요?',
    answer:
      '격리 마진의 계산 예시만 제공합니다. 실제 회원 잔고 및 주문 원장과 연결되지 않습니다.',
  },
  {
    question: '8시간 펀딩비(Funding Fee)는 어떻게 정산되나요?',
    answer:
      '화면의 펀딩비는 계산 예시이며 실제 8시간 정산이나 WLD 이동은 수행하지 않습니다.',
  },
];

export default function DerivativesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '주식 거래소', path: '/stocks' },
    { name: '10X 가상 파생상품 선물', path: '/stocks/derivatives' },
  ]);
  const faqData = faqPageJsonLd(FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqPageJsonLd(FAQS) }}
      />
      {children}
    </>
  );
}
