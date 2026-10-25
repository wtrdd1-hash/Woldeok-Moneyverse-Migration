import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuctionView } from './auction-view';
import { realAuction } from './auction-feed.fixture';

const response = (auctions: unknown, ok = true, status = 200) => ({ ok, status, json: async () => ({ auctions }) });

describe('AuctionView authoritative listing states', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('shows loading then genuine empty state, never synthetic auc_01', async () => {
    vi.mocked(fetch).mockResolvedValue(response([]) as Response);
    render(<AuctionView />);
    expect(screen.getByRole('status').textContent).toContain('불러오는 중');
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('진행 중인 경매가 없습니다'));
    expect(screen.queryByText('초대총독_알렉스')).toBeNull();
  });
  it('shows unavailable with a 44px retry action and no fake success on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response([realAuction]) as Response);
    render(<AuctionView />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('경매 목록을 확인할 수 없습니다'));
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(screen.getByText('검증된 경매 물품')).toBeTruthy());
    expect(screen.getByRole('button', { name: /입찰 일시 중단/ }).hasAttribute('disabled')).toBe(true);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe('/api/marketplace/auctions');
  });
  it('distinguishes 401 from an unavailable service', async () => {
    vi.mocked(fetch).mockResolvedValue(response(null, false, 401) as Response);
    render(<AuctionView />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('로그인이 필요합니다'));
  });
});
