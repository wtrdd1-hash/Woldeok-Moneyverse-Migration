import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CareerMasteryCard,
  getMasteryRank,
  getRequiredXpForLevel,
  MASTERY_RANKS,
} from './career-mastery-card';

describe('CareerMasteryCard Component & Logic', () => {
  it('기획서 레벨별 필요 XP 공식(round(250 * level^1.35))을 정확히 계산한다', () => {
    // Level 1 => round(250 * 1) = 250
    expect(getRequiredXpForLevel(1)).toBe(250);
    // Level 5 => round(250 * 5^1.35) = round(250 * 8.785) = 2196
    expect(getRequiredXpForLevel(5)).toBe(2196);
    // Level 10 => round(250 * 10^1.35) = round(250 * 22.387) = 5597
    expect(getRequiredXpForLevel(10)).toBe(5597);
  });

  it('7대 직급 단계를 레벨에 맞게 올바르게 반환한다', () => {
    expect(getMasteryRank(3).rankName).toContain('견습');
    expect(getMasteryRank(12).rankName).toContain('숙련');
    expect(getMasteryRank(25).rankName).toContain('프로');
    expect(getMasteryRank(45).rankName).toContain('전문가');
    expect(getMasteryRank(60).rankName).toContain('엑스퍼트');
    expect(getMasteryRank(80).rankName).toContain('마스터');
    expect(getMasteryRank(95).rankName).toContain('레거시');
  });

  it('CareerMasteryCard가 현재 레벨과 직급, 자격시험 응시 버튼을 정상 렌더링한다', () => {
    render(
      <CareerMasteryCard
        jobTitle="디지털 기술자"
        currentLevel={12}
        currentXp={3800}
      />
    );

    expect(screen.getByText('디지털 기술자 숙련도 & 커리어 마스터리')).toBeDefined();
    expect(screen.getByText('Lv.12')).toBeDefined();
    expect(screen.getAllByText('공인 주니어').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/전문 자격증 시험 응시/)).toBeDefined();
  });
});
