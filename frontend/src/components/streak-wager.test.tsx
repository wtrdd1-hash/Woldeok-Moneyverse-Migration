import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { StreakWagerModal } from './streak-wager-modal';

describe('StreakWagerModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <StreakWagerModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with title and initial streak info when open', () => {
    const { container } = render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        currentStreakDays={5}
        freezesRemaining={3}
      />
    );

    expect(container.textContent).toContain('7일 스트릭 내기 & 주간 리그');
    expect(container.textContent).toContain('5일 연속 유지 중!');
    expect(container.textContent).toContain('3회');
  });

  it('calculates 200% expected payout dynamically based on preset or input', () => {
    const { container, getByRole } = render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Default 5000 WLD -> 10,000 WLD (200%)
    expect(container.textContent).toContain('10,000 WLD (200%)');

    // Click preset 10k -> 20,000 WLD
    const preset10k = getByRole('button', { name: '10k' });
    fireEvent.click(preset10k);
    expect(container.textContent).toContain('20,000 WLD (200%)');
  });

  it('handles check-in click and disables button', () => {
    const handleCheckIn = vi.fn();
    const { container, getByRole } = render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        onCheckIn={handleCheckIn}
      />
    );

    const checkInBtn = getByRole('button', { name: '오늘 출석 체크' });
    fireEvent.click(checkInBtn);

    expect(handleCheckIn).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('오늘 완료됨');
  });

  it('decrements streak freeze count when freeze button is clicked', () => {
    const handleUseFreeze = vi.fn();
    const { container, getByRole } = render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        freezesRemaining={2}
        onUseFreeze={handleUseFreeze}
      />
    );

    expect(container.textContent).toContain('2회');
    const freezeBtn = getByRole('button', { name: '방어권 사용' });
    fireEvent.click(freezeBtn);

    expect(handleUseFreeze).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('1회');
  });

  it('switches to 10-player league view when league tab is clicked', () => {
    const { container, getByRole } = render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
      />
    );

    const leagueTab = getByRole('button', { name: /10인 주간 승강 리그/i });
    fireEvent.click(leagueTab);

    expect(container.textContent).toContain('골드 리그 (Group #402)');
    expect(container.textContent).toContain('CryptoWhale');
    expect(container.textContent).toContain('나 (You)');
  });

  it('calls onStartWager with configured wager amount', () => {
    const handleStartWager = vi.fn();
    const { getByRole } = render(
      <StreakWagerModal
        isOpen={true}
        onClose={() => {}}
        onStartWager={handleStartWager}
      />
    );

    const preset30k = getByRole('button', { name: '30k' });
    fireEvent.click(preset30k);

    const startBtn = getByRole('button', { name: /30,000 WLD 스트릭 내기 시작하기/i });
    fireEvent.click(startBtn);

    expect(handleStartWager).toHaveBeenCalledWith(30000);
  });
});
