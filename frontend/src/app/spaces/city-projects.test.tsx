import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CityProjectsView, calculateHonorScore, DEFAULT_CITY_PROJECTS } from './city-projects-view';

describe('CityProjectsView Component & Logic', () => {
  it('명예 점수 공식(floor(100 * ln(1 + WLD / 1000)))을 정확히 계산한다', () => {
    expect(calculateHonorScore(0)).toBe(0);
    // 1,000 WLD => floor(100 * ln(2)) = floor(69.31) = 69
    expect(calculateHonorScore(1000)).toBe(69);
    // 5,000 WLD => floor(100 * ln(6)) = floor(179.17) = 179
    expect(calculateHonorScore(5000)).toBe(179);
    // 10,000 WLD => floor(100 * ln(11)) = floor(239.78) = 239
    expect(calculateHonorScore(10000)).toBe(239);
  });

  it('기본 4대 도시 프로젝트와 명예 후원자 벽을 정상 렌더링한다', () => {
    render(<CityProjectsView />);

    expect(screen.getByText('머니버스 공공 도시 프로젝트 크라우드펀딩')).toBeDefined();
    expect(screen.getByText('강변 공공 정원 복원 프로젝트')).toBeDefined();
    expect(screen.getByText('중앙 문화 광장 대확장')).toBeDefined();
    expect(screen.getByText('Moneyverse 역사 박물관 건립')).toBeDefined();
    expect(screen.getByText('도시 레거시 영구 후원 기금')).toBeDefined();

    expect(screen.getByText('영구 명예 후원자 벽 (Hall of Patrons)')).toBeDefined();
    expect(screen.getByText('월덕파운더')).toBeDefined();
  });
});
