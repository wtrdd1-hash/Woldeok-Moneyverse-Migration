import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '예금보험공사(KDIC) 5천만원 예금자보호 포털 | 월덕 금융안전망',
  description:
    '대한민국 예금자보호법 제31조 공식 적용. 1인당 최고 5,000만원(500,000 WLD) 원리금 전액 보장, 부보 금융기관 BIS 비율 및 건전성 등급 실시간 공시 포털.',
  alternates: {
    canonical: 'https://easy-scraping.com/kdic',
    languages: {
      'ko-KR': 'https://easy-scraping.com/kdic',
      'en-US': 'https://easy-scraping.com/en/kdic',
      'ja-JP': 'https://easy-scraping.com/ja/kdic',
      'zh-CN': 'https://easy-scraping.com/zh/kdic',
      'x-default': 'https://easy-scraping.com/kdic',
    },
  },
  openGraph: {
    title: '예금보험공사(KDIC) 5천만원 예금자보호 포털',
    description:
      '금융기관이 파산해도 1인당 최고 5,000만원(500,000 WLD)까지 원리금 전액 보호! 내 보호예금 계산기 및 부보 금융기관 건전성 공시.',
    url: 'https://easy-scraping.com/kdic',
    siteName: '월덕 머니버스 (Woldeok Moneyverse)',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '예금보험공사(KDIC) 5천만원 예금자보호 포털',
    description: '1인당 최고 5,000만원 법적 보호 및 부보 금융기관 건전성 실시간 공시.',
  },
};

export default function KdicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
