import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { StockComparison } from '../stock-comparison';
import { verifiedComparisonMarket } from './verified-market';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '가상 주식 종목 비교',
  description: '월덕 머니버스 가상 주식 2~3개를 현재가, 시가 대비 변동, 일중 범위, 거래 가능 수량으로 비교합니다.',
  robots: { index: false, follow: false },
};

export default async function StockComparePage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly symbols?: string | string[] }>;
}) {
  await requireMember();
  const [locale, query] = await Promise.all([getServerLocale(), searchParams]);
  const isEn = locale === 'en';
  const market = await apiOrNull<unknown>('/api/v1/stocks');
  const stocks = verifiedComparisonMarket(market);
  const symbolQuery = Array.isArray(query.symbols) ? query.symbols[0] : query.symbols;
  const initialSymbols = (symbolQuery ?? '')
    .split(',')
    .map((symbol) => symbol.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div data-page="stocks-compare" className="mv-page mv-page--finance grid gap-6">
      <PageHeader
        eyebrow="VIRTUAL MARKET"
        title={isEn ? 'Compare Virtual Stocks' : '가상 주식 종목 비교'}
      >
        {isEn
          ? 'Compare server-authoritative virtual market data side by side. This is game data, not investment information.'
          : '서버가 관리하는 가상 시장 데이터를 나란히 비교합니다. 실제 투자 정보가 아닌 게임 데이터입니다.'}
      </PageHeader>

      {stocks === null ? (
        <div role="status" aria-live="polite">
          <EmptyState
            title={isEn ? 'Failed to load verified stock data.' : '검증된 주식 정보를 불러오지 못했어요.'}
            description={isEn ? 'The market source could not be verified. Please retry.' : '시장 정보의 출처와 값을 확인할 수 없습니다. 다시 조회해 주세요.'}
          >
            <Button asChild variant="outline"><Link href="/stocks/compare">{isEn ? 'Retry' : '다시 조회'}</Link></Button>
          </EmptyState>
        </div>
      ) : stocks.length < 2 ? (
        <EmptyState
          title={isEn ? 'At least two listed stocks are required for comparison.' : '비교하려면 거래 가능한 종목이 2개 이상 필요합니다.'}
        />
      ) : (
        <StockComparison stocks={stocks} isEn={isEn} initialSymbols={initialSymbols} />
      )}
    </div>
  );
}
