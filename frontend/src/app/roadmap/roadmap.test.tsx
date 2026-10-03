import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoadmapView } from './roadmap-view';
import RoadmapPage, { metadata } from './page';

describe('RoadmapPage & RoadmapView', () => {
  it('renders page metadata with rich title and SEO canonical', () => {
    expect(metadata.title).toContain('초반·중반·후반 실전 성장 로드맵');
    expect(metadata.alternates?.canonical).toBe('https://easy-scraping.com/roadmap');
  });

  it('renders 3 growth stages: early, mid, and late game sections', () => {
    render(<RoadmapView />);

    // 1. Stage Tab Buttons
    expect(screen.getByText(/1단계: 초반 시드 모으기/i)).toBeDefined();
    expect(screen.getByText(/2단계: 중반 복리 & 주식/i)).toBeDefined();
    expect(screen.getByText(/3단계: 후반 부동산 건물주/i)).toBeDefined();

    // 2. Headings & Actions
    expect(screen.getByText(/초반: 무자본 10만 WLD 시드머니 모으기/i)).toBeDefined();
    expect(screen.getByText(/중반: 복리 예금 \+ 주식 분할 매수로 1,000만 WLD 굴리기/i)).toBeDefined();
    expect(screen.getByText(/후반: 가상 부동산 건물주 & 억대 패시브 인컴/i)).toBeDefined();
  });

  it('allows switching simulator stage tabs', () => {
    render(<RoadmapView />);

    const midButton = screen.getByText(/2단계: 중반 복리 & 주식/i);
    fireEvent.click(midButton);

    expect(screen.getByText(/중반: 중앙은행 30일 복리 포켓 예치/i)).toBeDefined();
  });

  it('renders 1-minute daily routine cheat sheet', () => {
    render(<RoadmapView />);
    expect(screen.getByText(/1분 요약: 매일 들어와서 해야 할 3가지 루틴/i)).toBeDefined();
    expect(screen.getByText(/1. 무료 룰렛 돌리기/i)).toBeDefined();
    expect(screen.getByText(/2. 복리 이자 & 임대료 수령/i)).toBeDefined();
  });
});
