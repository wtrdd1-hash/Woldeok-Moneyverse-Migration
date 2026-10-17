import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlackMarketAuctionModal } from './black-market-auction-modal';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('secret auction ledger protection in member UI', () => {
  it('explains settlement hold and never offers a new bidding action', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ auctions: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<BlackMarketAuctionModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('status').textContent).toContain('원장 정산 검증 중');
    expect(screen.queryByRole('button', { name: /WLD 입찰하기/ })).toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.every(([url, options]) =>
      String(url).startsWith('/api/market/secret-auction') && options?.method !== 'POST')).toBe(true);
  });
});
