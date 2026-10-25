// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BankMovementsPage, { metadata } from './page';

const api = vi.fn();
const requireMember = vi.fn(async () => {});
vi.mock('@/lib/api', () => ({ api: (...args: unknown[]) => api(...args) }));
vi.mock('@/lib/session', () => ({ requireMember: () => requireMember() }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'en' }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('member bank ledger receipts', () => {
  it('shows verified owner-only bank movements with exact WLD strings and noindex', async () => {
    api.mockResolvedValue({ movements: [{
      transactionId: 'ddc070b2-4050-4ed2-9e91-37eb1c8d72ab', type: 'BANK_DEPOSIT',
      occurredAt: '2026-10-25T10:00:00.000Z', amountWld: '900719925474099312345678901',
      cashDeltaWld: '-900719925474099312345678901', bankDeltaWld: '900719925474099312345678901',
      verification: 'LEDGER_VERIFIED',
    }] });
    render(await BankMovementsPage());
    expect(requireMember).toHaveBeenCalledOnce();
    expect(api).toHaveBeenCalledWith('/api/v1/banking/movements?limit=50');
    expect(screen.getAllByText(/900,719,925,474,099,312,345,678,901/)).toBeTruthy();
    expect(screen.getByText(/Ledger verified/)).toBeTruthy();
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it('distinguishes verified empty history from unavailable history', async () => {
    api.mockResolvedValue({ movements: [] });
    render(await BankMovementsPage());
    expect(screen.getByText(/No verified bank deposits or withdrawals/)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('link', { name: /Back to bank/ }).getAttribute('href')).toBe('/bank');
  });

  it('never invents bank movements on API failure or invalid ledger proof', async () => {
    api.mockRejectedValueOnce(new Error('unavailable'));
    render(await BankMovementsPage());
    expect(screen.getByText(/unavailable/i)).toBeTruthy();
    expect(screen.queryByText(/Ledger verified/)).toBeNull();
    api.mockResolvedValueOnce({ movements: [{ transactionId: 'fake', amountWld: '100' }] });
    cleanup();
    render(await BankMovementsPage());
    expect(screen.getByText(/unavailable/i)).toBeTruthy();
  });
});
