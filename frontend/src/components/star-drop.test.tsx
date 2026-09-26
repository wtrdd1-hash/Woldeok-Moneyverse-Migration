import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { StarDropModal } from './star-drop-modal';

describe('StarDropModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <StarDropModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with initial rare rank and compliance badge', () => {
    const { container } = render(
      <StarDropModal isOpen={true} onClose={() => {}} dailyFreeRemaining={3} />
    );

    expect(container.textContent).toContain('Brawl Stars형 스타 드롭');
    expect(container.textContent).toContain('100% 가상 시뮬레이터 (현금 환전 불가)');
    expect(container.textContent).toContain('일일 무료: 3회');
    expect(container.textContent).toContain('0/5 TAP');
  });

  it('opens and closes compliance probability modal', () => {
    const { container, getByRole } = render(
      <StarDropModal isOpen={true} onClose={() => {}} />
    );

    const infoBtn = getByRole('button', { name: '확률표 확인' });
    fireEvent.click(infoBtn);

    expect(container.textContent).toContain('공정 확률표 (2024 게임산업진흥법 준수)');
    expect(container.textContent).toContain('전설 (Legendary)');

    const confirmBtn = getByRole('button', { name: '확인 완료' });
    fireEvent.click(confirmBtn);

    expect(container.textContent).not.toContain('공정 확률표 (2024 게임산업진흥법 준수)');
  });

  it('progresses tap count on click and cracks open on 5th tap to reveal reward', () => {
    const handleClaim = vi.fn();
    const { container, getByRole } = render(
      <StarDropModal isOpen={true} onClose={() => {}} onClaimReward={handleClaim} hasLuckyCharm={true} />
    );

    const tapBtn = getByRole('button', { name: '스타 드롭 탭하기' });

    // Tap 5 times
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);

    // After 5 taps, reveal reward screen appears
    expect(container.textContent).toContain('잭팟 달성!');
    expect(container.textContent).toContain('보상 수령하고 인벤토리에 넣기');

    // Claim reward
    const claimBtn = getByRole('button', { name: '보상 수령하고 인벤토리에 넣기' });
    fireEvent.click(claimBtn);

    expect(handleClaim).toHaveBeenCalledTimes(1);
  });
});
