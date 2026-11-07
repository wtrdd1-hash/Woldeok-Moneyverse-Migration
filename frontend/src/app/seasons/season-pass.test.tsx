import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeasonPassTrack } from './season-pass-track';
import { SeasonHallOfFameTicker } from './hall-of-fame-ticker';

describe('Season reward provenance gate', () => {
  it('does not offer milestone claims without a verified ledger-backed reward contract', () => {
    render(<SeasonPassTrack />);
    expect(screen.getByRole('status').textContent).toMatch(/서버.*검증|원장.*확인/);
    expect(screen.queryByRole('button', { name: /보상 받기|전체 받기/ })).toBeNull();
    expect(screen.queryByText(/현재 티어: Level 19/)).toBeNull();
    expect(screen.queryByText(/수령 완료: 4/)).toBeNull();
    expect(screen.queryByText(/300 WLD 지원금/)).toBeNull();
  });

  it('does not invent historic winners or WLD contributions', () => {
    render(<SeasonHallOfFameTicker />);
    expect(screen.getByRole('status').textContent).toMatch(/검증|확인/);
    expect(screen.queryByText(/GoldenBull|WSTiger|NeoMoney/)).toBeNull();
    expect(screen.queryByRole('button', { name: /명예의 전당 기록관/ })).toBeNull();
  });

  it('keeps reward hold messages accessible without a simulated transaction', () => {
    const { container } = render(<SeasonPassTrack />);
    expect(container.querySelector('section[aria-labelledby]')).not.toBeNull();
    expect(screen.queryByText(/성공적으로 수령했습니다|한 번에 모두 수령했습니다/)).toBeNull();
  });
});
