import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const responses = vi.hoisted(() => ({ portfolio: null as unknown, receipts: null as unknown }));

vi.mock('@/lib/api', () => ({
  apiOrNull: async (path: string) => path.endsWith('/halt-receipts') ? responses.receipts : responses.portfolio,
}));
vi.mock('@/lib/session', () => ({ requireMember: async () => undefined }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));
vi.mock('next/dynamic', () => ({
  default: () => ({ triggerLabel }: { triggerLabel?: string }) => <button>{triggerLabel}</button>,
}));
vi.mock('@/lib/use-market-prices', () => ({
  MarketPricesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/sector-diversification-card', () => ({ SectorDiversificationCard: () => null }));
vi.mock('@/components/portfolio-share-trigger', () => ({ PortfolioShareTrigger: () => null }));
vi.mock('./portfolio-donut-chart', () => ({ PortfolioDonutChart: () => null }));

import PortfolioAnalysisPage from './page';

const holding = {
  stock_id: '11111111-1111-4111-8111-111111111111',
  symbol: 'WDG',
  name: 'Virtual WDG',
  quantity: '10',
  average_cost: '100',
  current_price: '120',
  market_value: '1200',
  halt_status: 'ACTIVE',
};
const receipt = {
  id: '33333333-3333-4333-8333-333333333333',
  halt_event_id: '44444444-4444-4444-8444-444444444444',
  stock_id: holding.stock_id,
  stock_symbol: holding.symbol,
  stock_name: holding.name,
  quantity: '10',
  basis_method: 'average_cost',
  basis_unit_amount: '100',
  refund_amount: '1000',
  status: 'settled',
  created_at: '2026-10-01T00:00:00.000Z',
};

async function html(): Promise<string> {
  return renderToStaticMarkup(await PortfolioAnalysisPage());
}

describe('authenticated portfolio server-rendered flow', () => {
  beforeEach(() => {
    responses.portfolio = null;
    responses.receipts = null;
  });

  it('keeps settlement errors visible when holdings are unavailable', async () => {
    const page = await html();
    expect(page).toContain('보유 데이터 확인에 실패했습니다');
    expect(page).toContain('거래정지 정산 영수증을 확인할 수 없습니다');
    expect(page).toContain('href="/stocks/portfolio"');
    expect(page).not.toContain('정산완료 0건');
  });

  it('shows verified empty holdings separately from verified empty settlement records', async () => {
    responses.portfolio = { holdings: [] };
    responses.receipts = { receipts: [] };
    const page = await html();
    expect(page).toContain('현재 보유 중인 가상 주식이 없어요');
    expect(page).toContain('확인된 거래정지 정산 기록이 없습니다');
  });

  it('blocks halted trade controls and never calls quarantined refunds paid', async () => {
    responses.portfolio = { holdings: [{ ...holding, halt_status: 'HALTING' }] };
    responses.receipts = { receipts: [{ ...receipt, status: 'quarantined', basis_unit_amount: '0', refund_amount: '0' }] };
    const page = await html();
    expect(page).toContain('거래정지');
    expect(page).toContain('환급 보류');
    expect(page).not.toContain('<button>추가 매수</button>');
    expect(page).not.toContain('<button>매도</button>');
    expect(page).not.toContain('+0 WLD');
  });

  it('renders verified active positions and a positive settled refund', async () => {
    responses.portfolio = { holdings: [holding] };
    responses.receipts = { receipts: [receipt] };
    const page = await html();
    expect(page).toContain('총 평가금액');
    expect(page).toContain('<button>추가 매수</button>');
    expect(page).toContain('<button>매도</button>');
    expect(page).toContain('총 환급액');
    expect(page).toContain('1,000');
    expect(page).not.toContain('주간 금융 결산');
  });
});
