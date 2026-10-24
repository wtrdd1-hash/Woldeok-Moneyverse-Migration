import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const castVote = vi.hoisted(() => vi.fn());
vi.mock('@/app/wallet/governance-actions', () => ({ castCitizenBudgetVoteAction: castVote }));
import { CitizenTaxReceiptCard } from './citizen-tax-receipt-card';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
    total_tax_paid_wld: '0', total_community_dividend_wld: '0',
  }), { status: 200, headers: { 'content-type': 'application/json' } })));
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe('citizen budget vote UI', () => {
  it('renders the four database-supported choices and shows failure without a success badge', async () => {
    castVote.mockResolvedValue({ status: 'error', message: '투표 저장을 확인하지 못했습니다.' });
    render(<CitizenTaxReceiptCard />);
    await waitFor(() => expect(screen.getAllByRole('radio')).toHaveLength(4));
    expect(screen.getByText('시민 배당 우선')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '시민 우선순위 투표 제출' }));
    await waitFor(() => expect(castVote).toHaveBeenCalledWith('WELFARE'));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('투표 저장을 확인하지 못했습니다.'));
    await waitFor(() => expect(screen.getByRole('button', { name: '시민 우선순위 투표 제출' })).toBeTruthy());
  });
  it('submits a supported changed choice and shows only verified success', async () => {
    castVote.mockResolvedValue({ status: 'ok', message: '2026-Q4 분기 시민 우선순위 투표가 저장되었습니다.' });
    render(<CitizenTaxReceiptCard />);
    await waitFor(() => expect(screen.getAllByRole('radio')).toHaveLength(4));
    fireEvent.click(screen.getByRole('radio', { name: /공공 인프라 우선/ }));
    fireEvent.click(screen.getByRole('button', { name: '시민 우선순위 투표 제출' }));
    await waitFor(() => expect(castVote).toHaveBeenCalledWith('INFRASTRUCTURE'));
    await waitFor(() => expect(screen.getByRole('button', { name: '투표 변경하기' })).toBeTruthy());
    expect(screen.getByRole('status').textContent).toContain('저장되었습니다.');
  });

});
