import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { LiveHotTimeBanner } from './live-hot-time-banner';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));

const buff = {
  id: '11111111-1111-4111-8111-111111111111', buffKey: 'WORK_SALARY_BOOST_150',
  title: 'Verified work buff', description: 'From backend', targetDomain: 'work',
  multiplier: 1.5, active: true, startsAt: '2026-10-27T01:00:00.000Z',
  endsAt: '2099-10-27T01:00:00.000Z',
};

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('public live hot-time evidence', () => {
  it('never advertises a cached historical buff as LIVE even if it has a future end date', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ activeBuffs: [buff], hasActiveHotTime: true, serverTime: '2026-10-27T04:00:00.000Z' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<LiveHotTimeBanner />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText('Verified work buff')).toBeNull();
    expect(screen.queryByText(/LIVE HOT-TIME|실시간 골든 핫타임/)).toBeNull();
  });

  it('removes a formerly live badge while a later refresh has no source response', async () => {
    const pending = new Promise<never>(() => {});
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ activeBuffs: [buff], hasActiveHotTime: true, serverTime: new Date().toISOString() }) })
      .mockReturnValueOnce(pending);
    vi.stubGlobal('fetch', fetchMock);
    const intervalSpy = vi.spyOn(window, 'setInterval');
    render(<LiveHotTimeBanner />);
    await waitFor(() => expect(screen.getByText('Verified work buff')).toBeTruthy());
    const refresh = intervalSpy.mock.calls.find(([, ms]) => ms === 60_000)?.[0];
    expect(refresh).toBeDefined();
    await act(async () => { (refresh as () => void)(); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Verified work buff')).toBeNull();
    intervalSpy.mockRestore();
  });

  it('shows a source-current buff without fabricating other events', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ activeBuffs: [buff], hasActiveHotTime: true, serverTime: new Date().toISOString() }) }));
    render(<LiveHotTimeBanner />);
    await waitFor(() => expect(screen.getByText('Verified work buff')).toBeTruthy());
    expect(screen.getAllByText('Verified work buff')).toHaveLength(1);
  });
});
