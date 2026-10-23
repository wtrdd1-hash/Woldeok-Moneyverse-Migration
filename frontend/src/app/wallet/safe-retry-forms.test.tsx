import type * as ReactTypes from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

const actionState = vi.hoisted(() => ({ current: { status: 'idle' as 'idle' | 'error' | 'ok' } }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactTypes>();
  return { ...actual, useActionState: () => [actionState.current, vi.fn()] };
});
vi.mock('./actions', () => ({ transfer: vi.fn(), moveBank: vi.fn(), borrow: vi.fn(), repay: vi.fn(), claimDaily: vi.fn() }));
import { BankPanel, LoanList, TransferForm } from './wallet-forms';

let sequence = 0;
function key() {
  sequence += 1;
  return `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`;
}

function hidden(container: HTMLElement, name: string): string {
  const input = container.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`);
  if (!input) throw new Error(`missing ${name}`);
  return input.value;
}

beforeEach(() => {
  sequence = 0;
  actionState.current = { status: 'idle' };
  vi.stubGlobal('crypto', { randomUUID: key });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('wallet retry keys survive ambiguous failures', () => {
  it('transfer keeps the same key on failure, rotates after a changed amount or success', async () => {
    const screen = render(<TransferForm currency="WLD" />);
    await waitFor(() => expect(hidden(screen.container, 'idempotencyKey')).not.toBe(''));
    const original = hidden(screen.container, 'idempotencyKey');
    actionState.current = { status: 'error' };
    screen.rerender(<TransferForm currency="WLD" />);
    expect(hidden(screen.container, 'idempotencyKey')).toBe(original);
    fireEvent.change(screen.getByLabelText(/보낼/), { target: { value: '500' } });
    const changed = hidden(screen.container, 'idempotencyKey');
    expect(changed).not.toBe(original);
    actionState.current = { status: 'ok' };
    screen.rerender(<TransferForm currency="WLD" />);
    await waitFor(() => expect(hidden(screen.container, 'idempotencyKey')).not.toBe(changed));
  });

  it('bank forms supply independent direction and loan keys and preserve them on failure', async () => {
    const screen = render(<BankPanel />);
    await waitFor(() => expect(hidden(screen.container, 'depositKey')).not.toBe(''));
    const deposit = hidden(screen.container, 'depositKey');
    const withdraw = hidden(screen.container, 'withdrawKey');
    const loan = hidden(screen.container, 'idempotencyKey');
    expect(new Set([deposit, withdraw, loan]).size).toBe(3);
    actionState.current = { status: 'error' };
    screen.rerender(<BankPanel />);
    expect(hidden(screen.container, 'depositKey')).toBe(deposit);
    expect(hidden(screen.container, 'withdrawKey')).toBe(withdraw);
    expect(hidden(screen.container, 'idempotencyKey')).toBe(loan);
  });

  it('repayment has a separate key for each loan, preserved after a failed submission', async () => {
    const loans = [
      { loanId: '11111111-1111-4111-8111-111111111111', principalAmount: '100', interestAmount: '5', outstandingAmount: '105', status: 'active' as const, issuedAt: '2026-10-23T00:00:00Z', repaidAt: null },
      { loanId: '22222222-2222-4222-8222-222222222222', principalAmount: '200', interestAmount: '10', outstandingAmount: '210', status: 'active' as const, issuedAt: '2026-10-23T00:00:00Z', repaidAt: null },
    ];
    const screen = render(<LoanList loans={loans} />);
    await waitFor(() => expect(screen.container.querySelectorAll('input[name="idempotencyKey"]').length).toBe(2));
    const keys = Array.from(screen.container.querySelectorAll<HTMLInputElement>('input[name="idempotencyKey"]')).map((input) => input.value);
    expect(keys[0]).not.toBe('');
    expect(keys[0]).not.toBe(keys[1]);
    actionState.current = { status: 'error' };
    screen.rerender(<LoanList loans={loans} />);
    expect(Array.from(screen.container.querySelectorAll<HTMLInputElement>('input[name="idempotencyKey"]')).map((input) => input.value)).toEqual(keys);
  });
});
