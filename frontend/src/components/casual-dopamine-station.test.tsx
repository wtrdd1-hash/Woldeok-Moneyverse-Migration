import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CasualDopamineStation } from './casual-dopamine-station';

describe('CasualDopamineStation Component', () => {
  it('renders dopamine station and quick action triggers', () => {
    render(<CasualDopamineStation />);

    expect(screen.getByText(/일반 유저 무료 도파민 스테이션/)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /황금 피버 타임/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /1:1 주사위 결투/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /스타 드롭 탭/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /스트릭 내기/ }).length).toBeGreaterThan(0);
  });

  it('opens fever modal when quick action button is clicked', () => {
    render(<CasualDopamineStation />);

    const feverBtn = screen.getAllByRole('button', { name: /황금 피버 타임/ })[0]!;
    fireEvent.click(feverBtn);

    expect(screen.getAllByText(/황금 오리 광클 피버 타임/).length).toBeGreaterThan(0);
  });

  it('opens showdown modal when showdown button is clicked', () => {
    render(<CasualDopamineStation />);

    const showdownBtn = screen.getAllByRole('button', { name: /1:1 주사위 결투/ })[0]!;
    fireEvent.click(showdownBtn);

    expect(screen.getAllByText(/1:1 주사위 미니 결투/).length).toBeGreaterThan(0);
  });
});
