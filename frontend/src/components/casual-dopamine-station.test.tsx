import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CasualDopamineStation } from './casual-dopamine-station';

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
    render(<CasualDopamineStation />);

    expect(screen.getByText('도파민 아케이드 스테이션 (Daily Arcade)')).toBeDefined();
    expect(screen.getAllByText(/황금 오리 피버 타임/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/덕이 펫 & 포춘쿠키/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/스타 드롭 \(Star Drop\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1:1 주사위 쇼다운/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1클릭 여론 잭팟 투표/).length).toBeGreaterThan(0);
  });

  it('opens star drop modal when star drop card is clicked', () => {
    render(<CasualDopamineStation />);

    const starDropCard = screen.getAllByText(/스타 드롭 \(Star Drop\)/)[0]!;
    fireEvent.click(starDropCard);

    expect(screen.getByText('Brawl Stars형 스타 드롭 (Star Drop)')).toBeDefined();
  });

  it('opens mini showdown modal when showdown card is clicked', () => {
    render(<CasualDopamineStation />);

    const showdownCard = screen.getAllByText(/1:1 주사위 쇼다운/)[0]!;
    fireEvent.click(showdownCard);

    expect(screen.getByText('1:1 주사위 미니 결투 (3판 2선승)')).toBeDefined();
  });
});
