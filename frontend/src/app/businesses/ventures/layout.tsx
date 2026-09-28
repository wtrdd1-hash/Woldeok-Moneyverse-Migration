import type { Metadata } from 'next';
import { canonicalUrl, breadcrumbJsonLd, faqPageJsonLd, buildOgImageUrl } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '가상 스타트업 VC 엔젤투자 & 지분 펀딩 — 6대 유망 벤처 투자 & 배당 수익 | 월덕 머니버스',
  description:
    'AI 퀀트 핀테크, 우주 로켓, 웹3 탈중앙화 등 6대 가상 스타트업에 엔젤투자자로 참여하여 기업 성장 가치 상승에 따른 지분 매각 차익과 주간 고율 배당금을 획득하세요.',
  keywords: [
    '스타트업 엔젤투자',
    '가상 VC 투자',
    '벤처 펀딩',
    '지분 배당금',
    '월덕 스타트업',
    'WLD 투자 수익',
    'IPO 상장',
  ],
  alternates: {
    canonical: '/businesses/ventures',
  },
  openGraph: {
    title: '가상 스타트업 VC 엔젤투자 & 펀딩 | 월덕 머니버스',
    description: '6대 유망 가상 스타트업 엔젤투자, 지분 성장 차익 및 주간 배당금 정산 시스템.',
    url: canonicalUrl('/businesses/ventures'),
    images: [
      {
        url: buildOgImageUrl({
          title: '가상 스타트업 VC 엔젤투자 & 펀딩',
          description: '6대 유망 벤처 지분 투자 & 주간 고율 배당금 정산',
          badge: 'Startup VC Angels',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '가상 스타트업 VC 엔젤투자 & 펀딩',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '가상 스타트업 VC 엔젤투자 & 펀딩 | 월덕 머니버스',
    description: '6대 유망 가상 스타트업 엔젤투자, 지분 성장 차익 및 주간 배당금 정산 시스템.',
  },
};

const FAQS = [
  {
    question: '스타트업 지분 투자 시 배당금은 어떻게 수령하나요?',
    answer:
      '투자한 스타트업의 지분율에 비례하여 매주 월요일 00:00에 기업 영업이익의 25%가 WLD 배당금으로 지갑에 자동 입금됩니다.',
  },
  {
    question: '투자한 스타트업이 IPO 상장하면 어떤 이익이 발생하나요?',
    answer:
      '시드 단계에서 투자한 지분 가치가 상장 시 최대 5배~10배로 재평가되어 가상 주식 거래소에서 자유롭게 시장가로 매각할 수 있습니다.',
  },
];

export default function VenturesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '사업체 & 경제', path: '/businesses' },
    { name: '스타트업 VC 엔젤투자', path: '/businesses/ventures' },
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
