import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ledgerCsvContent } from './export-ledger-csv';
import { pocketBreakdown, postingAmount, sides, type TransactionView } from './sides';

const HUGE = '90071992547409931234567890123456789012';
const entry = (overrides: Partial<TransactionView> = {}): TransactionView => ({
  transactionId: '22222222-2222-4222-8222-222222222222',
  type: 'BANK_DEPOSIT',
  label: 'Bank deposit',
  netAmount: '0',
  cashDelta: '-2500',
  bankDelta: '2500',
  direction: 'neutral',
  occurredAt: '2026-10-21T00:00:00.000Z',
  ...overrides,
});

describe('owner-scoped wallet pocket movement', () => {
  it('shows a zero-net bank deposit as a real cash-to-bank movement', () => {
    expect(sides(entry())).toEqual({ debit: '활동 지갑', credit: '은행 보관함' });
    expect(postingAmount(entry())).toBe('2500');
    expect(pocketBreakdown(entry())).toEqual({ cashDelta: '-2500', bankDelta: '2500' });
  });

  it('shows a bank withdrawal in the opposite direction', () => {
    const withdrawal = entry({ type: 'BANK_WITHDRAW', cashDelta: '2500', bankDelta: '-2500' });
    expect(sides(withdrawal)).toEqual({ debit: '은행 보관함', credit: '활동 지갑' });
    expect(postingAmount(withdrawal)).toBe('2500');
  });

  it('does not fabricate unavailable or inconsistent pocket amounts', () => {
    expect(pocketBreakdown(entry({ cashDelta: undefined }))).toBeNull();
    expect(pocketBreakdown(entry({ bankDelta: '2499' }))).toBeNull();
    expect(sides(entry({ cashDelta: undefined }))).toEqual({ debit: 'Bank deposit', credit: '내 지갑' });
  });

  it('preserves exact 38-digit signed integer strings', () => {
    const large = entry({ cashDelta: '-' + HUGE, bankDelta: HUGE });
    expect(pocketBreakdown(large)).toEqual({ cashDelta: '-' + HUGE, bankDelta: HUGE });
    expect(postingAmount(large)).toBe(HUGE);
  });

  it('rejects noncanonical, fractional and 39-digit pocket fields', () => {
    for (const invalid of ['01', '1.5', '-0', '9'.repeat(39)]) {
      expect(pocketBreakdown(entry({ cashDelta: invalid }))).toBeNull();
    }
  });
});

describe('bounded wallet CSV export', () => {
  it('includes signed net, cash and bank columns without duplicate signs', () => {
    const csv = ledgerCsvContent([
      entry({ cashDelta: '-' + HUGE, bankDelta: HUGE }),
      entry({ netAmount: '-2500', cashDelta: '-2500', bankDelta: '0', direction: 'out' }),
    ], true);
    expect(csv).toContain('Cash delta (WLD)');
    expect(csv).toContain('Bank delta (WLD)');
    expect(csv).toContain(HUGE);
    expect(csv).not.toContain('--2500');
    expect(csv).not.toContain('+0');
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('neutralizes spreadsheet formulas and newlines in untrusted descriptions', () => {
    const csv = ledgerCsvContent([entry({ label: ' \r\n=HYPERLINK("https://example.invalid")' })], true);
    expect(csv).not.toContain('\r\n=HYPERLINK');
    expect(csv).not.toContain('"=HYPERLINK');
    expect(csv).toContain("'=HYPERLINK");
  });

  it('marks legacy pocket projections as unavailable, never zero', () => {
    const csv = ledgerCsvContent([entry({ cashDelta: undefined, bankDelta: undefined })], true);
    expect(csv).toContain('"Unavailable"');
  });

  it('rejects noncanonical net amount instead of rounding', () => {
    expect(() => ledgerCsvContent([entry({ netAmount: '01' })], true)).toThrow(/amount|canonical/i);
  });
});


describe('wallet posting display integrity', () => {
  it('wires both wallet views to the verified pocket amount', () => {
    for (const path of ['./page.tsx', './activity/page.tsx']) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8');
      expect(source).toContain('postingAmount(entry)');
      expect(source).not.toContain('amount={entry.netAmount}');
    }
  });

  it('never substitutes zero when owner pocket evidence is absent or contradictory', () => {
    expect(postingAmount(entry({ cashDelta: undefined }))).toBeNull();
    expect(postingAmount(entry({ bankDelta: '2499' }))).toBeNull();
    expect(postingAmount(entry({ netAmount: '2500', cashDelta: '2000', bankDelta: '100' }))).toBeNull();
    expect(postingAmount(entry({ netAmount: '01' }))).toBeNull();
    expect(postingAmount(entry({ cashDelta: '0', bankDelta: '0' }))).toBe('0');
    expect(postingAmount(entry({ netAmount: '-2500', cashDelta: undefined, bankDelta: undefined }))).toBe('2500');
  });
});
