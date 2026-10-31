import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { parseStockPreview } from './prediction-source';
import { PredictionView } from './prediction-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 예측 마켓 — 거래 제공 상태 | 월덕 머니버스',
  description: '예측 지분 거래는 검증 가능한 체결 및 정산 계약이 마련되기 전까지 제공하지 않습니다. 가상 주식 참고 정보만 표시합니다.',
  robots: { index: false, follow: false },
};

export default async function PredictionPage() {
  const raw = await apiOrNull<unknown>('/api/v1/stocks');
  return <PredictionView source={parseStockPreview(raw)} />;
}
