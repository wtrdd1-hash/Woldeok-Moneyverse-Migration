import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { LocaleProvider } from '@/components/locale-provider';
import { CareerStepByStepGuide } from './career-step-by-step-guide';

describe('CareerStepByStepGuide Component - Multi-Language & Interactivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tab buttons and displays initial 4-step flow in Korean', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <CareerStepByStepGuide />
      </LocaleProvider>
    );
    expect(screen.getByText(/1. 4단계 수행 절차/)).toBeDefined();
    expect(screen.getByText(/2. 8대 직업군 도감/)).toBeDefined();
    expect(screen.getByText(/3. 7대 승진 티어/)).toBeDefined();
    expect(screen.getByText(/4. 실전 모의 체험/)).toBeDefined();

    expect(screen.getByText('STEP 01')).toBeDefined();
    expect(screen.getByText('직업 선택 및 전직')).toBeDefined();
    expect(screen.getByText('STEP 02')).toBeDefined();
    expect(screen.getByText('STEP 03')).toBeDefined();
    expect(screen.getByText('STEP 04')).toBeDefined();
  });

  it('renders tab buttons and displays initial 4-step flow in English', () => {
    render(
      <LocaleProvider initialLocale="en">
        <CareerStepByStepGuide />
      </LocaleProvider>
    );
    expect(screen.getByText(/1. 4-Step Flow/)).toBeDefined();
    expect(screen.getByText(/2. 8 Career Directory/)).toBeDefined();
    expect(screen.getByText(/3. 7 Mastery Tiers/)).toBeDefined();
    expect(screen.getByText(/4. Interactive Simulator/)).toBeDefined();

    expect(screen.getByText('STEP 01')).toBeDefined();
    expect(screen.getByText('Select Job & Switch')).toBeDefined();
    expect(screen.getByText('Accept Task (Claim)')).toBeDefined();
  });

  it('renders tab buttons in Japanese and switches to 8-job catalog', () => {
    render(
      <LocaleProvider initialLocale="ja">
        <CareerStepByStepGuide />
      </LocaleProvider>
    );
    const jobsTab = screen.getByText(/2. 8大職業図鑑/);
    fireEvent.click(jobsTab);

    expect(screen.getAllByText('フィンテック開発者').length).toBeGreaterThan(0);
    expect(screen.getByText('クオンツトレーダー')).toBeDefined();
    expect(screen.getByText('中央銀行総裁・金融官')).toBeDefined();

    // Click another job
    const quantBtn = screen.getByText('クオンツトレーダー');
    fireEvent.click(quantBtn);
    expect(screen.getByText('Quant Trader')).toBeDefined();
  });

  it('renders in Chinese and switches to mastery tier roadmap tab', () => {
    render(
      <LocaleProvider initialLocale="zh">
        <CareerStepByStepGuide />
      </LocaleProvider>
    );
    const masteryTab = screen.getByText(/3. 7大晋升段位/);
    fireEvent.click(masteryTab);

    expect(screen.getByText(/职业熟练度 \(Mastery\) 晋升成长阶梯/)).toBeDefined();
    expect(screen.getByText('见习学徒 (Apprentice)')).toBeDefined();
    expect(screen.getByText('传奇殿堂 (Grandmaster)')).toBeDefined();
  });

  it('runs interactive work task simulation end-to-end', async () => {
    vi.useFakeTimers();
    render(
      <LocaleProvider initialLocale="ko">
        <CareerStepByStepGuide />
      </LocaleProvider>
    );
    const simTab = screen.getByText(/4. 실전 모의 체험/);
    fireEvent.click(simTab);

    // Initial state: Claim button
    const claimBtn = screen.getByText(/1단계: 업무 수락하기/);
    fireEvent.click(claimBtn);

    // Fast-forward countdown 3 times
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Ready to submit
    const submitBtn = screen.getByText(/2단계: 업무 완료 제출/);
    expect(submitBtn).toBeDefined();
    fireEvent.click(submitBtn);

    // Claimed state
    expect(screen.getByText(/급여 \+.*WLD 입금 완료!/)).toBeDefined();

    vi.useRealTimers();
  });
});
