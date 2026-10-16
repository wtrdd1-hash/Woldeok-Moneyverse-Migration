import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PvpWagerArenaModal } from './pvp-wager-arena-modal';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PvP wagering disabled during financial ledger remediation', () => {
  it('informs users and disables new wager creation without hiding cancellation history', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ waitingRooms: [], recentBattles: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<PvpWagerArenaModal isOpen onClose={() => {}} currentUserId="user" />);
    const notice = screen.getByRole('status');
    expect(notice.textContent).toContain('정산 원장 검증 중');
    const create = screen.getByRole('button', { name: '+ 대결방 개설' });
    expect(create.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('원장 검증이 완료되기 전까지 새 대결방을 만들 수 없습니다.')).toBeDefined();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.every(([url]) => url === '/api/arena/rooms')).toBe(true);
  });
});
