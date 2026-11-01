import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import AuctionMarketplacePage, { metadata } from './page';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn().mockResolvedValue(undefined) }));

describe('Marketplace auction source containment', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });
  it('requires a member and consults the guarded server API without displaying fabricated auctions or money', async () => {
    render(await AuctionMarketplacePage());
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/marketplace/auctions');
    expect(screen.getByRole('alert').textContent).toContain('검증');
    expect(screen.queryByText(/황금 호가창 네온 테마/)).toBeNull();
    expect(screen.queryByText(/842,500|250,000|CryptoWhale/)).toBeNull();
    expect(screen.queryByRole('button', { name: /입찰|구매|확정/ })).toBeNull();
  });

  it('does not turn even a success-shaped response into a verified market', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce([{ id: 'demo', currentBidWld: '9000' }]);
    render(await AuctionMarketplacePage());
    expect(screen.getByRole('alert').textContent).toContain('검증');
    expect(screen.queryByText(/9,000 WLD/)).toBeNull();
    expect(screen.getByRole('link', { name: /다시 확인/ }).getAttribute('href')).toBe('/marketplace/auction');
  });

  it('is private and unindexable by search engines', () => {
    expect(metadata).toMatchObject({ robots: { index: false, follow: false } });
  });
});
