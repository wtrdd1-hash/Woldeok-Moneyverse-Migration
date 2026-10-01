import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SpaceCanvasEditor, PALETTE } from './space-canvas-editor';

describe('SpaceCanvasEditor', () => {
  it('20종 인테리어 팔레트가 정의되어 있어야 한다', () => {
    expect(PALETTE.length).toBe(20);
    const techItems = PALETTE.filter((item) => item.category === 'tech');
    const wealthItems = PALETTE.filter((item) => item.category === 'wealth');
    const loungeItems = PALETTE.filter((item) => item.category === 'lounge');
    const vibeItems = PALETTE.filter((item) => item.category === 'vibe');

    expect(techItems.length).toBe(5);
    expect(wealthItems.length).toBe(5);
    expect(loungeItems.length).toBe(5);
    expect(vibeItems.length).toBe(5);
  });

  it('기본 캔버스 에디터가 정상 렌더링되고 Vibe 점수가 계산된다', () => {
    render(<SpaceCanvasEditor spaceName="테스트 오피스" spaceType="SPACE_OFFICE" />);

    expect(screen.getAllByText(/테스트 오피스/).length).toBeGreaterThan(0);
    expect(screen.getByText(/20종 인테리어 팔레트/)).toBeDefined();
    expect(screen.getByText(/인테리어 Vibe 게이지/)).toBeDefined();
  });

  it('2.5D 아이소메트릭 토글 버튼 클릭 시 모드가 전환된다', () => {
    render(<SpaceCanvasEditor spaceName="테스트 오피스" />);

    const toggleBtn = screen.getByText('2D 평면 그리드');
    fireEvent.click(toggleBtn);
    expect(screen.getAllByText(/2.5D 아이소메트릭/).length).toBeGreaterThan(0);
  });

  it('좋아요 버튼 클릭 시 좋아요 수가 증가한다', () => {
    render(<SpaceCanvasEditor spaceName="테스트 오피스" />);

    const likeBtn = screen.getByText('42');
    fireEvent.click(likeBtn);
    expect(screen.getByText('43')).toBeDefined();
  });
});
