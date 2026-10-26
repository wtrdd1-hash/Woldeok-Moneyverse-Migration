import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { canonicalUrl } from '@/lib/seo';
import { NewspaperView } from './newspaper-view';
import type { MarketEvent, StockTickerItem } from './newspaper-view';
import { parseWeeklyBriefResponse } from './weekly-brief-contract';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상경제 검증 잔액 현황 & 시장 소식 — 월덕 머니버스',
  description: '서버에서 확인한 가상경제 회원 잔액 스냅샷과 실제 등록된 가상 주식 시장 사건을 확인하세요. 미집계 통계는 표시하지 않습니다.',
  alternates: { canonical: canonicalUrl('/newspaper') },
  robots: { index: true, follow: true },
};

export default async function NewspaperPage() {
  const [eventsResult, stocksResult, weeklyBriefResult] = await Promise.all([
    apiOrNull<{ events: MarketEvent[] }>('/api/v1/stocks/market-events'),
    apiOrNull<{ stocks: StockTickerItem[] }>('/api/v1/stocks'),
    apiOrNull<unknown>('/api/v1/newspaper/weekly-brief'),
  ]);

  const events: readonly MarketEvent[] = eventsResult?.events ?? [];
  const stocks: readonly StockTickerItem[] = stocksResult?.stocks ?? [];
  const weeklyBrief = parseWeeklyBriefResponse(weeklyBriefResult);

  return <NewspaperView events={events} stocks={stocks} weeklyBrief={weeklyBrief} />;
}

