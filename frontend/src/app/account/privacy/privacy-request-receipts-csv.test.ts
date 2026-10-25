import { describe, expect, it } from 'vitest';
import { privacyRequestReceiptsCsv } from './privacy-request-receipts-csv';

const ID = '22222222-2222-4222-8222-222222222222';
const record = { requestId: ID, requestType: 'access', status: 'received', detail: '=HYPERLINK("https://evil.invalid")', createdAt: '2026-10-26T00:00:00.000Z' };
const snapshot = (requests: unknown[]) => ({ scope: 'recent_intake_receipts', limit: 30, requests });

describe('owner privacy intake CSV', () => {
  it('quotes dangerous formulas, preserves the intake-only semantics and UTF-8 BOM', () => {
    const csv = privacyRequestReceiptsCsv(snapshot([record]));
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('request_id,request_type,status,created_at,detail');
    expect(csv).toContain('"\'=HYPERLINK(');
    expect(csv).toContain(ID);
  });

  it('neutralizes zero-width-prefixed spreadsheet formulas and control separators', () => {
    const csv = privacyRequestReceiptsCsv(snapshot([{ ...record, detail: '\u200B=1+1\u2028next' }]));
    expect(csv).toContain('"\'=1+1 next"');
  });

  it('rejects unverified scope, excessive rows, duplicates, malformed date, unsupported status and unbounded detail', () => {
    expect(() => privacyRequestReceiptsCsv({ ...snapshot([]), scope: 'all_history' })).toThrow();
    expect(() => privacyRequestReceiptsCsv(snapshot(Array(31).fill(record)))).toThrow();
    expect(() => privacyRequestReceiptsCsv(snapshot([record, record]))).toThrow();
    expect(() => privacyRequestReceiptsCsv(snapshot([{ ...record, createdAt: 'not-a-date' }]))).toThrow();
    expect(() => privacyRequestReceiptsCsv(snapshot([{ ...record, status: 'completed' }]))).toThrow();
    expect(() => privacyRequestReceiptsCsv(snapshot([{ ...record, detail: 'a'.repeat(1001) }]))).toThrow();
  });

  it('rejects foreign/unrecognized fields instead of silently leaking them', () => {
    expect(() => privacyRequestReceiptsCsv(snapshot([{ ...record, userId: 'other' }]))).toThrow();
  });
});
