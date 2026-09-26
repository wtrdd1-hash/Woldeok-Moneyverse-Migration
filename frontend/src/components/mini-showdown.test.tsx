import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { MiniShowdownModal } from './mini-showdown-modal';

vi.mock('@/lib/dopamine-api', () => ({
  resolveMiniShowdown: vi.fn().mockResolvedValue({ success: true, payout: 190 }),
}));

describe('MiniShowdownModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders showdown arena and round counters', () => {
    const onCloseMock = vi.fn();
    render(<MiniShowdownModal isOpen={true} onClose={onCloseMock} stake={100} />);

    expect(screen.getByText(/1:1 주사위 미니 결투/)).toBeDefined();
    expect(screen.getByText(/ROUND 1/)).toBeDefined();
    expect(screen.getByText(/나 \(Player\)/)).toBeDefined();
    expect(screen.getAllByText(/AI 덕이봇/).length).toBeGreaterThan(0);
  });

  it('triggers dice roll when roll button is clicked', () => {
    render(<MiniShowdownModal isOpen={true} onClose={() => {}} />);

    const rollBtn = screen.getByRole('button', { name: '주사위 굴리기' });
    expect(rollBtn).toBeDefined();

    fireEvent.click(rollBtn);
    expect(screen.getByText(/주사위 굴리는 중/)).toBeDefined();
  });
});
