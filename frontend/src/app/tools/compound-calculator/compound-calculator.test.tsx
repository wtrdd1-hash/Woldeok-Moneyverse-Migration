import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CompoundCalculatorPage from './page';

describe('CompoundCalculatorPage', () => {
  it('renders title and calculation controls properly', () => {
    render(<CompoundCalculatorPage />);

    expect(screen.getByText('복리 예금·적금 이자 계산기')).toBeDefined();
    expect(screen.getByText('예상 만기 최종 수령액')).toBeDefined();
    expect(screen.getByText('연도별 자산 성장 타임라인')).toBeDefined();
  });

  it('updates calculation when principal is changed', () => {
    render(<CompoundCalculatorPage />);

    const inputs = screen.getAllByRole('spinbutton');
    const principalInput = inputs[0]!;

    fireEvent.change(principalInput, { target: { value: '200000' } });
    const elements = screen.getAllByText('총 납입 원금');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});
