import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { stockApi, serverLocale } = vi.hoisted(() => ({
  stockApi: vi.fn(),
  serverLocale: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiOrNull: stockApi }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: serverLocale }));
vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));

import PredictionPage, { metadata } from './page';

async function showPage() {
  render(await PredictionPage());
}

describe('prediction market settlement safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serverLocale.mockResolvedValue('ko');
    stockApi.mockResolvedValue({ stocks: [] });
  });

  it('never invents prediction liquidity, prices, trades or success receipts', async () => {
    await showPage();
    expect(stockApi).toHaveBeenCalledWith('/api/v1/stocks');
    expect(screen.getByRole('heading', { name: /가상 예측 마켓/ })).toBeDefined();
    expect(screen.getAllByRole('status').some((node) => /예측 지분 거래.*지원하지 않습니다/.test(node.textContent ?? ''))).toBe(true);
    expect(screen.queryByRole('button', { name: /매수|YES|NO/ })).toBeNull();
    expect(screen.queryByText(/5,080,000|1,450,000|체결 완료|실시간 배당률/)).toBeNull();
    expect(screen.getByRole('link', { name: /가상 주식 거래소/ }).getAttribute('href')).toBe('/stocks');
  });

  it('shows only validated backend stocks with accessible links and exact prices', async () => {
    stockApi.mockResolvedValue({ stocks: [
      { symbol: 'WDG', name: '월덕게임즈', current_price: '12345678901234567890' },
      { symbol: 'bad/path', name: 'Bad', current_price: '900' },
      { symbol: 'WDT', name: '월덱테크', current_price: '-42' },
    ] });
    await showPage();
    expect(screen.getByRole('link', { name: /월덕게임즈.*WDG/ }).getAttribute('href')).toBe('/stocks/WDG');
    expect(screen.getByText('12,345,678,901,234,567,890 WLD')).toBeDefined();
    expect(screen.queryByText('Bad')).toBeNull();
    expect(screen.queryByText('월덱테크')).toBeNull();
  });

  it('distinguishes an unavailable stock API from an empty verified catalogue', async () => {
    stockApi.mockResolvedValueOnce(null);
    const unavailable = render(await PredictionPage());
    expect(screen.getAllByRole('status').some((node) => /주식 시세.*불러올 수 없습니다/.test(node.textContent ?? ''))).toBe(true);
    unavailable.unmount();
    await showPage();
    expect(screen.getAllByRole('status').some((node) => /조회된 가상 주식 종목이 없습니다/.test(node.textContent ?? ''))).toBe(true);
  });

  it('supports English navigation and excludes the unimplemented trading route from indexing', async () => {
    serverLocale.mockResolvedValue('en');
    await showPage();
    expect(screen.getByRole('link', { name: /virtual stock exchange/i }).getAttribute('href')).toBe('/stocks');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
