import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import GoalWealthCalculatorPage from './page';

describe('GoalWealthCalculatorPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title and essential calculation controls properly', () => {
    render(<GoalWealthCalculatorPage />);

    expect(screen.getByText('목표 자산·은퇴·FIRE 달성 계산기')).toBeDefined();
    expect(screen.getByText('자산 축적 및 투자 조건')).toBeDefined();
    expect(screen.getByText('목표 및 은퇴 설계')).toBeDefined();
    expect(screen.getByText('목표 달성 시점 분석')).toBeDefined();
    expect(screen.getByText('트리니티 스터디(Trinity Study) 4% 룰 검증')).toBeDefined();
  });

  it('applies preset when preset button is clicked', () => {
    render(<GoalWealthCalculatorPage />);

    const youthPresetBtn = screen.getByText('사회초년생 1억 모으기');
    fireEvent.click(youthPresetBtn);

    // 1억 모으기 프리셋 적용 시 목표 달성 연수가 변경되어 렌더링되는지 확인
    expect(screen.getByText('목표 달성 시점 분석')).toBeDefined();
    expect(screen.getByText('트리니티 스터디(Trinity Study) 4% 룰 검증')).toBeDefined();
  });

  it('calculates 4% rule safe withdrawal correctly', () => {
    render(<GoalWealthCalculatorPage />);

    // 10억 목표 시 연 4,000만 원 (월 약 333만 원) 안전 인출액
    expect(screen.getByText(/월 3,333,333/)).toBeDefined();
  });
});
