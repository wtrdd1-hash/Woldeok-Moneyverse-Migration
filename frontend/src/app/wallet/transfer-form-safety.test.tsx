import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';

vi.mock('./actions', () => ({
  transfer: vi.fn(async () => ({ status: 'idle' })),
  moveBank: vi.fn(), borrow: vi.fn(), repay: vi.fn(), claimDaily: vi.fn(),
}));

import { TransferForm } from './wallet-forms';

const USER = '11111111-1111-4111-8111-111111111111';
const OTHER_USER = '66666666-6666-4666-8666-666666666666';
const STORAGE_KEY = `moneyverse:wallet:pending-transfer:v1:${USER}`;
const ATTEMPT = {
  recipientUserId: '22222222-2222-4222-8222-222222222222',
  amount: '100',
  idempotencyKey: '44444444-4444-4444-8444-444444444444',
};

afterEach(() => cleanup());
beforeEach(() => { sessionStorage.clear(); vi.clearAllMocks(); });

describe('transfer form uncertain-outcome safety', () => {
  it('restores an uncertain transfer across reload and locks the exact command', async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ATTEMPT));
    const { container } = render(<TransferForm currency="WLD" userId={USER} />);
    const recipient = container.querySelector<HTMLInputElement>('input[name="recipientUserId"]')!;
    const amount = container.querySelector<HTMLInputElement>('input[name="amount"]')!;
    const key = container.querySelector<HTMLInputElement>('input[name="idempotencyKey"]')!;
    await waitFor(() => expect(key.value).toBe(ATTEMPT.idempotencyKey));
    expect(recipient.value).toBe(ATTEMPT.recipientUserId);
    expect(amount.value).toBe(ATTEMPT.amount);
    expect(recipient.readOnly).toBe(true);
    expect(amount.readOnly).toBe(true);
    expect(container.textContent).toContain('동일한 요청');
    fireEvent.change(amount, { target: { value: '200' } });
    expect(amount.value).toBe('100');
  });

  it('uses a new key for a changed, not-yet-submitted transfer', async () => {
    const { container } = render(<TransferForm currency="WLD" userId={USER} />);
    const key = container.querySelector<HTMLInputElement>('input[name="idempotencyKey"]')!;
    const amount = container.querySelector<HTMLInputElement>('input[name="amount"]')!;
    await waitFor(() => expect(key.value).toMatch(/^[0-9a-f-]{36}$/i));
    const initial = key.value;
    fireEvent.change(amount, { target: { value: '100' } });
    expect(key.value).not.toBe(initial);
  });
  it('stores the exact key and payload before dispatch and freezes the form while awaiting a reply', async () => {
    const { container } = render(<TransferForm currency="WLD" userId={USER} />);
    const recipient = container.querySelector<HTMLInputElement>('input[name="recipientUserId"]')!;
    const amount = container.querySelector<HTMLInputElement>('input[name="amount"]')!;
    const key = container.querySelector<HTMLInputElement>('input[name="idempotencyKey"]')!;
    await waitFor(() => expect(key.value).toMatch(/^[0-9a-f-]{36}$/i));
    fireEvent.change(recipient, { target: { value: ATTEMPT.recipientUserId } });
    fireEvent.change(amount, { target: { value: ATTEMPT.amount } });
    const submittedKey = key.value;
    await act(async () => { fireEvent.submit(container.querySelector('form')!); });
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as typeof ATTEMPT | null;
    expect(saved).toEqual({ ...ATTEMPT, idempotencyKey: submittedKey });
    expect(recipient.readOnly).toBe(true);
    expect(amount.readOnly).toBe(true);
  });

  it("never restores a previous member's pending recipient or amount in another account", async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ATTEMPT));
    const { container } = render(<TransferForm currency="WLD" userId={OTHER_USER} />);
    const recipient = container.querySelector<HTMLInputElement>('input[name="recipientUserId"]')!;
    const key = container.querySelector<HTMLInputElement>('input[name="idempotencyKey"]')!;
    await waitFor(() => expect(key.value).toMatch(/^[0-9a-f-]{36}$/i));
    expect(recipient.value).toBe('');
    expect(key.value).not.toBe(ATTEMPT.idempotencyKey);
    expect(container.textContent).not.toContain('동일한 요청');
  });

  it('clears a restored transfer when the authenticated wallet user changes without a remount', async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ATTEMPT));
    const { container, rerender } = render(<TransferForm currency="WLD" userId={USER} />);
    const recipient = container.querySelector<HTMLInputElement>('input[name="recipientUserId"]')!;
    await waitFor(() => expect(recipient.value).toBe(ATTEMPT.recipientUserId));
    rerender(<TransferForm currency="WLD" userId={OTHER_USER} />);
    await waitFor(() => expect(recipient.value).toBe(''));
    expect(recipient.readOnly).toBe(false);
  });

  it('shows a validation error instead of silently ignoring malformed amount input', async () => {
    const { container } = render(<TransferForm currency="WLD" userId={USER} />);
    const recipient = container.querySelector<HTMLInputElement>('input[name="recipientUserId"]')!;
    const amount = container.querySelector<HTMLInputElement>('input[name="amount"]')!;
    const key = container.querySelector<HTMLInputElement>('input[name="idempotencyKey"]')!;
    await waitFor(() => expect(key.value).toMatch(/^[0-9a-f-]{36}$/i));
    fireEvent.change(recipient, { target: { value: ATTEMPT.recipientUserId } });
    fireEvent.change(amount, { target: { value: '1e2' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(container.textContent).toContain('정확한 머니버스 ID와 1 이상의 정수 금액');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

});
