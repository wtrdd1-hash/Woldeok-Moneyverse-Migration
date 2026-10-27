import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { HotTimeManagementCard } from './hot-time-management-card';

const active = {
  id: '11111111-1111-4111-8111-111111111111',
  buffKey: 'WORK_SALARY_BOOST_150',
  title: 'Verified work bonus',
  description: 'Only an active event',
  multiplier: 1.5,
  targetDomain: 'work',
  active: true,
  startsAt: '2026-10-27T01:00:00.000Z',
  endsAt: '2099-10-27T01:00:00.000Z',
};

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('admin hot-time evidence', () => {
  it('does not invent four LIVE events while loading', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<HotTimeManagementCard />);
    expect(screen.queryByText(/4개 버프 가동 중/)).toBeNull();
    expect(screen.queryByText(/버프 끄기/)).toBeNull();
  });

  it('renders only verified server events and never offers an unverified mutation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ activeBuffs: [active], hasActiveHotTime: true, serverTime: '2026-10-27T04:45:00.000Z' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<HotTimeManagementCard />);
    await waitFor(() => expect(screen.getByText('Verified work bonus')).toBeTruthy());
    expect(screen.getByText(/확인된 활성 버프 1개/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /버프 끄기/ })).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('/app-api/v1/economy/hot-time/active', expect.objectContaining({ cache: 'no-store' }));
  });

  it('shows unavailable rather than zero events when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<HotTimeManagementCard />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toMatch(/확인할 수 없습니다/);
    expect(screen.queryByText(/0개 버프 가동 중/)).toBeNull();
  });

  it('rejects contradictory response evidence', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ activeBuffs: [active], hasActiveHotTime: false, serverTime: '2026-10-27T04:45:00.000Z' }) }));
    render(<HotTimeManagementCard />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.queryByText('Verified work bonus')).toBeNull();
  });
});
