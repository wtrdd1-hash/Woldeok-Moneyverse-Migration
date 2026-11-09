import { describe, expect, it } from 'vitest';
import { safeBondDescription } from './bond-copy';

describe('virtual bond marketing disclosure', () => {
  it('does not show a real sovereign principal guarantee or unverified hourly yield', () => {
    const copy = safeBondDescription('확정 쿠폰이자율 연 4.5% (시간당 0.05%), 원금 100% 국가 보증.');
    expect(copy).toContain('실제 국가 원리금 보증이 적용되지 않습니다');
    expect(copy).not.toContain('원금 100% 국가 보증');
    expect(copy).not.toContain('시간당 0.05%');
    expect(copy).not.toContain('확정 쿠폰이자율');
    expect(copy).toContain('서버 표시 수익률 연 4.5%');
    expect(copy).not.toContain('연 금리 연');
  });
  it('removes real ministry branding and unsupported safety claims from seed copy', () => {
    expect(safeBondDescription('기획재정부 발행, 최고 수준 안정성')).toBe('머니버스 가상정부 발행, 게임 내 정산위험이 있습니다');
  });
  it('preserves ordinary descriptive context without inventing a guarantee', () => {
    expect(safeBondDescription('인프라 조달용 게임 채권')).toBe('인프라 조달용 게임 채권');
  });
});
