import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { breadcrumbJsonLd, canonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: '월덕 가상 예금보호기금 — 서버 조회 및 WLD 한도 예시',
  description: '게임 내 가상 예금보호기금의 서버 기록과 기관 상태를 조회하고 WLD 한도를 예시로 계산합니다. 현실 예금보험·법적 보장·현금 지급과 무관합니다.',
  alternates: { canonical: canonicalUrl('/kdic') },
  openGraph: {
    title: '월덕 가상 예금보호기금',
    description: '서버에서 확인된 가상 WLD 기금 현황 및 보장 없는 예시 계산기.',
    url: canonicalUrl('/kdic'),
    siteName: '월덕 머니버스 (Woldeok Moneyverse)',
    locale: 'ko_KR', type: 'website',
  },
};

export default function KdicLayout({ children }: { children: ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '' },
    { name: '가상 예금보호기금', path: '/kdic' },
  ]);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    {children}
  </>;
}
