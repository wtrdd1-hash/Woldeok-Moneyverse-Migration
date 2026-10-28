import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import { GoldenDuckFever } from './golden-duck-fever';
import * as actions from '@/app/actions/dopamine';

vi.mock('@/app/actions/dopamine', () => ({
  getGoldenDuckStatusAction: vi.fn().mockResolvedValue({ state: 'verified', claimedToday: false }),
  claimGoldenDuckAction: vi.fn(),
}));

describe('Golden Duck practice (no WLD transfer)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('renders a keyboard-operable local practice with explicit no-WLD disclosure', () => {
    render(<GoldenDuckFever isOpen />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(/연습 점수/)).toBeTruthy();
    expect(screen.getByText(/WLD 지급 없음/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /오리 탭 연습/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /WLD 보상 수령/i })).toBeNull();
  });

  it('increments only local points, never calls reward action or wallet event', () => {
    const callback = vi.fn();
    render(<GoldenDuckFever isOpen onClaimReward={callback} />);
    fireEvent.click(screen.getByRole('button', { name: /오리 탭 연습/i }));
    expect(screen.getByText(/10점/)).toBeTruthy();
    expect(vi.mocked(actions.claimGoldenDuckAction)).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('ends after 10 seconds with local score only', () => {
    vi.useFakeTimers();
    render(<GoldenDuckFever isOpen />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText(/연습 종료/)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /닫기/i }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/WLD 획득/)).toBeNull();
  });

  it('shows owner-verified ledger history only when the backend confirms it', async () => {
    vi.mocked(actions.getGoldenDuckStatusAction).mockResolvedValue({ state: 'verified', claimedToday: true });
    render(<GoldenDuckFever isOpen />);
    await waitFor(() => expect(screen.getByText(/오늘 원장 지급 기록: 있음/)).toBeTruthy());
  });

  it('shows unavailable rather than a false zero when the DB cannot be reached', async () => {
    vi.mocked(actions.getGoldenDuckStatusAction).mockResolvedValue({ state: 'unavailable' });
    render(<GoldenDuckFever isOpen />);
    await waitFor(() => expect(screen.getByText(/원장 기록 조회 불가/)).toBeTruthy());
  });
});
