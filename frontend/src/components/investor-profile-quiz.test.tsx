import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LocaleProvider } from '@/components/locale-provider';
import { InvestorProfileQuiz } from './investor-profile-quiz';
import { saveOnboardingState, getOnboardingState } from '@/lib/onboarding-tracker';

describe('InvestorProfileQuiz Component - Multi-Language Support', () => {
  beforeEach(() => {
    saveOnboardingState({ completed: [], claimed: [], totalEarnedWld: 0 });
    vi.clearAllMocks();
  });

  it('renders initial quiz question (Q1) in Korean', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <InvestorProfileQuiz />
      </LocaleProvider>
    );
    expect(screen.getByText(/Q1\. 당신의 주된 자산 증식 목표는 무엇인가요\?/i)).toBeDefined();
    expect(screen.getByText(/원금 100% 안전 보장과 복리 이자/i)).toBeDefined();
    expect(screen.getByText(/질문 1 \/ 3/i)).toBeDefined();
  });

  it('renders initial quiz question in English', () => {
    render(
      <LocaleProvider initialLocale="en">
        <InvestorProfileQuiz />
      </LocaleProvider>
    );
    expect(screen.getByText(/Q1\. What is your primary wealth-building objective\?/i)).toBeDefined();
    expect(screen.getByText(/100% Principal Protection & Compound Interest/i)).toBeDefined();
    expect(screen.getByText(/Question 1 \/ 3/i)).toBeDefined();
  });

  it('progresses through 3 questions in English and shows final result profile and rewards quest', () => {
    render(
      <LocaleProvider initialLocale="en">
        <InvestorProfileQuiz />
      </LocaleProvider>
    );

    // Step 1: select conservative option
    const opt1 = screen.getByText(/100% Principal Protection & Compound Interest/i);
    fireEvent.click(opt1);

    // Step 2: select conservative option
    expect(screen.getByText(/Q2\. How do you react if your portfolio drops -10% temporarily\?/i)).toBeDefined();
    const opt2 = screen.getByText(/Panic sell immediately and move to zero-risk deposits/i);
    fireEvent.click(opt2);

    // Step 3: select conservative option
    expect(screen.getByText(/Q3\. How much time can you dedicate daily to portfolio management\?/i)).toBeDefined();
    const opt3 = screen.getByText(/10 seconds daily to claim interest and spin the lucky roulette/i);
    fireEvent.click(opt3);

    // Should show Conservative result in English
    expect(screen.getByText(/Conservative Compound Sentinel/i)).toBeDefined();
    expect(screen.getByText(/Target Yield: 연 7.2% ~ 12.0%/i)).toBeDefined();

    // Verify onboarding state updated
    const state = getOnboardingState();
    expect(state.completed).toContain('take_quiz');
  });

  it('renders in Japanese and completes quiz', () => {
    render(
      <LocaleProvider initialLocale="ja">
        <InvestorProfileQuiz />
      </LocaleProvider>
    );
    expect(screen.getByText(/Q1\. あなたの主な資産形成目標は何ですか？/i)).toBeDefined();
    const opt1 = screen.getByText(/元本100%保証と複利利息/i);
    fireEvent.click(opt1);

    expect(screen.getByText(/Q2\. 保有資産が一時的に -10% 下落した場合の行動は？/i)).toBeDefined();
    const opt2 = screen.getByText(/不安のため即座に全額引き出して安全預金へ避難/i);
    fireEvent.click(opt2);

    expect(screen.getByText(/Q3\. 1日に資産管理に充てられる時間はどのくらいですか？/i)).toBeDefined();
    const opt3 = screen.getByText(/1日10秒、複利利息確認とルーレットを回すだけ/i);
    fireEvent.click(opt3);

    expect(screen.getByText(/元本防衛・複利ガーディアン/i)).toBeDefined();
  });

  it('renders in Chinese and completes quiz', () => {
    render(
      <LocaleProvider initialLocale="zh">
        <InvestorProfileQuiz />
      </LocaleProvider>
    );
    expect(screen.getByText(/Q1\. 您最主要的资产增值核心目标是什么？/i)).toBeDefined();
    const opt1 = screen.getByText(/100%保本安全与稳健复利利息/i);
    fireEvent.click(opt1);

    expect(screen.getByText(/Q2\. 当持仓组合短线下跌 -10% 时，您的第一反应是？/i)).toBeDefined();
    const opt2 = screen.getByText(/极度焦虑并立即全额撤出转入零风险银行储蓄/i);
    fireEvent.click(opt2);

    expect(screen.getByText(/Q3\. 您每天愿意投入多少时间在投资与资产管理上？/i)).toBeDefined();
    const opt3 = screen.getByText(/每天仅需10秒查看利息与旋转每日幸运转盘/i);
    fireEvent.click(opt3);

    expect(screen.getByText(/稳健防守型·复利守门人/i)).toBeDefined();
  });

  it('resets quiz when reset button is clicked', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <InvestorProfileQuiz />
      </LocaleProvider>
    );

    // Complete quiz
    fireEvent.click(screen.getByText(/원금 100% 안전 보장과 복리 이자/i));
    fireEvent.click(screen.getByText(/너무 불안해서 즉시 전액 인출 및 예금 이동/i));
    fireEvent.click(screen.getByText(/하루 10초 복리 이자 확인 및 룰렛만 돌리기/i));

    expect(screen.getByText(/철통 방어 복리 수호자/i)).toBeDefined();

    // Click reset
    const resetBtn = screen.getByText(/성향 다시 진단하기/i);
    fireEvent.click(resetBtn);

    // Should return to Q1
    expect(screen.getByText(/Q1\. 당신의 주된 자산 증식 목표는 무엇인가요\?/i)).toBeDefined();
  });
});
