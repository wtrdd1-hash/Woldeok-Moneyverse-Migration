import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InteractiveOnboardingTracker } from './interactive-onboarding-tracker';

describe('InteractiveOnboardingTracker Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders initial floating button with quest count', () => {
    render(<InteractiveOnboardingTracker />);
    expect(screen.getByText(/온보딩 퀘스트/)).toBeDefined();
  });

  it('opens and closes modal using explicit X button and ESC key', () => {
    render(<InteractiveOnboardingTracker />);
    const openBtn = screen.getByText(/온보딩 퀘스트/);
    fireEvent.click(openBtn);

    // Modal Header should be visible
    expect(screen.getByText('온보딩 퀘스트 & 보너스')).toBeDefined();
    expect(screen.getByLabelText('온보딩 창 닫기')).toBeDefined();

    // Click Close (X) button
    const closeBtn = screen.getByLabelText('온보딩 창 닫기');
    fireEvent.click(closeBtn);

    // Modal should be closed, button reappears
    expect(screen.queryByText('온보딩 퀘스트 & 보너스')).toBeNull();
    expect(screen.getByText(/온보딩 퀘스트/)).toBeDefined();

    // Open again and test ESC key
    fireEvent.click(screen.getByText(/온보딩 퀘스트/));
    expect(screen.getByText('온보딩 퀘스트 & 보너스')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('온보딩 퀘스트 & 보너스')).toBeNull();
  });

  it('supports dismissing for today and undismissing', () => {
    render(<InteractiveOnboardingTracker />);
    fireEvent.click(screen.getByText(/온보딩 퀘스트/));

    const dismissTodayBtn = screen.getByText(/오늘 하루 보지 않기/);
    fireEvent.click(dismissTodayBtn);

    // Should now show minimal undismiss button
    expect(screen.queryByText('온보딩 퀘스트 & 보너스')).toBeNull();
    expect(screen.getByTitle('온보딩 퀘스트 다시 열기')).toBeDefined();

    // Click undismiss
    fireEvent.click(screen.getByTitle('온보딩 퀘스트 다시 열기'));
    expect(screen.getByText('온보딩 퀘스트 & 보너스')).toBeDefined();
  });
});
