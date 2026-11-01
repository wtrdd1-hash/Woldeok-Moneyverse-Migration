import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { StarDropModal } from './star-drop-modal';

vi.mock('@/lib/dopamine-api', () => ({
  claimStarDrop: vi.fn().mockResolvedValue({ success: true, rewardAmount: 2500 }),
}));

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
    expect(container.textContent).toContain('연습용 시뮬레이터 (WLD 지급 없음)');
    expect(container.textContent).toContain('연습 모드 (지급 없음)');
    expect(container.textContent).toContain('0/5 TAP');
  });

  it('opens and closes compliance probability modal', () => {
    const { container, getByRole } = render(
      <StarDropModal isOpen={true} onClose={() => {}} />
    );

    const infoBtn = getByRole('button', { name: '확률표 확인' });
    fireEvent.click(infoBtn);

    expect(container.textContent).toContain('연습용 확률 안내 (실제 보상 없음)');
    expect(container.textContent).toContain('전설 (Legendary)');

    const confirmBtn = getByRole('button', { name: '확인 완료' });
    fireEvent.click(confirmBtn);

    expect(container.textContent).not.toContain('연습용 확률 안내 (실제 보상 없음)');
  });

  it('progresses tap count on click and cracks open on 5th tap to reveal reward', async () => {
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
    expect(container.textContent).toContain('연습 결과:');
    expect(container.textContent).toContain('보상 정산은 현재 이용할 수 없습니다');

    expect(getByRole('button', { name: '보상 정산 이용 불가' })).toHaveProperty('disabled', true);
    expect(handleClaim).not.toHaveBeenCalled();
  });
});
