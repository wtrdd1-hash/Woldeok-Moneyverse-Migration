import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { canonicalUrl } from '@/lib/seo';
import { NewspaperView } from './newspaper-view';
import type { WeeklyBriefData } from './weekly-world-brief';
import { parseNewspaperEvents, parseNewspaperStocks } from './newspaper-source';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '주간 경제 브리프 & 시장 사건 조회 — 월덕 머니버스',
  description: '월덕 머니버스의 서버 조회 기반 가상 시장 사건과 검증 가능한 주간 경제 브리프를 안내합니다. 미확인 시세와 투표 결과는 표시하지 않습니다.',
  alternates: { canonical: canonicalUrl('/newspaper') },
  robots: { index: true, follow: true },
};

export default async function NewspaperPage() {
  const [eventsResult, stocksResult, weeklyBriefResult] = await Promise.all([
    apiOrNull<unknown>('/api/v1/stocks/market-events'),
    apiOrNull<unknown>('/api/v1/stocks'),
    apiOrNull<{ success: boolean; data: WeeklyBriefData }>('/api/v1/newspaper/weekly-brief'),
  ]);

  const events = parseNewspaperEvents(eventsResult);
  const stocks = parseNewspaperStocks(stocksResult);
  const weeklyBrief = weeklyBriefResult?.success === true ? weeklyBriefResult.data : undefined;

  return <NewspaperView events={events ?? []} stocks={stocks ?? []} eventsAvailable={events !== null} stocksAvailable={stocks !== null} weeklyBrief={weeklyBrief} />;
}

