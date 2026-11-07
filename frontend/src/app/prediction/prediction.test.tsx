import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictionPage, { metadata } from './page';

describe('Prediction market source and settlement safety', () => {
  it('does not offer fictional pools, odds, or a fake successful purchase', () => {
    render(<PredictionPage />);
    expect(screen.getByRole('heading', { name: /가상 예측 마켓/ })).toBeDefined();
    expect(screen.getByRole('status').textContent).toMatch(/거래.*중단|이용.*중단/);
    expect(screen.queryByText(/5,080,000 WLD/)).toBeNull();
    expect(screen.queryByText(/1,450,000 WLD/)).toBeNull();
    expect(screen.queryByRole('button', { name: /지분 매수/ })).toBeNull();
    expect(screen.queryByText(/예측 지분 체결 완료/)).toBeNull();
  });

  it('offers accessible navigation instead of an unverified trade', () => {
    render(<PredictionPage />);
    expect(screen.getByRole('link', { name: /주식 시장/ }).getAttribute('href')).toBe('/stocks');
    expect(screen.getByRole('link', { name: /도움말/ }).getAttribute('href')).toBe('/help');
  });

  it('keeps the unverified market out of search results', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
