import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InvestorProfileQuiz } from './investor-profile-quiz';
import { saveOnboardingState, getOnboardingState } from '@/lib/onboarding-tracker';

describe('InvestorProfileQuiz Component', () => {
  beforeEach(() => {
    saveOnboardingState({ completed: [], claimed: [], totalEarnedWld: 0 });
    vi.clearAllMocks();
  });

  it('renders initial quiz question (Q1)', () => {
    render(<InvestorProfileQuiz />);
    expect(screen.getByText(/Q1\. 당신의 주된 자산 증식 목표는 무엇인가요\?/i)).toBeDefined();
    expect(screen.getByText(/원금 100% 안전 보장과 복리 이자/i)).toBeDefined();
    expect(screen.getByText(/질문 1 \/ 3/i)).toBeDefined();
  });

  it('progresses through 3 questions and shows final result profile and rewards quest', () => {
    render(<InvestorProfileQuiz />);

    // Step 1: select conservative option A
    const opt1 = screen.getByText(/원금 100% 안전 보장과 복리 이자/i);
    fireEvent.click(opt1);

    // Step 2: select conservative option A
    expect(screen.getByText(/Q2\. 보유 자산이 일시적으로 -10% 하락했을 때 당신의 행동은\?/i)).toBeDefined();
    const opt2 = screen.getByText(/너무 불안해서 즉시 전액 인출 및 예금 이동/i);
    fireEvent.click(opt2);

    // Step 3: select conservative option A
    expect(screen.getByText(/Q3\. 하루에 투자 및 자산 관리에 할애할 수 있는 시간은\?/i)).toBeDefined();
    const opt3 = screen.getByText(/하루 10초 복리 이자 확인 및 룰렛만 돌리기/i);
    fireEvent.click(opt3);

    // Should show Conservative result
    expect(screen.getByText(/철통 방어 복리 수호자/i)).toBeDefined();
    expect(screen.getByText(/안정형 \(Conservative Sentinel\)/i)).toBeDefined();

    // Verify onboarding state updated
    const state = getOnboardingState();
    expect(state.completed).toContain('take_quiz');
  });

  it('resets quiz when reset button is clicked', () => {
    render(<InvestorProfileQuiz />);

    // Complete quiz
    fireEvent.click(screen.getByText(/원금 100% 안전 보장과 복리 이자/i));
    fireEvent.click(screen.getByText(/너무 불안해서 즉시 전액 인출 및 예금 이동/i));
    fireEvent.click(screen.getByText(/하루 10초 복리 이자 확인 및 룰렛만 돌리기/i));

    expect(screen.getByText(/철통 방어 복리 수호자/i)).toBeDefined();

    // Click Reset
    const resetBtn = screen.getByText(/성향 다시 진단하기/i);
    fireEvent.click(resetBtn);

    // Should return to Q1
    expect(screen.getByText(/Q1\. 당신의 주된 자산 증식 목표는 무엇인가요\?/i)).toBeDefined();
  });
});
