import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RealEstateAuctionClient } from './real-estate-auction-client';

afterEach(() => { vi.unstubAllGlobals(); });

describe('real-estate member source truth', () => {
  it('shows unavailable instead of fabricated owner shares or claimable WLD after 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false, code: 'REAL_ESTATE_SOURCE_UNVERIFIED',
    }), { status: 503, headers: { 'content-type': 'application/json' } })));
    render(<RealEstateAuctionClient />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('확인할 수 없습니다'));
    expect(screen.queryByText(/15 주/)).toBeNull();
    expect(screen.queryByText(/4,990/)).toBeNull();
    expect(screen.queryByRole('button', { name: '일괄 수령' })).toBeNull();
    expect(screen.queryByRole('button', { name: '입찰하기' })).toBeNull();
  });
});
