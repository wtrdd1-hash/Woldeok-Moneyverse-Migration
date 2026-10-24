import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeasonHallOfFameTicker } from './hall-of-fame-ticker';

describe('Verified season archive', () => {
  it('shows an unavailable state instead of fabricated honorees', () => {
    render(<SeasonHallOfFameTicker seasons={null} />);
    expect(screen.getByText(/명예의 전당 기록을 확인할 수 없습니다/)).toBeDefined();
    expect(screen.queryByText(/골든불|14,850,000/)).toBeNull();
  });

  it('distinguishes a confirmed empty archive from a failed request', () => {
    render(<SeasonHallOfFameTicker seasons={[]} />);
    expect(screen.getByText(/확정된 시즌 명예의 전당 기록이 없습니다/)).toBeDefined();
  });

  it('renders only settled honorees and offers a keyboard accessible disclosure', () => {
    render(<SeasonHallOfFameTicker seasons={[{
      seasonId: 's1', seasonName: '2026 가을', settledAt: '2026-10-01T00:00:00Z',
      honorees: [{ rank: 1, displayName: '실제 회원', score: 300, trophyName: '1위 트로피' }],
    }]} />);
    expect(screen.getByText(/실제 회원/)).toBeDefined();
    expect(screen.getByText('2026 가을')).toBeDefined();
    expect(screen.getByText(/300점/)).toBeDefined();
    expect(screen.queryByText(/골든불|14,850,000/)).toBeNull();
    expect(screen.getByText(/명예의 전당 기록 보기/).closest('summary')).not.toBeNull();
  });
});
