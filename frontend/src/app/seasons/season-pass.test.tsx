import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeasonPassTrack, SEASON_1_MILESTONES } from './season-pass-track';

describe('SeasonPassTrack Component', () => {
  it('시즌 패스 50레벨 로드맵 및 티어 정보가 정상 렌더링된다', () => {
    render(<SeasonPassTrack userXp={18500} initialClaimedLevels={[1, 5, 10, 15]} />);

    expect(screen.getByText('시즌 1 패스 & 마일스톤 로드맵')).toBeDefined();
    // 18,500 XP => Level 19
    expect(screen.getByText('현재 티어: Level 19')).toBeDefined();
    expect(screen.getByText('시즌 1 완료 황금 트로피', { exact: false })).toBeDefined();
  });

  it('수령 가능한 보상이 있을 때 전체 수령(Claim All) 버튼이 활성화되고 클릭 시 일괄 수령된다', () => {
    // Level 19인데 1, 5만 수령된 상태면 10, 15 수령 가능
    render(<SeasonPassTrack userXp={18500} initialClaimedLevels={[1, 5]} />);

    const claimAllBtn = screen.getByText(/수령 가능 보상 전체 받기/);
    expect(claimAllBtn).toBeDefined();

    fireEvent.click(claimAllBtn);
    expect(screen.getByText(/한 번에 모두 수령했습니다/)).toBeDefined();
  });
});
