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
  title: '디스코드 길드 영지 공성전 — 5대 금융 랜드 쟁탈 & 일일 세금 배당 | 월덕 머니버스',
  description:
    '디스코드 길드원들과 함께 강남 파이낸스타워, 여의도 볼트 등 5대 금융 요충지 영지를 점령하고, 거래 수수료 세금 금고를 획득하여 일일 패시브 WLD 배당금을 정산받으세요.',
  keywords: [
    '길드 공성전',
    '디스코드 길드 쟁탈전',
    '가상 영지 점령',
    '길드 세금 배당',
    '월덕 머니버스 공성전',
    '메타버스 영토전',
    'WLD 길드 금고',
  ],
  alternates: {
    canonical: '/clubs/warfare',
  },
  openGraph: {
    title: '디스코드 길드 영지 공성전 | 월덕 머니버스',
    description: '5대 금융 요충지 영지 점령, 방어 실드 강화 및 일일 최대 65만 WLD 길드 세금 배당 시스템.',
    url: canonicalUrl('/clubs/warfare'),
    images: [
      {
        url: buildOgImageUrl({
          title: '디스코드 길드 영지 공성전',
          description: '5대 금융 요충지 점령 · 방어 실드 강화 · 일일 길드 세금 배당',
          badge: 'Guild Warfare',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '디스코드 길드 영지 공성전',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '디스코드 길드 영지 공성전 | 월덕 머니버스',
    description: '5대 금융 요충지 영지 점령, 방어 실드 강화 및 일일 최대 65만 WLD 길드 세금 배당 시스템.',
  },
};

const FAQS = [
  {
    question: '디스코드 길드 영지 공성전은 어떻게 진행되나요?',
    answer:
      '길드 레벨 2 이상의 공인 길드는 5대 금융 거점 영지(강남, 여의도, 판교, 월스트리트, 실리콘비치)에 공성전을 선포하고 공격력 및 실드 방어전을 통해 거점을 점령할 수 있습니다.',
  },
  {
    question: '영지 점령 시 어떤 혜택이 주어지나요?',
    answer:
      '점령 길드는 해당 영지에서 발생하는 가상 부동산 거래 수수료, 주식 거래세, 파생상품 청산 수수료의 10~25%를 일일 세금 금고로 독점 적립하며, 길드원 기여도에 따라 매일 자정 WLD 배당금으로 자동 정산됩니다.',
  },
  {
    question: '방어 실드 레벨업은 어떻게 하나요?',
    answer:
      '길드 금고 자금을 투입하여 실드 레벨(최대 5단계)을 강화하면 공성 피해 흡수율이 증가하고 최대 HP가 확장되어 외부 길드의 침공을 방어할 수 있습니다.',
  },
];

export default function WarfareLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '커뮤니티 & 클럽', path: '/board' },
    { name: '디스코드 길드 영지 공성전', path: '/clubs/warfare' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '디스코드 길드 영지 공성전 시스템',
    description: '5대 금융 거점 점령 및 길드 세금 배당을 실시간 시뮬레이션하는 웹 대시보드',
    urlPath: '/clubs/warfare',
    applicationCategory: 'GameApplication',
    features: [
      '5대 금융 요충지 실시간 점령 현황 맵',
      '공성전 선포 및 길드 방어 실드 강화',
      '일일 세금 금고 배당금 정산 및 기여도 랭킹',
      '디스코드 실시간 봇 전투 웹훅 연동',
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
