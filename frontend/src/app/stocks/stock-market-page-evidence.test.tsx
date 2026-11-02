import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('@/lib/use-market-prices', () => ({ MarketPricesProvider: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/stock-disclosure-ticker', () => ({ StockDisclosureTicker: () => null }));
vi.mock('@/components/global-macro-pulse-ticker', () => ({ GlobalMacroPulseTicker: () => null }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));

import StocksPage, { generateMetadata } from './page';

const valid = {
  id: '123e4567-e89b-42d3-a456-426614174000', symbol: 'CHIPS', name: 'Chips', description: '',
  current_price: '1000000000000000000000000000001', day_open_price: '1000000000000000000000000000000',
  day_high_price: '1000000000000000000000000000001', day_low_price: '1000000000000000000000000000000',
  shares_outstanding: '100', shares_available: '50', halt_status: 'ACTIVE',
};

const render = async () => renderToStaticMarkup(await StocksPage({ searchParams: Promise.resolve({}) }));

beforeEach(() => apiMock.mockReset());

describe('public market page end-to-end source presentation', () => {
  it('reports unavailable market without presenting an empty listed market', async () => {
    apiMock.mockResolvedValue(null);
    const html = await render();
    expect(html).toContain('주식 시세를 확인할 수 없습니다');
    expect(html).not.toContain('거래 가능한 종목이 없습니다');
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
  });

  it('fails closed on a malformed upstream market instead of crashing', async () => {
    apiMock.mockResolvedValue({ stocks: 'not-an-array' });
    const html = await render();
    expect(html).toContain('주식 시세를 확인할 수 없습니다');
    expect(html).not.toContain('거래 가능한 종목이 없습니다');
  });

  it('distinguishes a verified empty market', async () => {
    apiMock.mockResolvedValue({ stocks: [] });
    const html = await render();
    expect(html).toContain('거래 가능한 종목이 없습니다');
    expect(html).not.toContain('주식 시세를 확인할 수 없습니다');
  });

  it('displays huge prices without Number rounding and does not invent price movement', async () => {
    apiMock.mockResolvedValue({ stocks: [valid] });
    const html = await render();
    expect(html).toContain('1,000,000,000,000,000,000,000,000,000,001');
    expect(html).toContain('+&lt;0.1%');
    expect(html).toContain('max-w-[45vw]');
    expect(html).not.toContain('NaN');
  });

  it('disables the buy affordance on an authoritative halted stock', async () => {
    apiMock.mockResolvedValue({ stocks: [{ ...valid, halt_status: 'HALTED_SETTLING' }] });
    const html = await render();
    expect(html).toContain('매수 불가');
    expect(html).toContain('거래정지');
  });

  it('does not promise unverified orderbook depth or signup WLD in public SEO', async () => {
    const meta = await generateMetadata();
    expect(meta.description).not.toMatch(/10단|1만 WLD|1초 모의투자/);
  });
});
