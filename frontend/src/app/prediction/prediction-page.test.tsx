import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictionPage, { metadata } from './page';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));

const api = vi.mocked(apiOrNull);

describe('Prediction page server API integration', () => {
  beforeEach(() => api.mockReset());

  it('loads the real stock-list endpoint without attempting prediction orders', async () => {
    api.mockResolvedValue({ stocks: [{
      id: '11111111-1111-4111-8111-111111111111',
      symbol: 'WDG', name: 'Woldeok Games', current_price: '1700',
    }] });
    render(await PredictionPage());
    expect(api).toHaveBeenCalledExactlyOnceWith('/api/v1/stocks');
    expect(screen.getByText(/1,700 WLD/)).toBeDefined();
    expect(screen.queryByRole('button', { name: /매수|buy/i })).toBeNull();
  });

  it('does not treat API failures as a verified empty stock list', async () => {
    api.mockResolvedValue(null);
    render(await PredictionPage());
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
    expect(screen.queryByText(/현재 등록된 종목이 없음/)).toBeNull();
  });

  it('marks the unimplemented prediction trading route non-indexable', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
