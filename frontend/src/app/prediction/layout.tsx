import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '예측 시장 — 학습용 확률 계산 | 월덕 머니버스',
  description: '실제 예측 거래가 제공되지 않는 동안 YES/NO 확률과 이론적 배수를 연습하는 교육용 계산기입니다. WLD 거래 또는 지급은 발생하지 않습니다.',
  robots: { index: false, follow: false },
};

export default function PredictionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
