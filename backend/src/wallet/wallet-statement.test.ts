import { describe, expect, it } from 'vitest';
import { wldAmount } from '@moneyverse/contract';
import type { WalletTransactionView } from './wallet.service';
import { walletStatementCsv } from './wallet-statement';
import { WalletController } from './wallet.controller';
import type { WalletService } from './wallet.service';
import type { RequestWithSession } from '../auth/session.context';
import { vi } from 'vitest';

const HUGE = '90071992547409931234567890123456789012345678901234567890';
const row = (overrides: Partial<WalletTransactionView> = {}): WalletTransactionView => ({
  transactionId: '11111111-1111-4111-8111-111111111111',
  type: 'BANK_DEPOSIT',
  label: '은행 입금',
  netAmount: wldAmount('0', 'net'),
  cashDelta: wldAmount('-2500', 'cash'),
  bankDelta: wldAmount('2500', 'bank'),
  direction: 'neutral',
  occurredAt: '2026-10-25T00:00:00.000Z',
  ...overrides,
});

describe('owner wallet recent CSV statement', () => {
  it('identifies the bounded recent scope, has a BOM, and preserves both pockets', () => {
    const csv = walletStatementCsv([row()]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('recent 50');
    expect(csv).toContain('cash_delta_wld');
    expect(csv).toContain('"-2500","2500"');
    expect(csv).toContain('2026-10-25T00:00:00.000Z');
  });

  it('retains huge signed integer strings and does not coerce to Number', () => {
    const csv = walletStatementCsv([row({
      netAmount: wldAmount('-' + HUGE, 'net'),
      cashDelta: wldAmount('-' + HUGE, 'cash'),
      bankDelta: wldAmount('0', 'bank'),
    })]);
    expect(csv).toContain(HUGE);
    expect(csv).not.toContain('e+');
    expect(csv).not.toContain('Infinity');
  });

  it('escapes CSV injection, C0/C1 controls, quotes and newlines', () => {
    const csv = walletStatementCsv([row({ label: '\u0085\r\n=HYPERLINK("https://bad.invalid")' })]);
    expect(csv).not.toContain('\u0085');
    expect(csv).not.toContain('\r\n=HYPERLINK');
    expect(csv).not.toContain('"=HYPERLINK');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('""https://bad.invalid""');
  });

  it('neutralizes invisible format characters before spreadsheet formula triggers', () => {
    const csv = walletStatementCsv([row({ label: '\u200B=SUM(1,1)' })]);
    expect(csv).not.toContain('\u200B');
    expect(csv).toContain("'=SUM(1,1)");
  });

  it('uses only the authenticated session actor for the bounded read', async () => {
    const overview = vi.fn(async () => ({ recentTransactions: [row()] }));
    const controller = new WalletController({ overview } as unknown as WalletService);
    const request = { session: { user_id: '22222222-2222-4222-8222-222222222222' } } as RequestWithSession;
    const csv = await controller.statementCsv(request);
    expect(overview).toHaveBeenCalledExactlyOnceWith('22222222-2222-4222-8222-222222222222', { recentLimit: 50 });
    expect(csv).toContain('은행 입금');
    await expect(controller.statementCsv({} as RequestWithSession)).rejects.toThrow(/session/);
    await expect(new WalletController(null).statementCsv(request)).rejects.toThrow(/unavailable/);
  });

  it('fails closed on missing or noncanonical pocket projection', () => {
    expect(() => walletStatementCsv([row({ cashDelta: undefined })])).toThrow(/pocket/i);
    expect(() => walletStatementCsv([row({ netAmount: '01' as WalletTransactionView['netAmount'] })])).toThrow(/canonical/i);
  });

  it('rejects unbounded server input and handles empty ledger without fake entries', () => {
    expect(() => walletStatementCsv(Array.from({ length: 51 }, () => row()))).toThrow(/50/);
    expect(walletStatementCsv([])).not.toContain('11111111-1111');
  });
});
