// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { WheelGame } from './wheel-game';

vi.mock('./actions', () => ({ playWheel20: vi.fn(async () => ({ status: 'idle' })) }));

describe('wheel history must be genuine server-confirmed outcomes', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('shows an explicit empty state instead of fabricated previous wins', () => {
    render(
      <WheelGame
        minStake="1000"
        maxStake="10000000"
        remainingStake="10000000"
        exhausted={false}
      />,
    );
    expect(screen.getByText('이 화면에서 확인한 서버 결과:')).toBeTruthy();
    expect(screen.getByText('현재 화면에서 진행한 결과가 없습니다.')).toBeTruthy();
    expect(screen.queryByText(/#7 BLUE/)).toBeNull();
    expect(screen.queryByText(/#14 GOLD/)).toBeNull();
  });
});
