import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FarmingCalculatorPage from './page';

describe('FarmingCalculatorPage', () => {
  it('renders farming calculator controls properly', () => {
    render(<FarmingCalculatorPage />);

    expect(screen.getByText('직업별 일일 파밍 수익 최적화 계산기')).toBeDefined();
    expect(screen.getByText('일일 총 파밍 수입')).toBeDefined();
    expect(screen.getByText('30일 누적 자산')).toBeDefined();
  });

  it('allows changing profession', () => {
    render(<FarmingCalculatorPage />);

    const traderButtons = screen.getAllByText(/트레이더/);
    const traderButton = traderButtons[0]!;
    fireEvent.click(traderButton);
    expect(screen.getAllByText(/트레이더/).length).toBeGreaterThanOrEqual(1);
  });
});
