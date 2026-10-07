import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InteractiveOnboardingTracker } from './interactive-onboarding-tracker';
import { LocaleProvider } from '@/components/locale-provider';

describe('InteractiveOnboardingTracker Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders collapsed pill button in Korean and English', () => {
    const { unmount } = render(
      <LocaleProvider initialLocale="ko">
        <InteractiveOnboardingTracker />
      </LocaleProvider>
    );
    expect(screen.getByText(/온보딩 퀘스트/)).toBeDefined();
    unmount();

    render(
      <LocaleProvider initialLocale="en">
        <InteractiveOnboardingTracker />
      </LocaleProvider>
    );
    expect(screen.getByText(/Onboarding Quests/)).toBeDefined();
  });

  it('opens and closes modal using explicit X button and ESC key', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <InteractiveOnboardingTracker />
      </LocaleProvider>
    );
    const openBtn = screen.getByText(/온보딩 퀘스트/);
    fireEvent.click(openBtn);

    // Modal is opened
    expect(screen.getByText(/7대 핵심 기능을 완료하고/)).toBeDefined();

    // Close with X button
    const closeBtn = screen.getByTitle(/창 닫기 \(ESC\)/i);
    fireEvent.click(closeBtn);

    // Reopened
    fireEvent.click(screen.getByText(/온보딩 퀘스트/));
    expect(screen.getByText(/7대 핵심 기능을 완료하고/)).toBeDefined();

    // Close with ESC key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
  });

  it('keeps the expanded card inside a 320px mobile viewport', () => {
    render(
      <LocaleProvider initialLocale="en">
        <InteractiveOnboardingTracker />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByText(/Onboarding Quests/));

    const heading = screen.getByText('Onboarding Quests & Bonus');
    const card = heading.closest('[class*="max-w-[390px]"]');
    expect(card).not.toBeNull();
    expect(card?.className).toContain('w-[calc(100vw-1.75rem)]');
  });

  it('supports dismissing for today and undismissing', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <InteractiveOnboardingTracker />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByText(/온보딩 퀘스트/));

    const dismissTodayBtn = screen.getByText(/오늘 하루 보지 않기/);
    fireEvent.click(dismissTodayBtn);

    // Should show undismiss helper button
    expect(screen.getByText(/퀘스트 다시보기/)).toBeDefined();

    // Click undismiss
    fireEvent.click(screen.getByText(/퀘스트 다시보기/));
    expect(screen.getByText(/7대 핵심 기능을 완료하고/)).toBeDefined();
  });
});
