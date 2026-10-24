import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CitizenTaxReceiptCard } from './citizen-tax-receipt-card';

const castVote = vi.hoisted(() => vi.fn());
vi.mock('@/app/wallet/actions', () => ({ castCitizenBudgetVote: castVote }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('citizen budget vote UI', () => {
  it('offers the four real database priorities, not the retired values', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })));
    render(<CitizenTaxReceiptCard />);
    await screen.findByText(/검증된 납세 영수증을 불러올 수 없습니다/);
    const values = [...document.querySelectorAll<HTMLInputElement>('input[name="gov_budget_choice"]')].map((input) => input.value);
    expect(values).toEqual(['WELFARE', 'CURRENCY_STABILIZATION', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND']);
    expect(screen.getByText(/납세액을 0 WLD로 확정하지 않습니다/)).toBeTruthy();
  });

  it('shows failure as an alert without a green success icon and only confirms a saved vote', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })));
    castVote.mockResolvedValueOnce({ status: 'error', message: 'vote unavailable' });
    castVote.mockResolvedValueOnce({ status: 'ok', message: 'vote confirmed' });
    render(<CitizenTaxReceiptCard />);
    await screen.findByText(/검증된 납세 영수증을 불러올 수 없습니다/);
    fireEvent.click(screen.getByRole('button', { name: /시민 우선순위 투표 제출/ }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('vote unavailable'));
    expect(screen.queryByText('vote confirmed')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /시민 우선순위 투표 제출/ }));
    await waitFor(() => expect(screen.getAllByRole('status').some((item) => item.textContent?.includes('vote confirmed'))).toBe(true));
    expect(screen.getByRole('button', { name: /투표 변경하기/ })).toBeTruthy();
  });
});
