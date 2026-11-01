import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const mocks = vi.hoisted(() => ({ read: vi.fn(), member: vi.fn(), locale: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.read }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.member }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: mocks.locale }));
vi.mock('../stock-comparison', () => ({ StockComparison: ({ stocks }: { stocks: readonly unknown[] }) => <div>VERIFIED_COMPARISON_{stocks.length}</div> }));
import StockComparePage from './page';

const first = {
  id: '11111111-1111-4111-8111-111111111111', symbol: 'AA', name: 'Alpha',
  current_price: '100', day_open_price: '90', day_high_price: '110', day_low_price: '80',
  shares_outstanding: '1000', shares_available: '500',
};
const second = { ...first, id: '22222222-2222-4222-8222-222222222222', symbol: 'BB', name: 'Beta' };
const renderPage = async () => renderToStaticMarkup(await StockComparePage({ searchParams: Promise.resolve({}) }));

beforeEach(() => { vi.clearAllMocks(); mocks.locale.mockResolvedValue('ko'); });

describe('stock comparison source states', () => {
  it('shows unavailable and retry for malformed successful upstream data, never empty market', async () => {
    mocks.read.mockResolvedValue({ stocks: [{ ...first, current_price: undefined }, second] });
    const html = await renderPage();
    expect(html).toContain('불러오지 못했');
    expect(html).toContain('다시 조회');
    expect(html).not.toContain('2개 이상');
    expect(html).not.toContain('VERIFIED_COMPARISON');
  });

  it('distinguishes verified empty source from unavailable source', async () => {
    mocks.read.mockResolvedValue({ stocks: [] });
    expect(await renderPage()).toContain('2개 이상');
    mocks.read.mockResolvedValue(null);
    expect(await renderPage()).toContain('불러오지 못했');
  });

  it('passes only verified stocks to the comparison client', async () => {
    mocks.read.mockResolvedValue({ stocks: [first, second] });
    expect(await renderPage()).toContain('VERIFIED_COMPARISON_2');
    expect(mocks.read).toHaveBeenCalledWith('/api/v1/stocks');
  });
});
