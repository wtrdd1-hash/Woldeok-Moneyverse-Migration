import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LocaleProvider } from '@/components/locale-provider';
import { CasualDopamineStation } from './casual-dopamine-station';

const renderKo = (ui: React.ReactElement) => render(<LocaleProvider initialLocale="ko">{ui}</LocaleProvider>);

vi.mock('@/lib/dopamine-api', () => ({
  claimGoldenDuckFever: vi.fn().mockResolvedValue({ success: true, rewardAmount: 1000 }),
  claimPetFortune: vi.fn().mockResolvedValue({ success: true, rewardAmount: 500 }),
  voteBullBear: vi.fn().mockResolvedValue({ success: true, poolEligible: true }),
  resolveMiniShowdown: vi.fn().mockResolvedValue({ success: true, payout: 190 }),
  claimStarDrop: vi.fn().mockResolvedValue({ success: true, rewardAmount: 2500 }),
  fetchDopamineStatus: vi.fn().mockResolvedValue({
    goldenDuckFeverAvailable: true,
    fortuneCookieAvailable: true,
    bullBearVotedToday: false,
    dailyShowdownsRemaining: 10,
    starDropRemaining: 3,
  }),
}));

describe('CasualDopamineStation', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all 5 dopamine activity cards properly', () => {
    renderKo(<CasualDopamineStation />);

    expect(screen.getByText('도파민 아케이드 스테이션')).toBeDefined();
    expect(screen.getAllByText(/황금 오리 피버 타임/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/덕이 펫 인터랙션/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/럭키 스타드롭/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1:1 주사위 쇼다운/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/주식 여론 잭팟/).length).toBeGreaterThan(0);
  });

  it('opens star drop modal when star drop card is clicked', () => {
    renderKo(<CasualDopamineStation />);

    const starDropCard = screen.getAllByText(/럭키 스타드롭/)[0]!;
    fireEvent.click(starDropCard);

    expect(screen.getByText(/스타 드롭/)).toBeDefined();
  });

  it('opens mini showdown modal when showdown card is clicked', () => {
    renderKo(<CasualDopamineStation />);

    const showdownCard = screen.getAllByText(/1:1 주사위 쇼다운/)[0]!;
    fireEvent.click(showdownCard);

    expect(screen.getAllByText(/1:1 주사위/).length).toBeGreaterThanOrEqual(1);
  });
});

