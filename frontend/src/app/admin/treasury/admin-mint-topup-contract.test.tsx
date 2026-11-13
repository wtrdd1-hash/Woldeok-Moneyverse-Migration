// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminMintTopupDialog } from './admin-mint-topup-dialog';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Mint Treasury request contract', () => {
  it('sends a UUID v4 and retains it on ambiguous failures, while displaying API errors', async () => {
    vi.stubGlobal('crypto', { randomUUID: () => '11111111-1111-4111-8111-111111111111' });
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Mint temporarily unavailable' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Mint temporarily unavailable' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AdminMintTopupDialog />);
    fireEvent.click(screen.getByRole('button', { name: /조폐국 화폐발행 국고 충전/i }));
    fireEvent.change(screen.getByPlaceholderText(/6자리 코드/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /화폐발행 승인 및 국고 직행 충전/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Mint temporarily unavailable')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: /화폐발행 승인 및 국고 직행 충전/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const bodies = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body));
    expect(bodies[0].requestKey).toBe('11111111-1111-4111-8111-111111111111');
    expect(bodies[1].requestKey).toBe(bodies[0].requestKey);
  });
});
