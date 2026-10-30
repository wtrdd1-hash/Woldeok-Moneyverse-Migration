import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
vi.mock('@/lib/use-viewer', () => ({ useViewer: () => ({ signedIn: true }) }));
import { MyReceipts } from './my-receipts';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('shop receipt search accessibility', () => {
  it('shows only the exact sum of displayed receipts, not a lifetime spending claim', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({
      purchases: [{ purchaseId: '00000000-0000-4000-8000-000000000001', itemName: 'Blue Gloves', amount: '9007199254740993', purchasedAt: '2026-10-30T00:00:00.000Z' }],
      summary: { count: 1, totalSpent: '9007199254740993', scope: 'displayed' },
    }) }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MyReceipts />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('9,007,199,254,740,993'));
    expect(screen.getByRole('status').textContent).toContain('전체 누적 구매액은 아닙니다');
    expect(fetchMock).toHaveBeenCalledWith('/api/shop/purchases', { cache: 'no-store' });
  });
  it('shows an error instead of an invented zero when a receipt total is forged', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({
      purchases: [], summary: { count: 1, totalSpent: '999', scope: 'displayed' },
    }) })));
    render(<MyReceipts />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('불러올 수 없습니다'));
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('renders a labelled 80-character search field and honest recent-history boundary', () => {
    const html = renderToStaticMarkup(<MyReceipts />);
    expect(html).toContain('name="receiptSearch"');
    expect(html).toContain('maxLength="80"');
    expect(html).toContain('최근 100건');
    expect(html).toContain('name="receiptMinAmount"');
    expect(html).toContain('inputMode="numeric"');
  });
});

describe('shop receipt date range accessibility', () => {
  it('renders two labelled date inputs and explicit apply and clear controls', () => {
    const html = renderToStaticMarkup(<MyReceipts />);
    expect(html).toContain('name="receiptFrom"');
    expect(html).toContain('name="receiptTo"');
    expect(html).toContain('날짜 적용');
    expect(html).toContain('날짜 초기화');
    expect(html).toContain('한국시간');
  });
});
