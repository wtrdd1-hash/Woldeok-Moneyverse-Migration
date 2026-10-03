import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FeaturesView } from './features-view';
import FeaturesPage, { metadata } from './page';

describe('FeaturesPage & FeaturesView', () => {
  it('renders page metadata with rich title and SEO canonical', () => {
    expect(metadata.title).toContain('핵심 기능 & 사용법 가이드');
    expect(metadata.alternates?.canonical).toBe('https://easy-scraping.com/features');
  });

  it('renders all 6 core feature sections and live preview headers', () => {
    render(<FeaturesView />);

    // 1. Hero & Title
    expect(screen.getByText(/6대 핀테크 가상 경제/i)).toBeDefined();

    // 2. 6 Core Feature Titles
    expect(screen.getByText(/WDX 가상 주식 거래소 & 10-Depth 호가창/i)).toBeDefined();
    expect(screen.getByText(/중앙은행 스마트 복리 포켓 & 가상 국채/i)).toBeDefined();
    expect(screen.getByText(/직업 커리어 & 실시간 일일 파밍 루틴/i)).toBeDefined();
    expect(screen.getByText(/가상 부동산 메가시티 랜드 분양 & 임대 수익/i)).toBeDefined();
    expect(screen.getByText(/5대 고수익 금융 계산기 & 1초 바이럴 카드/i)).toBeDefined();
    expect(screen.getByText(/도파민 아케이드 미니게임 & 럭키 룰렛/i)).toBeDefined();

    // 3. Action Buttons
    expect(screen.getByText('주식 거래소 입장하기')).toBeDefined();
    expect(screen.getByText('중앙은행 금고 열기')).toBeDefined();
    expect(screen.getByText('직업 업무 시작하기')).toBeDefined();
    expect(screen.getByText('가상 랜드 분양소 가기')).toBeDefined();
    expect(screen.getByText('5대 계산기 전체 보기')).toBeDefined();
    expect(screen.getByText('아케이드 스테이션 입장')).toBeDefined();
  });

  it('renders FAQ section for user troubleshooting', () => {
    render(<FeaturesView />);
    expect(screen.getByText(/자주 묻는 질문/i)).toBeDefined();
    expect(screen.getByText(/WLD 가상 자산은 어떻게 충전하거나 얻나요/i)).toBeDefined();
  });
});
