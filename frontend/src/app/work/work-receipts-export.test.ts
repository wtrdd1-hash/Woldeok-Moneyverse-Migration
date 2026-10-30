import { describe, expect, it } from 'vitest';
import { parseWorkReceiptExport, workReceiptCsv } from './work-receipts-export';

const row = {
  receipt_id: '22222222-2222-4222-8222-222222222222',
  assignment_id: '33333333-3333-4333-8333-333333333333',
  code: 'TASK_1', name: '=HYPERLINK("https://example.org", "click")\r\nsecond',
  reward_amount: '9007199254740993', experience_amount: '1',
  transaction_id: null, created_at: '2026-10-30T15:00:00.000Z',
};

describe('work reward receipts CSV', () => {
  it('exports verified owner recent-20 rows with BOM, CRLF, exact WLD and escaped spreadsheet formulas', () => {
    const parsed = parseWorkReceiptExport({ scope: 'recent_20', currency: 'WLD', receipts: [row] });
    expect(parsed).not.toBeNull();
    const csv = workReceiptCsv(parsed!);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('\r\n');
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain('\r\nsecond');
  });

  it('does not turn a malformed or excessive backend response into a downloadable file', () => {
    for (const payload of [
      { receipts: [row] },
      { scope: 'all_time', currency: 'WLD', receipts: [row] },
      { scope: 'recent_20', currency: 'USD', receipts: [row] },
      { scope: 'recent_20', currency: 'WLD', receipts: [{ ...row, reward_amount: '1e10' }] },
      { scope: 'recent_20', currency: 'WLD', receipts: [{ ...row, reward_amount: 1 }] },
      { scope: 'recent_20', currency: 'WLD', receipts: [row, row] },
      { scope: 'recent_20', currency: 'WLD', receipts: Array.from({ length: 21 }, () => row) },
    ]) expect(parseWorkReceiptExport(payload)).toBeNull();
  });
});
