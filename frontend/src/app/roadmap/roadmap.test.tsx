import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoadmapView } from './roadmap-view';
import { LocaleProvider } from '@/components/locale-provider';
import RoadmapPage, { metadata } from './page';

describe('RoadmapPage & RoadmapView (i18n Multi-Language Support)', () => {
  it('renders page metadata with rich title and SEO canonical', () => {
    expect(metadata.title).toContain('초반·중반·후반 실전 성장 로드맵');
    expect(metadata.alternates?.canonical).toBe('https://easy-scraping.com/roadmap');
  });

  it('renders Korean (KO) interface with early-game 100k WLD seed strategy at the top', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <RoadmapView />
      </LocaleProvider>
    );

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

    // 4. Playback and Cheat Sheet
    expect(screen.getByText(/1분 요약: 매일 들어와서 해야 할 3가지 루틴/i)).toBeDefined();
  });

  it('renders English (EN) interface flawlessly with fintech terminology', () => {
    render(
      <LocaleProvider initialLocale="en">
        <RoadmapView />
      </LocaleProvider>
    );

    // English Tab Buttons
    expect(screen.getByText(/Stage 1: Seed Building/i)).toBeDefined();
    expect(screen.getByText(/Stage 2: Compounding & Stocks/i)).toBeDefined();
    expect(screen.getByText(/Stage 3: Real Estate Tycoon/i)).toBeDefined();

    // English Routines & Headings
    expect(screen.getByText(/01. Lucky Roulette/i)).toBeDefined();
    expect(screen.getByText(/02. Deoki Pet Care/i)).toBeDefined();
    expect(screen.getByText(/03. Daily Career Shift/i)).toBeDefined();
    expect(screen.getByText(/04. Welcome Quests/i)).toBeDefined();
    expect(screen.getByText(/1-Minute Daily Cheat Sheet/i)).toBeDefined();
  });

  it('renders Japanese (JA) interface with natural financial expressions', () => {
    render(
      <LocaleProvider initialLocale="ja">
        <RoadmapView />
      </LocaleProvider>
    );

    expect(screen.getByText(/第1段階：シード形成/i)).toBeDefined();
    expect(screen.getByText(/第2段階：複利＆株式/i)).toBeDefined();
    expect(screen.getByText(/01. ラッキールーレット/i)).toBeDefined();
    expect(screen.getByText(/1分要約：毎日ログインして行う3つのルーティン/i)).toBeDefined();
  });

  it('renders Simplified Chinese (ZH) interface accurately', () => {
    render(
      <LocaleProvider initialLocale="zh">
        <RoadmapView />
      </LocaleProvider>
    );

    expect(screen.getByText(/第1阶段：初始本金/i)).toBeDefined();
    expect(screen.getByText(/第2阶段：复利与股票/i)).toBeDefined();
    expect(screen.getByText(/01. 幸运转盘/i)).toBeDefined();
    expect(screen.getByText(/1分钟秘籍：每日必做3大核心日常/i)).toBeDefined();
  });

  it('allows switching simulator stage tabs and jumping through scenes in Korean', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <RoadmapView />
      </LocaleProvider>
    );

    const midButton = screen.getByText(/2단계: 중반 복리 & 주식/i);
    fireEvent.click(midButton);

    expect(screen.getByText(/중앙은행 30일 스마트 복리 포켓 예치/i)).toBeDefined();

    // Step jump thumbnail buttons
    const scene2Button = screen.getByText(/2. 주식 호가/i);
    fireEvent.click(scene2Button);

    expect(screen.getByText(/WDX 침팬지 반도체 10-Depth 호가창 매수/i)).toBeDefined();
  });

  it('handles play/pause toggle controls', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <RoadmapView />
      </LocaleProvider>
    );

    const playPauseBtn = screen.getByText(/일시정지/i);
    fireEvent.click(playPauseBtn);

    expect(screen.getByText(/시연 재생/i)).toBeDefined();
  });
});
