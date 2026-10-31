import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { breadcrumbJsonLd, canonicalUrl } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '가상 예금보호 상태 | 월덕 머니버스',
  description: 'WLD는 실제 예금이 아닙니다. 예금보호 기금과 보상액은 검증되지 않아 현재 안내할 수 없습니다.',
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalUrl('/kdic') },
  openGraph: {
    title: '가상 예금보호 상태 | 월덕 머니버스',
    description: 'WLD 가상경제의 예금보호 관련 검증 상태 안내. 정부 공식 예금보험 서비스가 아닙니다.',
    url: canonicalUrl('/kdic'),
    type: 'website',
  },
};

export default function KdicLayout({ children }: { children: ReactNode }) {
  const breadcrumb = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '가상 예금보호 상태', path: '/kdic' },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      {children}
    </>
  );
}
