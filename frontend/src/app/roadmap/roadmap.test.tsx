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

  it('renders 3 growth stages with early game 100k WLD seed strategy placed prominently at the top', () => {
    render(<RoadmapView />);

    // 1. Stage Tab Buttons
    expect(screen.getByText(/1단계: 초반 시드 모으기/i)).toBeDefined();
    expect(screen.getByText(/2단계: 중반 복리 & 주식/i)).toBeDefined();
    expect(screen.getByText(/3단계: 후반 부동산 건물주/i)).toBeDefined();

    // 2. Early-game 4 Routine Actions
    expect(screen.getByText(/01. 럭키 룰렛/i)).toBeDefined();
    expect(screen.getByText(/02. 덕이 펫 돌보기/i)).toBeDefined();
    expect(screen.getByText(/03. 인턴 직업 업무/i)).toBeDefined();
    expect(screen.getByText(/04. 웰컴 퀘스트/i)).toBeDefined();

    // 3. Headings & Actions
    expect(screen.getByText(/초반: 무자본 10만 WLD 시드머니 모으기/i)).toBeDefined();
    expect(screen.getByText(/중반: 복리 예금 \+ 주식 분할 매수로 1,000만 WLD 굴리기/i)).toBeDefined();
    expect(screen.getByText(/후반: 가상 부동산 건물주 & 억대 패시브 인컴/i)).toBeDefined();
  });

  it('allows switching simulator stage tabs and jumping through scenes', () => {
    render(<RoadmapView />);

    const midButton = screen.getByText(/2단계: 중반 복리 & 주식/i);
    fireEvent.click(midButton);

    expect(screen.getByText(/중앙은행 30일 스마트 복리 포켓 예치/i)).toBeDefined();

    // Step jump thumbnail buttons
    const scene2Button = screen.getByText(/2. 주식 호가/i);
    fireEvent.click(scene2Button);

    expect(screen.getByText(/WDX 침팬지 반도체 10-Depth 호가창 매수/i)).toBeDefined();
  });

  it('renders playback control buttons and handles play/pause toggle', () => {
    render(<RoadmapView />);

    const playPauseBtn = screen.getByText(/일시정지/i);
    fireEvent.click(playPauseBtn);

    expect(screen.getByText(/시연 재생/i)).toBeDefined();
  });

  it('renders 1-minute daily routine cheat sheet', () => {
    render(<RoadmapView />);
    expect(screen.getByText(/1분 요약: 매일 들어와서 해야 할 3가지 루틴/i)).toBeDefined();
    expect(screen.getByText(/1. 무료 룰렛 돌리기/i)).toBeDefined();
    expect(screen.getByText(/2. 복리 이자 & 임대료 수령/i)).toBeDefined();
    expect(screen.getByText(/3. 직업 업무 1회 시작/i)).toBeDefined();
  });
});
