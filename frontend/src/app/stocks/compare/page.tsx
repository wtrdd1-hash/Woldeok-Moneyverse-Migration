import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { StockComparison } from '../stock-comparison';
import type { ComparableStock } from '../stock-comparison';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '가상 주식 종목 비교 — 월덕 머니버스',
  description: '월덕 머니버스 가상 주식 2~3개를 현재가, 시가 대비 변동, 일중 범위, 거래 가능 수량으로 비교합니다.',
  robots: { index: false, follow: false },
};

export default async function StockComparePage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const market = await apiOrNull<{ stocks: ComparableStock[] }>('/api/v1/stocks');
  const stocks = market?.stocks ?? [];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="VIRTUAL MARKET"
        title={isEn ? 'Compare Virtual Stocks' : '가상 주식 종목 비교'}
      >
        {isEn
          ? 'Compare server-authoritative virtual market data side by side. This is game data, not investment information.'
          : '서버가 관리하는 가상 시장 데이터를 나란히 비교합니다. 실제 투자 정보가 아닌 게임 데이터입니다.'}
      </PageHeader>

      {market === null ? (
        <EmptyState
          title={isEn ? 'Failed to load stock data.' : '주식 정보를 불러오지 못했어요.'}
          description={isEn ? 'Please try again in a few moments.' : '잠시 후 다시 시도해 주세요.'}
        />
      ) : stocks.length < 2 ? (
        <EmptyState
          title={isEn ? 'At least two listed stocks are required for comparison.' : '비교하려면 거래 가능한 종목이 2개 이상 필요합니다.'}
        />
      ) : (
        <StockComparison stocks={stocks} isEn={isEn} />
      )}
    </div>
  );
}
