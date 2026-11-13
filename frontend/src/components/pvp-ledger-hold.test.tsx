import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PvpWagerArenaModal } from './pvp-wager-arena-modal';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PvP wagering certified during canonical ledger operation', () => {
  it('informs users of active status and enables new wager creation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ waitingRooms: [], recentBattles: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<PvpWagerArenaModal isOpen onClose={() => {}} currentUserId="user" />);
    const notice = screen.getByRole('status');
    expect(notice.textContent).toContain('원장 인증 완료');
    const create = screen.getByRole('button', { name: '+ 대결방 개설' });
    expect(create.hasAttribute('disabled')).toBe(false);
    expect(screen.getByText('지금 바로 첫 번째 대결방을 개설하고 승부를 펼쳐보세요!')).toBeDefined();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.every(([url]) => url === '/api/arena/rooms')).toBe(true);
  });
});
