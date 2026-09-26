import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import PrestigeRebirthPage from './page';

describe('PrestigeRebirthPage Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders prestige rebirth header, current tier and relics', () => {
    const { container } = render(<PrestigeRebirthPage />);

    expect(container.textContent).toContain('Cookie Clicker형 프레스티지 (환생) 시스템');
    expect(container.textContent).toContain('Tier 2 (x4.0배)');
    expect(container.textContent).toContain('고대 황금 시계');
    expect(container.textContent).toContain('해금된 고대 유물');
  });

  it('toggles insurance ticket and updates preserved amount preview', () => {
    const { container, getByRole } = render(<PrestigeRebirthPage />);

    const insuranceBtn = getByRole('button', { name: '보험 활성화하기' });
    fireEvent.click(insuranceBtn);

    expect(container.textContent).toContain('보험 적용 중 (30% 보존)');
  });

  it('toggles relic equip and unequip status', () => {
    const { container, getAllByRole } = render(<PrestigeRebirthPage />);

    const unequipButtons = getAllByRole('button', { name: '장착 해제' });
    const firstBtn = unequipButtons[0];
    if (!firstBtn) throw new Error('Button not found');
    fireEvent.click(firstBtn);

    expect(container.textContent).toContain('장착하기');
  });

  it('opens confirmation modal and executes rebirth to advance tier', () => {
    const { container, getByRole } = render(<PrestigeRebirthPage />);

    const rebirthActionBtn = getByRole('button', { name: /프레스티지 환생 실행하고/i });
    fireEvent.click(rebirthActionBtn);

    expect(container.textContent).toContain('정말로 프레스티지 환생을 진행하시겠습니까?');

    const confirmBtn = getByRole('button', { name: '환생 확정' });
    fireEvent.click(confirmBtn);

    expect(container.textContent).toContain('🌟 환생 완료! 프레스티지 레벨 3 달성');
    expect(container.textContent).toContain('Tier 3 (x8.0배)');
  });
});
