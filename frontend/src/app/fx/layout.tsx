import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '가상 외환시장 검증 상태 | 월덕 머니버스',
  description: '가상 FX 시세와 원장 정산의 검증 상태를 안내합니다. 검증되지 않은 환율과 거래는 제공하지 않습니다.',
  robots: { index: false, follow: false },
};

export default function FxLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
