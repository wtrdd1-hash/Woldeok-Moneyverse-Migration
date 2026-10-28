import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WeeklyWorldBrief } from './weekly-world-brief';

describe('unverified weekly economic brief', () => {
  it('renders explicit unavailable state instead of fabricated WLD, inflation and member rankings', () => {
    const text = renderToStaticMarkup(<WeeklyWorldBrief />);
    expect(text).toContain('주간 경제 브리프 자료를 검증 중입니다');
    expect(text).not.toContain('12,450,000');
    expect(text).not.toContain('+1.4%');
    expect(text).not.toContain('월덕파운더');
    expect(text).not.toContain('CHIPS');
  });
});
