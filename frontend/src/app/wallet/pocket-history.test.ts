import { describe, expect, it } from 'vitest';
import { pocketHistoryHref, selectedPocket, selectedPocketDelta } from './pocket-history';
import type { TransactionView } from './sides';

const transfer: TransactionView = {
  transactionId: '22222222-2222-4222-8222-222222222222',
  type: 'BANK_DEPOSIT', label: 'Bank deposit',
  netAmount: '0', cashDelta: '-2500', bankDelta: '2500', direction: 'neutral',
  occurredAt: '2026-10-24T00:00:00Z',
};

describe('wallet pocket history browser controls', () => {
  it('uses strict pocket choices and safe canonical filter links', () => {
    expect(selectedPocket(undefined)).toBe('all');
    expect(selectedPocket('cash')).toBe('cash');
    expect(selectedPocket('bank')).toBe('bank');
    expect(selectedPocket('BANK')).toBeNull();
    expect(selectedPocket('cash%26other')).toBeNull();
    expect(pocketHistoryHref('all')).toBe('/wallet/activity');
    expect(pocketHistoryHref('cash')).toBe('/wallet/activity?pocket=cash');
    expect(pocketHistoryHref('bank')).toBe('/wallet/activity?pocket=bank');
  });

  it('shows the signed pocket movement for an internal transfer, not misleading net zero', () => {
    expect(selectedPocketDelta(transfer, 'cash')).toBe('-2500');
    expect(selectedPocketDelta(transfer, 'bank')).toBe('2500');
    expect(selectedPocketDelta(transfer, 'all')).toBe('0');
  });

  it('fails closed for missing, inconsistent or noncanonical pocket deltas', () => {
    expect(selectedPocketDelta({ ...transfer, cashDelta: undefined }, 'cash')).toBeNull();
    expect(selectedPocketDelta({ ...transfer, bankDelta: '2501' }, 'bank')).toBeNull();
    expect(selectedPocketDelta({ ...transfer, cashDelta: '01' }, 'cash')).toBeNull();
  });
});
