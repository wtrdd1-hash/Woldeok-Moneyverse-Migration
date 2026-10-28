import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WeeklyWorldBrief } from './weekly-world-brief';
import { SYNTHETIC_TEST_BRIEF } from './weekly-brief.test-fixture';

describe('WeeklyWorldBrief Component', () => {
  it('주간 월드 브리프 3대 지표 및 이번 주 한 문장을 정상 렌더링한다', () => {
    const html = renderToStaticMarkup(<WeeklyWorldBrief data={SYNTHETIC_TEST_BRIEF} />);

    expect(html).toContain('WEEKLY WORLD BRIEF');
    expect(html).toContain('제39호');
    expect(html).toContain('M0 유동성이 매우 건전하게 유지');
    expect(html).toContain('12,450,000 WLD');
    expect(html).toContain('+1.4%');
    expect(html).toContain('CHIPS');
  });

  it('주간 명예의 전당 및 금융 학습 칼럼을 올바르게 표시한다', () => {
    const html = renderToStaticMarkup(<WeeklyWorldBrief data={SYNTHETIC_TEST_BRIEF} />);

    expect(html).toContain('주간 경제 명예의 전당');
    expect(html).toContain('월덕파운더');
    expect(html).toContain('150,000 WLD 소각');
    expect(html).toContain('매몰비용의 오류');
  });
});
