import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GoldenDuckFever } from './golden-duck-fever';

vi.mock('@/lib/dopamine-api', () => ({
  claimGoldenDuckFever: vi.fn().mockResolvedValue({ success: true, rewardAmount: 1000 }),
}));

describe('GoldenDuckFever Component', () => {
  it('opens fever modal and increases earned WLD and combo when tapped', () => {
    const onClaimMock = vi.fn();
    render(
      <GoldenDuckFever
        isOpen={true}
        onClaimReward={onClaimMock}
        enableFloatingSpawn={false}
      />
    );

    // Verify header and timer
    expect(screen.getAllByText(/황금 오리 광클 피버 타임/).length).toBeGreaterThan(0);
    expect(screen.getByText(/10초 남음/)).toBeDefined();

    // Tap button
    const tapButton = screen.getAllByRole('button', { name: '피버 코인 광클하기' })[0]!;
    expect(tapButton).toBeDefined();

    // Tap 3 times
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);

    // Score and combo should increase
    expect(screen.getByText(/콤보/)).toBeDefined();
    expect(screen.getByText(/3x/)).toBeDefined();
  });

  it('renders closed state when isOpen is false', () => {
    const { container } = render(
      <GoldenDuckFever
        isOpen={false}
        enableFloatingSpawn={false}
      />
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
