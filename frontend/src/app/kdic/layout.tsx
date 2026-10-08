import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '월덕 머니버스 가상 예금보호 시뮬레이터 | WLD 금융안전망',
  description: 'WLD는 서비스 내 가상 화폐이며 대한민국 예금자보호법이나 예금보험공사의 법적 보호 대상이 아닙니다. 가상 금융기관과 기금의 시뮬레이션 데이터를 확인하세요.',
  alternates: { canonical: 'https://easy-scraping.com/kdic' },
  robots: { index: false, follow: true },
  openGraph: {
    title: '월덕 머니버스 가상 예금보호 시뮬레이터',
    description: '법적 예금보험이 적용되지 않는 WLD의 가상 금융안전망 시뮬레이션입니다.',
    url: 'https://easy-scraping.com/kdic',
    siteName: '월덕 머니버스 (Woldeok Moneyverse)',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function KdicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
