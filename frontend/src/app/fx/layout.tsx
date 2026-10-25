import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '가상 외환시장(FX) 현황 및 거래 중단 안내 | 월덕 머니버스',
  description: '월덕 머니버스의 서비스 내부 가상 FX 기준환율과 검증된 시장 기록을 확인합니다. WLD 환전과 선물환 체결은 안전한 원장 정산 검증 전까지 중단됩니다. 실제 외환 거래나 은행 서비스가 아닙니다.',
  alternates: { canonical: 'https://easy-scraping.com/fx' },
  robots: { index: true, follow: true },
  openGraph: {
    title: '월덕 머니버스 가상 외환시장 현황',
    description: '가상 FX 서버 확인 시세와 거래 중단 상태를 투명하게 안내합니다.',
    url: 'https://easy-scraping.com/fx',
    siteName: '월덕 머니버스 (Woldeok Moneyverse)',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function FxLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
