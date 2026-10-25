import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TreasuryDaoVoting } from './treasury-dao-voting';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('citizen treasury proposal integrity', () => {
  it('shows unverified status without invented proposals, votes, or actionable controls', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ ok: false, verified: false, proposals: [] }) });
    vi.stubGlobal('fetch', fetchSpy);
    render(<TreasuryDaoVoting isLoggedIn />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('검증'));
    expect(screen.queryByText(/월덕거래소 주식 매매 수수료 전액/)).toBeNull();
    expect(screen.queryByRole('button', { name: /발의하기|투표하기/ })).toBeNull();
    expect(fetchSpy).toHaveBeenCalledWith('/api/treasury/proposals', expect.objectContaining({ cache: 'no-store' }));
  });
});
