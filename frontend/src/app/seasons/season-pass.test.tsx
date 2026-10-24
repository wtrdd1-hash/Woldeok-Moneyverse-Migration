import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeasonPassTrack } from './season-pass-track';

describe('Verified season pass', () => {
  it('does not invent XP, claimed levels, or successful reward receipts when unavailable', () => {
    render(<SeasonPassTrack currentSeason={null} />);
    expect(screen.getByText(/시즌 진행 정보를 확인할 수 없습니다/)).toBeDefined();
    expect(screen.queryByText(/18,500|수령 완료|수령 가능 보상 전체 받기/)).toBeNull();
    expect(screen.queryByRole('button', { name: /보상 받기|수령/ })).toBeNull();
  });

  it('displays only the member-scoped score, tier and rank returned by the server', () => {
    render(<SeasonPassTrack currentSeason={{
      seasonId: 'season-1', seasonName: '2026 가을', myScore: 250,
      myTier: 'BRONZE', myRank: 3, lifecycleState: 'active', tierRewardWld: 100, tierTrophy: null,
    }} />);
    expect(screen.getByText('2026 가을')).toBeDefined();
    expect(screen.getByText(/250점/)).toBeDefined();
    expect(screen.getByText(/BRONZE/)).toBeDefined();
    expect(screen.getByText(/3위/)).toBeDefined();
    expect(screen.getByText(/마일스톤 보상은 현재 미리보기/)).toBeDefined();
    expect(screen.queryByRole('button', { name: /보상 받기|수령/ })).toBeNull();
  });
});
