import type { Metadata } from 'next';
import { canonicalUrl, breadcrumbJsonLd, faqPageJsonLd, buildOgImageUrl } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '가상 부동산 랜드 임대 거래소 — 10대 프리미어 필지 매매 & 패시브 임대료 | 월덕 머니버스',
  description:
    '강남 테헤란로, 여의도 금융타운, 뉴욕 월스트리트 등 10대 핵심 가상 랜드 필지를 소유하고 상업시설을 건설하여 매일 15% 패시브 WLD 임대료를 정산받으세요.',
  keywords: [
    '가상 부동산',
    '메타버스 랜드',
    '가상 랜드 매매',
    '월덕 머니버스 부동산',
    '패시브 임대료',
    'WLD 가상자산',
    '가상 상업시설',
  ],
  alternates: {
    canonical: '/spaces/real-estate',
  },
  openGraph: {
    title: '가상 부동산 랜드 임대 거래소 | 월덕 머니버스',
    description: '10대 프리미어 필지 소유 및 상업시설 건설, 매일 15% 패시브 WLD 임대료 정산 시스템.',
    url: canonicalUrl('/spaces/real-estate'),
    images: [
      {
        url: buildOgImageUrl({
          title: '가상 부동산 랜드 임대 거래소',
          description: '10대 핵심 가상 필지 매매 & 일일 패시브 임대료 정산',
          badge: 'Virtual Land Metaverse',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '가상 부동산 랜드 임대 거래소',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '가상 부동산 랜드 임대 거래소 | 월덕 머니버스',
    description: '10대 프리미어 필지 소유 및 상업시설 건설, 매일 15% 패시브 WLD 임대료 정산 시스템.',
  },
};

const FAQS = [
  {
    question: '가상 부동산 랜드 필지를 소유하면 어떤 혜택이 있나요?',
    answer:
      '강남 테헤란로, 여의도 금융타운 등 10대 랜드 필지를 소유하면 해당 지역의 거래 트래픽 수수료 15%가 일일 패시브 임대료로 소유주 지갑에 매일 자정 자동 정산됩니다.',
  },
  {
    question: '상업시설 증축(Upgrade) 시 임대료가 얼마나 증가하나요?',
    answer:
      '금융빌딩, 채굴센터 등 상업시설을 1레벨 증축할 때마다 필지 감정가가 +15% 상승하며 일일 기대 임대료 수익률이 +20% 증가합니다.',
  },
];

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '공간 & 도시', path: '/spaces' },
    { name: '가상 부동산 랜드 거래소', path: '/spaces/real-estate' },
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
        dangerouslySetInnerHTML={{ __html: jsonLd(faqData) }}
      />
      {children}
    </>
  );
}
