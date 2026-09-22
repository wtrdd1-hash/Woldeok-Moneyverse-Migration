﻿import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { canonicalUrl } from '@/lib/seo';
import { NewspaperView } from './newspaper-view';
import type { MarketEvent, StockTickerItem } from './newspaper-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '주간 경제 브리프 & 실시간 월드 펄스 — 월덕 머니버스',
  description: '월덕 머니버스 가상 경제의 실시간 AI 시나리오 사건, 주간 경제 브리프 및 시장 심리 분석을 제공합니다.',
  alternates: { canonical: canonicalUrl('/newspaper') },
  robots: { index: true, follow: true },
};

export default async function NewspaperPage() {
  const [eventsResult, stocksResult] = await Promise.all([
    apiOrNull<{ events: MarketEvent[] }>('/api/v1/stocks/market-events'),
    apiOrNull<{ stocks: StockTickerItem[] }>('/api/v1/stocks'),
  ]);

  const events: readonly MarketEvent[] = eventsResult?.events ?? [];
  const stocks: readonly StockTickerItem[] = stocksResult?.stocks ?? [];

  return <NewspaperView events={events} stocks={stocks} />;
}
