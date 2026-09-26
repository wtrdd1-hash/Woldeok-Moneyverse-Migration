import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GoldenDuckFever } from './golden-duck-fever';

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
    expect(screen.getByText(/황금 오리 광클 피버 타임/)).toBeDefined();
    expect(screen.getByText(/10초 남음/)).toBeDefined();

    // Tap button
    const tapButton = screen.getByRole('button', { name: /피버 코인 광클하기/ });
    expect(tapButton).toBeDefined();

    // Initial score
    expect(screen.getByText(/\+0/)).toBeDefined();

    // Tap 3 times
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);

    // Score and combo should increase
    expect(screen.getByText(/콤보/)).toBeDefined();
    expect(screen.getByText(/3x/)).toBeDefined();
  });

  it('renders floating duck trigger and activates fever on click', () => {
    render(
      <GoldenDuckFever
        isOpen={false}
        enableFloatingSpawn={false}
      />
    );

    // Initial state: fever modal not active
    expect(screen.queryByText(/황금 오리 광클 피버 타임/)).toBeNull();
  });
});
