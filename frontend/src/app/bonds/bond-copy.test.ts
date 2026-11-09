import { describe, expect, it } from 'vitest';
import { safeBondDescription } from './bond-copy';

describe('virtual bond marketing disclosure', () => {
  it('does not show a real sovereign principal guarantee or unverified hourly yield', () => {
    const copy = safeBondDescription('확정 쿠폰이자율 연 4.5% (시간당 0.05%), 원금 100% 국가 보증.');
    expect(copy).toContain('실제 국가 원리금 보증이 적용되지 않습니다');
    expect(copy).not.toContain('원금 100% 국가 보증');
    expect(copy).not.toContain('시간당 0.05%');
    expect(copy).not.toContain('확정 쿠폰이자율');
  });
  it('preserves ordinary descriptive context without inventing a guarantee', () => {
    expect(safeBondDescription('인프라 조달용 게임 채권')).toBe('인프라 조달용 게임 채권');
  });
});
