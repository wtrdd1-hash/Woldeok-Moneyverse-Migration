import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BondControlTower } from './bond-control-tower';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('bond admin fail-closed console', () => {
  it('distinguishes unavailable read evidence from zero holdings and offers keyboard retry', () => {
    render(<BondControlTower initialOverview={null} initialBonds={[]} initialLogs={[]} />);
    expect(screen.getByRole('alert').textContent).toContain('조회');
    expect(screen.queryByText('3 ACTIVE OFFERINGS')).toBeNull();
    expect(screen.queryByText('ACTIVE PIPELINE')).toBeNull();
    expect(screen.queryByText('쿠폰 이자 즉시 일괄 지급')).toBeNull();
    expect(screen.getByRole('button', { name: /새로고침/ })).toBeDefined();
  });
  it('does not claim a failed refresh succeeded or keep stale financial evidence', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetchMock);
    render(<BondControlTower initialOverview={{ totalBondsActive: 0, totalFundedWld: '0', totalHoldersCount: 0, totalCouponsPaidWld: '0', benchmark1YYield: '0.00%', benchmark3YYield: '0.00%', benchmark5YYield: '0.00%' }} initialBonds={[]} initialLogs={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('조회'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
