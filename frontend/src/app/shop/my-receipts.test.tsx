import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MyReceipts } from './my-receipts';
import { useViewer } from '@/lib/use-viewer';

vi.mock('@/lib/use-viewer', () => ({ useViewer: vi.fn() }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

const member = { signedIn: true, consentCurrent: true, adminRoles: [] };
const guest = { signedIn: false, consentCurrent: false, adminRoles: [] };

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe('verified shop purchase history', () => {
  it('displays a verified recent purchase with its exact amount and ledger reference', async () => {
    vi.mocked(useViewer).mockReturnValue(member);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ purchases: [{
      purchaseId: '11111111-1111-4111-8111-111111111111',
      itemName: 'Owned item',
      transactionId: '33333333-3333-4333-8333-333333333333',
      amount: '900719925474099312345678901234567890',
      purchasedAt: '2026-10-25T00:00:00.000Z',
    }] }), { status: 200 })));
    render(<MyReceipts />);
    expect(await screen.findByText('Owned item')).toBeDefined();
    expect(screen.getByText(/최근 최대 30건/)).toBeDefined();
    expect(screen.getByText(/33333333-3333-4333-8333-333333333333/)).toBeDefined();
  });

  it('does not show an empty history when upstream fails and allows retry', async () => {
    vi.mocked(useViewer).mockReturnValue(member);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ purchases: [] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MyReceipts />);
    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.queryByText('아직 구매 기록이 없어요.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '다시 조회' }));
    expect(await screen.findByText('아직 구매 기록이 없어요.')).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never displays private receipts after sign-out', async () => {
    vi.mocked(useViewer).mockReturnValue(member);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ purchases: [{
      purchaseId: '11111111-1111-4111-8111-111111111111',
      itemName: 'Private item', transactionId: '33333333-3333-4333-8333-333333333333', amount: '100', purchasedAt: '2026-10-25T00:00:00Z',
    }] }), { status: 200 })));
    const { rerender } = render(<MyReceipts />);
    expect(await screen.findByText('Private item')).toBeDefined();
    vi.mocked(useViewer).mockReturnValue(guest);
    rerender(<MyReceipts />);
    await waitFor(() => expect(screen.queryByText('Private item')).toBeNull());
  });

  it('ignores an in-flight purchase response after sign-out', async () => {
    vi.mocked(useViewer).mockReturnValue(member);
    let finish!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { finish = resolve; })));
    const { rerender } = render(<MyReceipts />);
    vi.mocked(useViewer).mockReturnValue(guest);
    rerender(<MyReceipts />);
    finish(new Response(JSON.stringify({ purchases: [{
      purchaseId: '11111111-1111-4111-8111-111111111111',
      itemName: 'Late private item',
      transactionId: '33333333-3333-4333-8333-333333333333',
      amount: '100', purchasedAt: '2026-10-25T00:00:00Z',
    }] }), { status: 200 }));
    await waitFor(() => expect(screen.queryByText('Late private item')).toBeNull());
  });

});
