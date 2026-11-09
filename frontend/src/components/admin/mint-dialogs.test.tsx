// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OrderProposalDialog } from './mint-dialogs';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('v1941 national mint policy order justification parity', () => {
  it('labels and rejects a nine-character audit reason before any API request', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<OrderProposalDialog isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText('정책 발의 사유 (Audit Justification, 10자 이상)')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/거시경제 안정화/), { target: { value: '123456789' } });
    fireEvent.click(screen.getByRole('button', { name: '정책 명령 발의' }));

    expect(screen.getByRole('alert').textContent).toContain('10자 이상');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits a trimmed ten-character reason to the existing endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'order-1' }) });
    const onSuccess = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<OrderProposalDialog isOpen onClose={vi.fn()} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText(/거시경제 안정화/), { target: { value: '  1234567890  ' } });
    fireEvent.click(screen.getByRole('button', { name: '정책 명령 발의' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/admin/mint/orders');
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({ reason: '1234567890' });
  });
});
