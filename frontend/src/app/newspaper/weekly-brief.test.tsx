import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyWorldBrief, DEFAULT_WEEKLY_BRIEF } from './weekly-world-brief';

describe('WeeklyWorldBrief Component', () => {
  it('주간 월드 브리프 3대 지표 및 이번 주 한 문장을 정상 렌더링한다', () => {
    render(<WeeklyWorldBrief data={DEFAULT_WEEKLY_BRIEF} />);

    expect(screen.getByText(/WEEKLY WORLD BRIEF/)).toBeDefined();
    expect(screen.getByText('제39호')).toBeDefined();
    expect(screen.getByText(/M0 유동성이 매우 건전하게 유지/)).toBeDefined();
    expect(screen.getByText('12,450,000 WLD')).toBeDefined();
    expect(screen.getByText('+1.4%')).toBeDefined();
    expect(screen.getAllByText('CHIPS').length).toBeGreaterThanOrEqual(1);
  });

  it('주간 명예의 전당 및 금융 학습 칼럼을 올바르게 표시한다', () => {
    render(<WeeklyWorldBrief data={DEFAULT_WEEKLY_BRIEF} />);

    expect(screen.getAllByText(/주간 경제 명예의 전당/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('월덕파운더').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/150,000 WLD 소각/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/매몰비용의 오류/).length).toBeGreaterThanOrEqual(1);
  });
});
