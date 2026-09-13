import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { analyzePortfolio, type PortfolioHoldingInput } from './analysis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '가상 주식 포트폴리오 분석 — 월덕 머니버스',
  description: '보유 중인 게임 전용 가상 주식의 평가금액, 비중과 미실현 손익을 확인합니다.',
  robots: { index: false, follow: false },
};

function signedPercent(bpsText: string): string {
  const bps = Number(bpsText);
  if (!Number.isSafeInteger(bps)) return '—';
  const prefix = bps > 0 ? '+' : bps < 0 ? '−' : '';
  return `${prefix}${(Math.abs(bps) / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

export default async function PortfolioAnalysisPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const response = await apiOrNull<{ holdings: PortfolioHoldingInput[] }>('/api/v1/stocks/portfolio');

  let analysis: ReturnType<typeof analyzePortfolio> | null = null;
  let invalid = false;
  if (response) {
    try {
      analysis = analyzePortfolio(response.holdings ?? []);
    } catch {
      invalid = true;
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="VIRTUAL PORTFOLIO" title={isEn ? 'Portfolio Analysis' : '포트폴리오 분석'}>
        {isEn
          ? 'Review valuation, allocation and unrealized gain/loss for your game-only virtual-stock holdings.'
          : '게임 전용 가상 주식 보유량의 평가금액, 구성 비중과 미실현 손익을 확인합니다.'}
      </PageHeader>

      {response === null || invalid || analysis === null ? (
        <EmptyState
          title={isEn ? 'Portfolio analysis is unavailable.' : '포트폴리오 분석을 불러오지 못했어요.'}
          description={isEn ? 'Authoritative holding data could not be validated. Please try again later.' : '권위 있는 보유 데이터를 검증하지 못했습니다. 잠시 후 다시 시도해 주세요.'}
        />
      ) : analysis.holdings.length === 0 ? (
        <EmptyState
          title={isEn ? 'No virtual-stock holdings yet.' : '아직 보유 중인 가상 주식이 없어요.'}
          description={isEn ? 'Buy a game-only virtual stock to see portfolio analytics here.' : '게임 전용 가상 주식을 보유하면 이 화면에서 분석을 확인할 수 있습니다.'}
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3" aria-label={isEn ? 'Portfolio summary' : '포트폴리오 요약'}>
            <Metric title={isEn ? 'Market value' : '총 평가금액'} value={analysis.total_market_value} />
            <Metric title={isEn ? 'Cost basis' : '총 취득원가'} value={analysis.total_cost_basis} />
            <Metric title={isEn ? 'Unrealized gain/loss' : '미실현 손익'} value={analysis.total_unrealized_gain_loss} signed />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>{isEn ? 'Allocation by holding' : '종목별 구성'}</CardTitle>
              <CardDescription>
                {isEn
                  ? 'Allocation uses current server valuation. Gain/loss compares market value with quantity × average cost.'
                  : '비중은 현재 서버 평가금액을 기준으로 하며, 손익은 평가금액과 수량 × 평균단가를 비교합니다.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {analysis.holdings.map((holding) => (
                <article key={holding.stock_id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono">{holding.symbol}</Badge>
                      <span className="font-medium">{holding.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isEn ? 'Quantity' : '수량'} {holding.quantity} · {isEn ? 'Average cost' : '평균단가'} <Amount value={holding.average_cost} /> WLD
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted" aria-label={`${holding.symbol} ${isEn ? 'allocation' : '비중'} ${signedPercent(holding.allocation_bps)}`}>
                      <div className="h-full bg-foreground" style={{ width: `${Math.min(100, Math.max(0, Number(holding.allocation_bps) / 100))}%` }} />
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:text-right">
                    <dt className="text-muted-foreground">{isEn ? 'Value' : '평가금액'}</dt><dd><Amount value={holding.market_value} /> WLD</dd>
                    <dt className="text-muted-foreground">{isEn ? 'Allocation' : '비중'}</dt><dd>{signedPercent(holding.allocation_bps)}</dd>
                    <dt className="text-muted-foreground">{isEn ? 'Gain/loss' : '손익'}</dt><dd><Amount value={holding.unrealized_gain_loss} /> WLD</dd>
                  </dl>
                </article>
              ))}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {isEn
              ? 'This analysis covers service-internal virtual assets only. It is not investment advice and does not represent real securities or redeemable value.'
              : '이 분석은 서비스 내부 가상 자산만 다룹니다. 투자 조언이 아니며 실제 증권이나 현금 환전 가치를 의미하지 않습니다.'}
          </p>
        </>
      )}
    </div>
  );
}

function Metric({ title, value, signed = false }: { readonly title: string; readonly value: string; readonly signed?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-xl"><Amount value={value} /> WLD</CardTitle>
      </CardHeader>
      {signed ? <CardContent className="text-xs text-muted-foreground">{BigInt(value) > 0n ? '+' : ''}{value} WLD</CardContent> : null}
    </Card>
  );
}
