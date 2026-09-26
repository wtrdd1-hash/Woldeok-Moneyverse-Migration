import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import SavingsChallengePotPage from './page';

describe('SavingsChallengePotPage Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders co-savings pot header, target amount, and 4 members', () => {
    const { container } = render(<SavingsChallengePotPage />);

    expect(container.textContent).toContain('Toss형 4인 공동 저축 챌린지 팟');
    expect(container.textContent).toContain('+5.0%p 확정 가산');
    expect(container.textContent).toContain('40만 WLD 목표 공동 저축 팟');
    expect(container.textContent).toContain('파이낸스덕');
    expect(container.textContent).toContain('월가고래');
  });

  it('handles daily deposit and updates user status', () => {
    const { container, getByRole } = render(<SavingsChallengePotPage />);

    const depositBtn = getByRole('button', { name: /오늘치 14,285 WLD 저축 입금하기/i });
    fireEvent.click(depositBtn);

    expect(container.textContent).toContain('오늘의 챌린지 저축 (14,285 WLD) 입금 완료!');
    expect(container.textContent).toContain('오늘 저축 완료됨');
  });

  it('handles friend nudge and displays reminder notification', () => {
    const { container, getAllByRole } = render(<SavingsChallengePotPage />);

    const nudgeButtons = getAllByRole('button', { name: /친구 찌르기/i });
    const firstNudge = nudgeButtons[0];
    if (!firstNudge) throw new Error('Nudge button not found');
    fireEvent.click(firstNudge);

    expect(container.textContent).toContain('님을 찔렀습니다! 저축 알림이 발송되었습니다.');
  });
});
