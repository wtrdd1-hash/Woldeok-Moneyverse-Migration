import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '가상 파생상품 — 데이터 검증 및 거래 이용 안내 | 월덕 머니버스',
  description: '가상 파생상품 시세와 거래 원장이 검증되기 전까지 주문과 정산 기능을 제공하지 않습니다.',
  robots: { index: false, follow: false },
};

export default function DerivativesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
