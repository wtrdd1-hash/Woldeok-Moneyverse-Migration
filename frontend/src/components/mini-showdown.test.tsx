import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MiniShowdownModal } from './mini-showdown-modal';

describe('MiniShowdownModal Component', () => {
  it('renders showdown arena and round counters', () => {
    const onCloseMock = vi.fn();
    render(<MiniShowdownModal isOpen={true} onClose={onCloseMock} stake={100} />);

    expect(screen.getByText(/1:1 주사위 미니 결투/)).toBeDefined();
    expect(screen.getByText(/ROUND 1/)).toBeDefined();
    expect(screen.getByText(/나 \(Player\)/)).toBeDefined();
    expect(screen.getByText(/AI 덕이봇/)).toBeDefined();
  });

  it('triggers dice roll when roll button is clicked', () => {
    render(<MiniShowdownModal isOpen={true} onClose={() => {}} />);

    const rollBtn = screen.getByRole('button', { name: /주사위 굴리기/ });
    expect(rollBtn).toBeDefined();

    fireEvent.click(rollBtn);
    expect(screen.getByText(/주사위 굴리는 중/)).toBeDefined();
  });
});
