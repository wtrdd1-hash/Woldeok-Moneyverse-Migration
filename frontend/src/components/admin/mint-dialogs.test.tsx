// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MintExecutionDialog, OrderProposalDialog, type PolicyOrderSummary } from './mint-dialogs';

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

const approved: PolicyOrderSummary = {
  id: '11111111-1111-4111-8111-111111111111',
  order_type: 'MINT', target_envelope: 'WORK_REWARD', max_amount_wld: '500000',
  executed_amount_wld: '100000', status: 'APPROVED',
  expires_at: '2099-01-01T00:00:00.000Z', reason: '승인된 작업보상 통화정책',
};

describe('v1946 screenshots: async order selection and actual proposal schema', () => {
  it('submits the visible first APPROVED order even if the initial asynchronous list was empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'certificate-1' }) });
    vi.stubGlobal('fetch', fetchMock);
    const onSuccess = vi.fn();
    const props = { isOpen: true, onClose: vi.fn(), onSuccess };
    const { rerender } = render(<MintExecutionDialog {...props} activeOrders={[]} />);
    rerender(<MintExecutionDialog {...props} activeOrders={[approved]} />);

    const select = screen.getByLabelText('승인된 주조 명령서 (APPROVED MINT Order)') as HTMLSelectElement;
    expect(select.value).toBe(approved.id);
    expect(screen.getByText(/남은 발행 한도/)).toBeTruthy();
    expect(screen.getByText(/국고 금고.*실제 입금/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '주조 증명서 기록' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({
      policy_order_id: approved.id, amount_wld: '100000', recipient_user_id: null,
    });
    expect(screen.queryByText('발행할 승인 정책 명령서를 선택해 주세요.')).toBeNull();
  });

  it('reselects a valid order if an asynchronously refreshed order expires', () => {
    const second = { ...approved, id: '22222222-2222-4222-8222-222222222222' };
    vi.stubGlobal('fetch', vi.fn());
    const props = { isOpen: true, onClose: vi.fn(), onSuccess: vi.fn() };
    const { rerender } = render(<MintExecutionDialog {...props} activeOrders={[approved, second]} />);
    const select = screen.getByLabelText('승인된 주조 명령서 (APPROVED MINT Order)') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: second.id } });
    expect(select.value).toBe(second.id);
    rerender(<MintExecutionDialog {...props} activeOrders={[approved]} />);
    expect(select.value).toBe(approved.id);
  });

  it('new policy proposal defaults to the persisted MINT/WORK_REWARD domain, never the invalid TREASURY enum', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'order-created' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<OrderProposalDialog isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByRole('option', { name: /TREASURY/ })).toBeNull();
    expect(screen.queryByRole('option', { name: /EXPAND_LIMIT/ })).toBeNull();
    expect(screen.getByText(/국고 직접 입금은 아직 지원하지 않습니다/)).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/거시경제 안정화/), { target: { value: '작업 보상 정책 감사 사유 충분합니다' } });
    fireEvent.click(screen.getByRole('button', { name: '정책 명령 발의' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({
      order_type: 'MINT', target_envelope: 'WORK_REWARD', max_amount_wld: '10000000', valid_duration_hours: 72,
    });
  });

  it('RETIRE policy changes target to HARD_SINK_PURGE and does not submit invalid combinations', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'order-created' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<OrderProposalDialog isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);
    const typeSelect = screen.getByRole('combobox', { name: '명령 유형' });
    fireEvent.change(typeSelect, { target: { value: 'RETIRE' } });
    fireEvent.change(screen.getByPlaceholderText(/거시경제 안정화/), { target: { value: '안정화 목적의 소각 명령 발의 사유입니다' } });
    fireEvent.click(screen.getByRole('button', { name: '정책 명령 발의' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({ order_type: 'RETIRE', target_envelope: 'HARD_SINK_PURGE' });
  });
});
