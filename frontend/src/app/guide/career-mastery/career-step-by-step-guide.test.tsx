import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { CareerStepByStepGuide } from './career-step-by-step-guide';

describe('CareerStepByStepGuide Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tab buttons and displays initial 4-step flow', () => {
    render(<CareerStepByStepGuide />);
    expect(screen.getByText(/1. 4단계 수행 절차/)).toBeDefined();
    expect(screen.getByText(/2. 8대 직업군 도감/)).toBeDefined();
    expect(screen.getByText(/3. 7대 승진 티어/)).toBeDefined();
    expect(screen.getByText(/4. 실전 모의 체험/)).toBeDefined();

    expect(screen.getByText('STEP 01')).toBeDefined();
    expect(screen.getByText('STEP 02')).toBeDefined();
    expect(screen.getByText('STEP 03')).toBeDefined();
    expect(screen.getByText('STEP 04')).toBeDefined();
  });

  it('switches to 8-job catalog and selects a job', () => {
    render(<CareerStepByStepGuide />);
    const jobsTab = screen.getByText(/2. 8대 직업군 도감/);
    fireEvent.click(jobsTab);

    expect(screen.getAllByText('핀테크 개발자').length).toBeGreaterThan(0);
    expect(screen.getByText('퀀트 트레이더')).toBeDefined();
    expect(screen.getByText('중앙은행가')).toBeDefined();

    // Click another job
    const quantBtn = screen.getByText('퀀트 트레이더');
    fireEvent.click(quantBtn);
    expect(screen.getByText('Quant Trader')).toBeDefined();
  });

  it('switches to mastery tier roadmap tab', () => {
    render(<CareerStepByStepGuide />);
    const masteryTab = screen.getByText(/3. 7대 승진 티어/);
    fireEvent.click(masteryTab);

    expect(screen.getByText(/직업 숙련도\(Mastery\) 승진 로드맵/)).toBeDefined();
    expect(screen.getByText('견습 (Apprentice)')).toBeDefined();
    expect(screen.getByText('레거시 명예 (Grandmaster)')).toBeDefined();
  });

  it('runs interactive work task simulation end-to-end', async () => {
    vi.useFakeTimers();
    render(<CareerStepByStepGuide />);
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
