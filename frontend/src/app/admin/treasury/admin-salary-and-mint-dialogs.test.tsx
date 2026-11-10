import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminSalaryDisburseDialog } from './admin-salary-disburse-dialog';
import { AdminMintTopupDialog } from './admin-mint-topup-dialog';

const key = '77e539ef-1019-4e6a-92c5-3d9b405ea609';
const adminId = 'a9461a37-2780-4340-a312-8069c9570831';
const apiResponse = (body: unknown) => ({
  ok: true,
  json: async () => body,
});

afterEach(() => vi.unstubAllGlobals());

describe('AdminSalaryDisburseDialog & AdminMintTopupDialog', () => {
  it('renders admin salary disburse dialog trigger button', () => {
    render(<AdminSalaryDisburseDialog />);
    expect(screen.getByRole('button', { name: /관리자 임금 지급/i })).toBeDefined();
  });

  it('renders mint topup dialog trigger button', () => {
    render(<AdminMintTopupDialog />);
    expect(screen.getByRole('button', { name: /조폐국 화폐발행 국고 충전/i })).toBeDefined();
  });

  it('binds mint OTP issuance and financial execution to one unchanged request UUID', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockResolvedValueOnce(apiResponse({ ok: true, result: { ledger_transaction_id: 'receipt' } }));
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('crypto', { randomUUID: () => key });
    render(<AdminMintTopupDialog />);
    fireEvent.click(screen.getByRole('button', { name: /조폐국 화폐발행 국고 충전/i }));
    fireEvent.click(screen.getByRole('button', { name: /OTP 코드 발송/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch.mock.calls[0][0]).toBe('/api/admin/auth/channel-otp/request');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      action: 'treasury_mint_topup',
      amountWld: '1000000',
      requestKey: key,
    });

    fireEvent.change(screen.getByLabelText(/관리자 2FA/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /화폐발행 승인 및 국고 직행 충전/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch.mock.calls[1][0]).toBe('/api/admin/treasury/mint-topup');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      amountWld: '1000000',
      otpCode: '123456',
      requestKey: key,
    });
  });

  it('binds salary OTP issuance and financial execution to one recipient and amount', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockResolvedValueOnce(apiResponse({ ok: true, result: { ledger_transaction_id: 'receipt' } }));
    vi.stubGlobal('fetch', fetch);
    render(<AdminSalaryDisburseDialog />);
    fireEvent.click(screen.getByRole('button', { name: /관리자 임금 지급/i }));
    fireEvent.change(screen.getByLabelText(/수령 관리자 ID/i), { target: { value: adminId } });
    fireEvent.click(screen.getByRole('button', { name: /OTP 코드 발송/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      action: 'treasury_salary_disburse',
      targetAdminId: adminId,
      amountWld: '100000',
    });

    fireEvent.change(screen.getByLabelText(/관리자 2FA/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /임금 복식부기 실지급 집행/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch.mock.calls[1][0]).toBe('/api/admin/treasury/salary/disburse');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      targetAdminId: adminId,
      amountWld: '100000',
      otpCode: '123456',
    });
  });

  it('disables the previously issued code when mint amount changes', async () => {
    const fetch = vi.fn().mockResolvedValue(apiResponse({ success: true }));
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('crypto', { randomUUID: () => key });
    render(<AdminMintTopupDialog />);
    fireEvent.click(screen.getByRole('button', { name: /조폐국 화폐발행 국고 충전/i }));
    fireEvent.click(screen.getByRole('button', { name: /OTP 코드 발송/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText(/발행 및 충전액/i), { target: { value: '2000000' } });
    fireEvent.change(screen.getByLabelText(/관리자 2FA/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /화폐발행 승인 및 국고 직행 충전/i }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/먼저 현재 금액과 사유에 대한 OTP/i)).toBeDefined();
  });
});
