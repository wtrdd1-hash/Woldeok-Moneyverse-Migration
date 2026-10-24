import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { StarDropModal } from './star-drop-modal';
import { claimStarDrop } from '@/lib/dopamine-api';

vi.mock('@/lib/dopamine-api', () => ({
  claimStarDrop: vi.fn().mockResolvedValue({ success: true, rewardAmount: 2500 }),
}));

describe('StarDropModal Component', () => {
  beforeEach(() => vi.clearAllMocks());
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
      <StarDropModal isOpen={true} onClose={() => {}} />
    );

    expect(container.textContent).toContain('Brawl Stars형 스타 드롭');
    expect(container.textContent).toContain('100% 가상 시뮬레이터 (현금 환전 불가)');
    expect(container.textContent).toContain('실제 보상 지급 비활성');
    expect(container.textContent).toContain('0/5 TAP');
  });

  it('opens and closes compliance probability modal', () => {
    const { container, getByRole } = render(
      <StarDropModal isOpen={true} onClose={() => {}} />
    );

    const infoBtn = getByRole('button', { name: '확률표 확인' });
    fireEvent.click(infoBtn);

    expect(container.textContent).toContain('스타 드롭 시뮬레이션 등급 안내');
    expect(container.textContent).toContain('전설 (Legendary)');

    const confirmBtn = getByRole('button', { name: '확인 완료' });
    fireEvent.click(confirmBtn);

    expect(container.textContent).not.toContain('스타 드롭 시뮬레이션 등급 안내');
  });

  it('progresses tap count on click and cracks open on 5th tap to reveal reward', async () => {
    const onClose = vi.fn();
    const { container, getByRole } = render(
      <StarDropModal isOpen={true} onClose={onClose} hasLuckyCharm={true} />
    );

    const tapBtn = getByRole('button', { name: '스타 드롭 탭하기' });

    // Tap 5 times
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);

    // After 5 taps, reveal reward screen appears
    expect(container.textContent).toContain('시뮬레이션 결과:');
    expect(container.textContent).toContain('미리보기 종료');

    // Claim reward
    const claimBtn = getByRole('button', { name: '미리보기 종료' });
    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(claimStarDrop).not.toHaveBeenCalled();
    });
  });

  it('never reports a simulated Star Drop as an issued wallet or inventory reward', async () => {
    const onClose = vi.fn();
    const { getByRole, queryByRole } = render(
      <StarDropModal isOpen={true} onClose={onClose} hasLuckyCharm={true} />
    );
    const tap = getByRole('button', { name: '스타 드롭 탭하기' });
    for (let i = 0; i < 5; i += 1) fireEvent.click(tap);
    expect(getByRole('button', { name: '미리보기 종료' })).toBeDefined();
    expect(queryByRole('button', { name: '보상 수령하고 인벤토리에 넣기' })).toBeNull();
    fireEvent.click(getByRole('button', { name: '미리보기 종료' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(claimStarDrop).not.toHaveBeenCalled();
  });

});
