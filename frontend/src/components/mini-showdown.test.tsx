import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';
import { MiniShowdownModal } from './mini-showdown-modal';
import { resolveMiniShowdown } from '@/lib/dopamine-api';

vi.mock('@/lib/dopamine-api', () => ({
  resolveMiniShowdown: vi.fn().mockResolvedValue({ success: true, payout: 190 }),
}));

describe('MiniShowdownModal Component', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.mocked(resolveMiniShowdown).mockClear();
  });

  it('never claims WLD or calls a settlement endpoint after a local practice victory', async () => {
    vi.useFakeTimers();
    const onGameFinish = vi.fn();
    const randomSpy = vi.spyOn(Math, 'random');
    render(<MiniShowdownModal isOpen={true} onClose={() => {}} stake={100} onGameFinish={onGameFinish} />);
    expect(screen.getByText(/연습 모드/)).toBeDefined();
    expect(screen.queryByText(/1\.90x|WLD 획득|WLD 초소액/)).toBeNull();
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button', { name: '주사위 굴리기' }));
      randomSpy.mockReturnValueOnce(0.99).mockReturnValueOnce(0.01);
      await act(async () => { await vi.advanceTimersByTimeAsync(600); });
    }
    expect(screen.getByText(/연습 승리/)).toBeDefined();
    expect(screen.queryByText(/WLD 획득/)).toBeNull();
    expect(onGameFinish).not.toHaveBeenCalled();
    expect(resolveMiniShowdown).not.toHaveBeenCalled();
  });

  it('never sends a financial settlement request after a local practice loss', async () => {
    vi.useFakeTimers();
    const onGameFinish = vi.fn();
    const randomSpy = vi.spyOn(Math, 'random');
    render(<MiniShowdownModal isOpen={true} onClose={() => {}} onGameFinish={onGameFinish} />);
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button', { name: '주사위 굴리기' }));
      randomSpy.mockReturnValueOnce(0.01).mockReturnValueOnce(0.99);
      await act(async () => { await vi.advanceTimersByTimeAsync(600); });
    }
    expect(screen.getByText(/연습 패배/)).toBeDefined();
    expect(onGameFinish).not.toHaveBeenCalled();
    expect(resolveMiniShowdown).not.toHaveBeenCalled();
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
