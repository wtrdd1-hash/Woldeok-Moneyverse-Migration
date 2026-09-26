import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreakWagerModal } from './streak-wager-modal';

describe('StreakWagerModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <StreakWagerModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with title and initial streak info when open', () => {
    render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        currentStreakDays={5}
        freezesRemaining={3}
      />
    );

    expect(screen.getByText('7일 스트릭 내기 & 주간 리그')).toBeInTheDocument();
    expect(screen.getByText('5일 연속 유지 중!')).toBeInTheDocument();
    expect(screen.getByText('3회')).toBeInTheDocument();
  });

  it('calculates 200% expected payout dynamically based on preset or input', () => {
    render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Default 5000 WLD -> 10,000 WLD (200%)
    expect(screen.getByText('10,000 WLD (200%)')).toBeInTheDocument();

    // Click preset 10k -> 20,000 WLD
    const preset10k = screen.getByRole('button', { name: '10k' });
    fireEvent.click(preset10k);
    expect(screen.getByText('20,000 WLD (200%)')).toBeInTheDocument();
  });

  it('handles check-in click and disables button', () => {
    const handleCheckIn = vi.fn();
    render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        onCheckIn={handleCheckIn}
      />
    );

    const checkInBtn = screen.getByRole('button', { name: '오늘 출석 체크' });
    fireEvent.click(checkInBtn);

    expect(handleCheckIn).toHaveBeenCalledTimes(1);
    expect(screen.getByText('오늘 완료됨')).toBeInTheDocument();
  });

  it('decrements streak freeze count when freeze button is clicked', () => {
    const handleUseFreeze = vi.fn();
    render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        freezesRemaining={2}
        onUseFreeze={handleUseFreeze}
      />
    );

    expect(screen.getByText('2회')).toBeInTheDocument();
    const freezeBtn = screen.getByRole('button', { name: '방어권 사용' });
    fireEvent.click(freezeBtn);

    expect(handleUseFreeze).toHaveBeenCalledTimes(1);
    expect(screen.getByText('1회')).toBeInTheDocument();
  });

  it('switches to 10-player league view when league tab is clicked', () => {
    render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
      />
    );

    const leagueTab = screen.getByRole('button', { name: /10인 주간 승강 리그/i });
    fireEvent.click(leagueTab);

    expect(screen.getByText('골드 리그 (Group #402)')).toBeInTheDocument();
    expect(screen.getByText('CryptoWhale')).toBeInTheDocument();
    expect(screen.getByText('나 (You)')).toBeInTheDocument();
  });

  it('calls onStartWager with configured wager amount', () => {
    const handleStartWager = vi.fn();
    render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        onStartWager={handleStartWager}
      />
    );

    const preset30k = screen.getByRole('button', { name: '30k' });
    fireEvent.click(preset30k);

    const startBtn = screen.getByRole('button', { name: /30,000 WLD 스트릭 내기 시작하기/i });
    fireEvent.click(startBtn);

    expect(handleStartWager).toHaveBeenCalledWith(30000);
  });
});
