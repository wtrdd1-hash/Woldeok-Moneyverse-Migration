import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { StockComparison } from '../stock-comparison';
import { parseComparisonMarket } from './stock-comparison-source';

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
  const market = parseComparisonMarket(await apiOrNull<unknown>('/api/v1/stocks'));
  const symbolQuery = Array.isArray(query.symbols) ? query.symbols[0] : query.symbols;
  const initialSymbols = (symbolQuery ?? '').slice(0, 128)
    .split(',')
    .map((symbol) => symbol.trim())
    .filter((symbol) => /^[A-Za-z0-9._-]{1,32}$/.test(symbol))
    .slice(0, 3);
  const retryHref = initialSymbols.length > 0
    ? `/stocks/compare?${new URLSearchParams({ symbols: initialSymbols.join(',') }).toString()}`
    : '/stocks/compare';

  return (
    <div data-page="stocks-compare" className="mv-page mv-page--finance grid gap-6">
      <PageHeader
        eyebrow="VIRTUAL MARKET"
        title={isEn ? 'Compare Virtual Stocks' : '가상 주식 종목 비교'}
      >
        {isEn
          ? 'Compare the last server-reported virtual market data. Real-time freshness is not verified; this is game data, not investment information.'
          : '서버가 마지막으로 제공한 가상 시장 데이터를 비교합니다. 실시간 최신성은 확인되지 않았으며 실제 투자 정보가 아닌 게임 데이터입니다.'}
      </PageHeader>

      {market === null ? (
        <div role="alert" aria-live="assertive">
          <EmptyState
            title={isEn ? 'Market evidence could not be verified' : '시장 정보를 검증할 수 없습니다'}
            description={isEn ? 'Stock data is unavailable or invalid. No comparison is shown until the server evidence can be verified.' : '서버 조회에 실패했거나 응답이 올바르지 않습니다. 검증되기 전에는 종목을 비교하지 않습니다.'}
          >
            <Button asChild variant="outline" className="min-h-11">
              <Link href={retryHref}>{isEn ? 'Try again' : '다시 확인'}</Link>
            </Button>
          </EmptyState>
        </div>
      ) : market.length < 2 ? (
        <EmptyState
          title={isEn ? 'At least two listed stocks are required for comparison.' : '비교하려면 거래 가능한 종목이 2개 이상 필요합니다.'}
        />
      ) : (
        <StockComparison stocks={market} isEn={isEn} initialSymbols={initialSymbols} />
      )}
    </div>
  );
}
