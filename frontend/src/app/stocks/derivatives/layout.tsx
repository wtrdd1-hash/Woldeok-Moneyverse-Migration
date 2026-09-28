import type { Metadata } from 'next';
import { canonicalUrl, breadcrumbJsonLd, faqPageJsonLd, buildOgImageUrl } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '10X 레버리지 가상 파생상품/선물 거래소 — 실시간 격리 마진 롱/숏 주문 & 청산 히트맵 | 월덕 머니버스',
  description:
    '10대 가상 주식(WDG, BIO, CHIPS 등)에 대해 1x~10x 레버리지로 롱/숏 포지션을 오픈하세요. 실시간 청산 히트맵, 8시간 펀딩비 엔진 및 보험기금 보호 시스템을 제공합니다.',
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
    description: '10대 가상 주식 1x~10x 격리 롱/숏 주문, 실시간 청산 히트맵 및 8시간 펀딩비 엔진.',
    url: canonicalUrl('/stocks/derivatives'),
    images: [
      {
        url: buildOgImageUrl({
          title: '10X 가상 파생상품 선물 거래소',
          description: '실시간 격리 마진 롱/숏 주문 & 청산 히트맵',
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
    description: '10대 가상 주식 1x~10x 격리 롱/숏 주문, 실시간 청산 히트맵 및 8시간 펀딩비 엔진.',
  },
};

const FAQS = [
  {
    question: '격리 마진(Isolated Margin) 모드는 어떻게 동작하나요?',
    answer:
      '각 포지션에 투입된 증거금 내에서만 손실이 한정되며, 청산이 발생하더라도 지갑의 다른 자산에는 영향을 미치지 않는 안전한 거래 방식입니다.',
  },
  {
    question: '8시간 펀딩비(Funding Fee)는 어떻게 정산되나요?',
    answer:
      '선물 가격과 현물 가격의 괴리를 좁히기 위해 8시간마다 롱/숏 포지션 보유자 간에 펀딩비가 교환 정산되며, 펀딩비율이 양수일 경우 롱이 숏에게 지불합니다.',
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
