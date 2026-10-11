import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  breadcrumbJsonLd,
  softwareApplicationJsonLd,
  canonicalUrl,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: '4인 공동 저축 챌린지 팟 | 월덕 가상금융 소셜 세이빙',
  description:
    '친구·동료와 함께 모여 40만 WLD 목표를 달성하는 4인 소셜 복리 저축 챌린지 팟. 일일 저축 퀘스트, 친구 찌르기(Nudge), 시너지 이자 보너스 시뮬레이터.',
  alternates: {
    canonical: canonicalUrl('/bank/savings-pot'),
    languages: {
      'ko-KR': canonicalUrl('/bank/savings-pot'),
      'en-US': canonicalUrl('/en/bank/savings-pot'),
      'ja-JP': canonicalUrl('/ja/bank/savings-pot'),
      'zh-CN': canonicalUrl('/zh/bank/savings-pot'),
      'x-default': canonicalUrl('/bank/savings-pot'),
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: '4인 공동 저축 챌린지 팟 — 월덕 가상금융 소셜 세이빙',
    description:
      '4인이 모여 일일 저축을 완료하면 연 +2.5% 시너지 보너스 금리 적용! 소셜 금융 챌린지 시뮬레이터.',
    url: canonicalUrl('/bank/savings-pot'),
    siteName: '월덕 머니버스 (Woldeok Moneyverse)',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '4인 공동 저축 챌린지 팟 — 월덕 머니버스',
    description: '소셜 협동 저축 챌린지 및 일일 퀘스트 시뮬레이터.',
  },
};

export default function SavingsPotLayout({ children }: { children: ReactNode }) {
  const appData = softwareApplicationJsonLd({
    name: '4인 공동 저축 챌린지 팟 시뮬레이터',
    description:
      '4인이 함께 모여 일일 쿼터를 저축하고 시너지 우대 금리를 획득하는 소셜 챌린지 금융 도구.',
    urlPath: '/bank/savings-pot',
    applicationCategory: 'FinanceApplication',
    features: [
      '4인 소셜 저축 진척도 실시간 동기화',
      '친구 찌르기(Nudge) 독려 인터랙션',
      '시너지 우대 금리 및 목표 달성 리워드 계산',
    ],
  });

  const breadcrumbData = breadcrumbJsonLd([
    { name: '홈', path: '' },
    { name: '금융 도구', path: '/tools' },
    { name: '4인 공동 저축 챌린지 팟', path: '/bank/savings-pot' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {children}
    </>
  );
}
