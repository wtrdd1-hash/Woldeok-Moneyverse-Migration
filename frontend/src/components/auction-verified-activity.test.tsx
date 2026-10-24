import { act, cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuctionLiveTickerStrip } from './auction-live-toast-stream';
import { acquireSiteSocket, releaseSiteSocket } from '@/lib/site-socket';

vi.mock('@/lib/site-socket', () => ({ acquireSiteSocket: vi.fn(), releaseSiteSocket: vi.fn() }));

const auction = {
  id: '8a877aec-97ad-4bcb-890a-764679f87bce', itemName: '실제 경매품',
  currentBidWld: '1500', highestBidderName: '검증회원', bidCount: 1,
  isExtended: false, endsAt: '2026-10-26T00:00:00.000Z',
};

let listeners: Map<string, (payload: unknown) => void>;
const socket = {
  connected: true,
  on: vi.fn((event: string, fn: (payload: unknown) => void) => { listeners.set(event, fn); }),
  off: vi.fn(), emit: vi.fn(),
};
const jsonResponse = (data: unknown, ok = true, status = 200) => ({ ok, status, json: async () => data });

beforeEach(() => {
  listeners = new Map();
  socket.connected = true;
  vi.clearAllMocks();
  vi.mocked(acquireSiteSocket).mockReturnValue(socket as never);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('verified auction activity', () => {
  it('shows an empty verified state instead of sample bids or false 60fps claims', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])));
    render(<AuctionLiveTickerStrip />);
    expect(await screen.findByText('활성 경매가 없습니다.')).toBeTruthy();
    expect(screen.queryByText(/CryptoWhale|황금 호가창|60fps/)).toBeNull();
    expect(screen.getByText('실시간 연결됨')).toBeTruthy();
  });

  it('fails closed when authenticated auction API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 503)));
    render(<AuctionLiveTickerStrip />);
    expect(await screen.findByText('경매 기록을 확인할 수 없습니다.')).toBeTruthy();
    expect(screen.queryByText('실시간 연결됨')).toBeNull();
  });

  it('subscribes to real auction rooms and only announces server-readback-matched bids', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([auction]))
      .mockResolvedValueOnce(jsonResponse([{ ...auction, currentBidWld: '2500', highestBidderName: '새회원', bidCount: 2 }]));
    vi.stubGlobal('fetch', fetchMock);
    render(<AuctionLiveTickerStrip />);
    expect(await screen.findByText('실제 경매품')).toBeTruthy();
    expect(socket.emit).toHaveBeenCalledWith('auction:subscribe', auction.id);
    await act(async () => {
      await listeners.get('auction:bid')?.({ id: 'receipt-1', auctionId: auction.id, itemTitle: '실제 경매품',
        bidAmount: 2500, bidderName: '새회원', timestamp: '2026-10-25T00:00:00Z' });
    });
    expect(await screen.findByText('검증된 신규 입찰')).toBeTruthy();
    expect(screen.getAllByText(/2,500 WLD/).length).toBeGreaterThan(0);
    const close = screen.getByRole('button', { name: '입찰 알림 닫기' });
    expect(close.className).toMatch(/min-h-11/);
    fireEvent.click(close);
    await waitFor(() => expect(screen.queryByText('검증된 신규 입찰')).toBeNull());
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/marketplace/auctions', { cache: 'no-store', credentials: 'same-origin' });
  });

  it('does not announce unverified bids, forged amounts, or client-only events', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([auction])));
    render(<AuctionLiveTickerStrip />);
    await screen.findByText('실제 경매품');
    await act(async () => {
      await listeners.get('auction:bid')?.({ id: 'fake', auctionId: auction.id, itemTitle: '실제 경매품',
        bidAmount: 999999, bidderName: '가짜회원', timestamp: '2026-10-25T00:00:00Z' });
      window.dispatchEvent(new CustomEvent('auction:bid-placed', { detail: { bidAmount: 999999 } }));
    });
    expect(screen.queryByText('검증된 신규 입찰')).toBeNull();
    expect(screen.queryByText(/999,999/)).toBeNull();
  });

  it('invalidates stale auction information if the verification readback fails', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse([auction]))
      .mockResolvedValueOnce(jsonResponse({}, false, 503)));
    render(<AuctionLiveTickerStrip />);
    await screen.findByText('실제 경매품');
    await act(async () => {
      await listeners.get('auction:bid')?.({ id: 'receipt-outage', auctionId: auction.id,
        itemTitle: auction.itemName, bidAmount: 2500, bidderName: '새회원' });
    });
    expect(await screen.findByText('경매 기록을 확인할 수 없습니다.')).toBeTruthy();
    expect(screen.queryByText('실시간 연결됨')).toBeNull();
    expect(screen.queryByText('실제 경매품')).toBeNull();
    expect(screen.queryByText('검증된 신규 입찰')).toBeNull();
  });

  it('distinguishes an unauthenticated viewer from an empty market', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 401)));
    render(<AuctionLiveTickerStrip />);
    expect(await screen.findByText('로그인 후 경매 현황을 확인하세요.')).toBeTruthy();
    expect(screen.queryByText('활성 경매가 없습니다.')).toBeNull();
  });

  it('reports disconnected sockets without claiming a live connection', async () => {
    socket.connected = false;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([auction])));
    render(<AuctionLiveTickerStrip />);
    expect(await screen.findByText('실시간 연결 대기 중')).toBeTruthy();
    expect(screen.queryByText('실시간 연결됨')).toBeNull();
    expect(releaseSiteSocket).not.toHaveBeenCalled();
  });
});
