import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StockCalculatorPage from './page';

describe('StockCalculatorPage', () => {
  it('renders title and calculation cards', () => {
    render(<StockCalculatorPage />);

    expect(screen.getByText('주식 물타기·평단가 & 수익률 계산기')).toBeDefined();
    expect(screen.getAllByText('물타기 후 최종 평단가').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('총 투자 원금')).toBeDefined();
  });

  it('allows clicking stock presets', () => {
    render(<StockCalculatorPage />);

    const chipButtons = screen.getAllByText(/침팬지 반도체/);
    const chipButton = chipButtons[0]!;
    fireEvent.click(chipButton);
    expect(screen.getAllByText('물타기 후 최종 평단가').length).toBeGreaterThanOrEqual(1);
  });
});
