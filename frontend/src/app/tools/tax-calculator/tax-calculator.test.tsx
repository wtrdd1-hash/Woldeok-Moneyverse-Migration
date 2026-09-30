import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import TaxCalculatorPage from './page';

describe('TaxCalculatorPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title, category tabs, and tax calculation results', () => {
    render(<TaxCalculatorPage />);

    expect(screen.getByText('가상자산·금융투자 세금 계산기')).toBeDefined();
    expect(screen.getByText('가상자산 (코인/WLD)')).toBeDefined();
    expect(screen.getByText('해외주식')).toBeDefined();
    expect(screen.getByText('배당·이자소득')).toBeDefined();
    expect(screen.getByText('예상 납부 세액 및 실수령액')).toBeDefined();
    expect(screen.getByText('세목별 상세 산출 내역')).toBeDefined();
  });

  it('calculates 22% tax on crypto gains properly', () => {
    render(<TaxCalculatorPage />);

    // 기본 프리셋: 매도 5,000만, 매수 2,000만 -> 차익 3,000만, 공제 250만 -> 과표 2,750만
    // 세금: 2,750만 * 22% = 6,050,000 원
    expect(screen.getByText('6,050,000')).toBeDefined();
  });

  it('shows comprehensive tax warning when dividend exceeds 20,000,000 KRW', () => {
    render(<TaxCalculatorPage />);

    const dividendTab = screen.getByText('배당·이자소득');
    fireEvent.click(dividendTab);

    // 2,400만 원 프리셋이므로 2,000만 원 초과 경고 배너가 표시되어야 함
    expect(screen.getByText(/금융소득종합과세 & 건강보험 피부양자 탈락 주의보/)).toBeDefined();
  });
});
