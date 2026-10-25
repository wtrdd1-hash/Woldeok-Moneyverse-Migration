// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { WheelGame } from './wheel-game';

vi.mock('./actions', () => ({ playWheel20: vi.fn() }));

afterEach(cleanup);

describe('wheel game accessible verified result display', () => {
  it('starts with an empty live region, never a synthetic win, and touch-sized stake presets', () => {
    render(<WheelGame minStake="1" maxStake="1000" remainingStake="1000" exhausted={false} />);
    const status = screen.getByText('아직 확인된 룰렛 결과가 없습니다.');
    expect(status.closest('[aria-live="polite"]')).toBeTruthy();
    expect(screen.queryByText(/#7 BLUE/)).toBeNull();
    expect(screen.getByRole('button', { name: '+1,000' }).className).toContain('min-h-11');
  });
});
