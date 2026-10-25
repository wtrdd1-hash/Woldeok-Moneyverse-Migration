import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider } from '@/components/locale-provider';
import { P2PTransferModal } from './p2p-transfer-modal';

const recipient = { userId: '33333333-3333-4333-8333-333333333333', displayName: 'Test recipient' };
const transactionId = '55555555-5555-4555-8555-555555555555';
const response = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const renderModal = () => render(<LocaleProvider initialLocale="en"><P2PTransferModal /></LocaleProvider>);

async function fillForm() {
  fireEvent.click(screen.getByRole('button', { name: /Smart P2P Transfer/i }));
  fireEvent.change(screen.getByPlaceholderText('Search recipient by nickname...'), { target: { value: 'Test' } });
  await waitFor(() => expect(screen.getByRole('button', { name: /Test recipient/i })).toBeTruthy());
  fireEvent.click(screen.getByRole('button', { name: /Test recipient/i }));
  fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100' } });
}

describe('P2P transfer receipt integrity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
      url.startsWith('/api/transfers/search')
        ? response(200, { recipients: [recipient] })
        : response(200, { success: true, transactionId }),
    ));
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('renders only the verified ledger receipt and does not promise a notification', async () => {
    renderModal();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Now/i }));
    await waitFor(() => expect(screen.getByText(transactionId)).toBeTruthy());
    expect(screen.getByText('Transfer Complete!')).toBeTruthy();
    expect(screen.queryByText(/Real-time notification delivered/i)).toBeNull();
    const calls = vi.mocked(fetch).mock.calls;
    const post = calls.find(([url]) => url === '/api/transfers/p2p');
    expect(post).toBeDefined();
    expect(JSON.parse(String(post?.[1]?.body)).idempotencyKey).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('blocks blind retries and never shows success when the response lacks a receipt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
      url.startsWith('/api/transfers/search')
        ? response(200, { recipients: [recipient] })
        : response(200, { success: true }),
    ));
    renderModal();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Now/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.queryByText('Transfer Complete!')).toBeNull();
    expect(screen.getByRole('button', { name: /Send Now/i })).toHaveProperty('disabled', true);
  });
  it('treats a server 503 as an unknown outcome, never a failed transfer safe to retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
      url.startsWith('/api/transfers/search')
        ? response(200, { recipients: [recipient] })
        : response(503, { code: 'TRANSFER_OUTCOME_UNKNOWN' }),
    ));
    renderModal();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Now/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('link', { name: 'Review wallet history' }).getAttribute('href')).toBe('/wallet');
    expect(screen.queryByText('Transfer Complete!')).toBeNull();
    expect(screen.getByRole('button', { name: /Send Now/i })).toHaveProperty('disabled', true);
  });

  it('uses the same intent UUID on a definitively rejected retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
      url.startsWith('/api/transfers/search')
        ? response(200, { recipients: [recipient] })
        : response(400, { error: 'Request rejected' }),
    ));
    renderModal();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Now/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: /Send Now/i }));
    await waitFor(() => expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === '/api/transfers/p2p')).toHaveLength(2));
    const attempts = vi.mocked(fetch).mock.calls.filter(([url]) => url === '/api/transfers/p2p');
    expect(JSON.parse(String(attempts[0]?.[1]?.body)).idempotencyKey)
      .toBe(JSON.parse(String(attempts[1]?.[1]?.body)).idempotencyKey);
  });

});
