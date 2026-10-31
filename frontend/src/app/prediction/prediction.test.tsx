import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { parseStockPreview } from './prediction-source';
import { PredictionView } from './prediction-view';

const stock = {
  id: '11111111-1111-4111-8111-111111111111',
  symbol: 'WDG',
  name: 'Woldeok Games',
  current_price: '12345678901234567890',
};

describe('Prediction market source truth', () => {
  it('accepts only verified stock snapshots without inventing prediction odds', () => {
    expect(parseStockPreview({ stocks: [stock] })).toEqual({
      status: 'verified',
      stocks: [{ symbol: 'WDG', name: 'Woldeok Games', price: '12345678901234567890' }],
    });
  });

  it('distinguishes a verified empty list from missing or malformed source', () => {
    expect(parseStockPreview({ stocks: [] })).toEqual({ status: 'empty', stocks: [] });
    for (const bad of [null, undefined, {}, { stocks: null }, { stocks: [stock, stock] },
      { stocks: [{ ...stock, current_price: '-1' }] },
      { stocks: [{ ...stock, id: 'not-a-uuid' }] },
    ]) {
      expect(parseStockPreview(bad).status).toBe('unavailable');
    }
  });

  it('never renders buy actions, fabricated odds, or a successful trade receipt', () => {
    render(<PredictionView source={parseStockPreview({ stocks: [stock] })} />);
    expect(screen.getByText(/Woldeok Games/)).toBeDefined();
    expect(screen.getByText(/12,345,678,901,234,567,890 WLD/)).toBeDefined();
    expect(screen.queryByRole('button', { name: /매수|buy/i })).toBeNull();
    expect(screen.queryByText(/체결 완료|5,080,000 WLD|1\.68x|2\.32x/)).toBeNull();
    expect(screen.getByText(/최신성은 검증되지 않았습니다/)).toBeDefined();
  });

  it('announces unavailable data without claiming zero prediction markets', () => {
    render(<PredictionView source={parseStockPreview(null)} />);
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
    expect(screen.queryByText(/0 WLD|체결 완료|1\.68x/)).toBeNull();
  });
});
