import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TreasuryOperationsDialog } from './treasury-operations-dialog';
import { injectTreasuryFunds } from '../actions';

vi.mock('../actions', () => ({ injectTreasuryFunds: vi.fn(), absorbTreasuryFunds: vi.fn() }));

const vaults = [{
  id: '00000000-0000-4000-8000-000000000001', code: 'VAULT_MAIN', name: '중앙 국고',
  balance_wld: '100000000', description: '', created_at: '2026-10-27T00:00:00Z', updated_at: '2026-10-27T00:00:00Z',
}];

function openDialog() {
  render(<TreasuryOperationsDialog vaults={vaults} />);
  fireEvent.click(screen.getByRole('button', { name: /국고 자금 관리/ }));
  return screen.getByRole('textbox', { name: /처리 금액/ }) as HTMLInputElement;
}

describe('TreasuryOperationsDialog monetary safety', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses exact WLD string arithmetic in the actual form submitted to the admin action', async () => {
    vi.mocked(injectTreasuryFunds).mockResolvedValue({ status: 'ok', message: '확인됨' });
    const input = openDialog();
    fireEvent.change(input, { target: { value: '9007199254740993' } });
    fireEvent.click(screen.getByRole('button', { name: '+100만' }));
    expect(input.value).toBe('9007199255740993');
    fireEvent.click(screen.getByRole('button', { name: /국고 자금 긴급 주입 실행/ }));
    await waitFor(() => expect(injectTreasuryFunds).toHaveBeenCalledTimes(1));
    const formData = vi.mocked(injectTreasuryFunds).mock.calls[0]![1];
    expect(formData.get('amountWld')).toBe('9007199255740993');
    expect(formData.has('idempotencyKey')).toBe(false);
  });

  it('blocks zero, noncanonical and missing-vault submissions and keeps mobile touch targets', () => {
    const input = openDialog();
    const submit = screen.getByRole('button', { name: /국고 자금 긴급 주입 실행/ });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: '0' } });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: '001' } });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(input.value).toBe('1.5');
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: '9'.repeat(31) } });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button', { name: '+100만' }).className).toContain('min-h-11');
    expect(screen.getByRole('button', { name: /국고 자금 긴급 주입 실행/ }).className).toContain('min-h-11');
  });

  it('does not claim TOTP or server idempotency and explains the actual security boundary', () => {
    openDialog();
    expect(screen.getByText(/관리자 세션·서버 권한 검증/)).toBeTruthy();
    expect(screen.getByText(/중복 실행 방지 키 미지원/)).toBeTruthy();
    expect(screen.queryByText(/2단계 인증\(TOTP\)이 강제/)).toBeNull();
  });

  it('requires an explicit ledger-review acknowledgment after an ambiguous server failure', async () => {
    vi.mocked(injectTreasuryFunds).mockResolvedValueOnce({ status: 'error', message: '서버 연결 오류' });
    const input = openDialog();
    fireEvent.change(input, { target: { value: '1000000' } });
    const submit = screen.getByRole('button', { name: /국고 자금 긴급 주입 실행/ });
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0));
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/재실행 전에 국고 거래 내역을 확인하세요/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /거래 내역 확인 완료/ }));
    expect((submit as HTMLButtonElement).disabled).toBe(false);
  });

  it('does not submit twice while the first request is pending', async () => {
    let resolve!: (value: { status: 'ok'; message: string }) => void;
    vi.mocked(injectTreasuryFunds).mockImplementationOnce(() => new Promise((r) => { resolve = r; }));
    const input = openDialog();
    fireEvent.change(input, { target: { value: '1000000' } });
    const form = input.closest('form')!;
    await act(async () => { fireEvent.submit(form); fireEvent.submit(form); });
    expect(injectTreasuryFunds).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ status: 'ok', message: '완료' }));
  });
});
