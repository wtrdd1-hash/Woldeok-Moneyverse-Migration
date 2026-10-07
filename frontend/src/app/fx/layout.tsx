import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '서울외환시장 (FX) 실시간 환전 & 외환보유액 포털 | 월덕 통화안전망',
  description:
    '한국은행 중앙은행 공식 연동 서울외환시장 포털. 기축통화(USD) ↔ 원화(WLD) 1초 즉시 환전, 실시간 환율 궤적 차트, 연 4.5% 외화정기예금 및 외환보유액 모니터링.',
  alternates: {
    canonical: 'https://easy-scraping.com/fx',
    languages: {
      'ko-KR': 'https://easy-scraping.com/fx',
      'en-US': 'https://easy-scraping.com/en/fx',
      'ja-JP': 'https://easy-scraping.com/ja/fx',
      'zh-CN': 'https://easy-scraping.com/zh/fx',
      'x-default': 'https://easy-scraping.com/fx',
    },
  },
  openGraph: {
    title: '서울외환시장 (FX) 실시간 환전 & 외환보유액 포털',
    description:
      'USD ↔ WLD 즉시 환전, 실시간 환율 궤적, 연 4.5% 외화예금 및 중앙은행 외환보유액 모니터링.',
    url: 'https://easy-scraping.com/fx',
    siteName: '월덕 머니버스 (Woldeok Moneyverse)',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '서울외환시장 (FX) 실시간 환전 & 외환보유액 포털',
    description: 'USD ↔ WLD 1초 즉시 환전 및 중앙은행 외환보유액 모니터링.',
  },
};

export default function FxLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
