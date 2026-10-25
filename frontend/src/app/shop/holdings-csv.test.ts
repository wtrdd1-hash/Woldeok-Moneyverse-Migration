import { describe, expect, it } from 'vitest';
import { exportHoldingsCsv } from './holdings-csv';

const row = {
  catalog_id: '00000000-0000-4000-8000-000000000001',
  code: 'repair_kit',
  name: '수리 키트',
  category: 'utility',
  quantity: 3,
  acquired_at: '2026-10-25T07:00:00.000Z',
  expires_at: null,
  is_equipped: false,
  serial_number: null,
};

describe('verified shop holdings CSV', () => {
  it('includes an owner holding without rounding or invented purchases', () => {
    const csv = exportHoldingsCsv([row]);
    expect(csv).toContain('수리 키트');
    expect(csv).toContain('"3"');
    expect(csv).toContain('2026-10-25T07:00:00.000Z');
    expect(csv).not.toContain('WLD');
  });

  it('escapes spreadsheet formula injection even with whitespace prefixes', () => {
    const csv = exportHoldingsCsv([{ ...row, name: '  =HYPERLINK("https://evil.invalid")' }]);
    expect(csv).toContain("'  =HYPERLINK");
    expect(csv).toContain('""https://evil.invalid""');
  });

  it('fails closed on corrupt or partial API data', () => {
    expect(() => exportHoldingsCsv([{ ...row, quantity: -1 }])).toThrow();
    expect(() => exportHoldingsCsv([{ ...row, quantity: 1.5 }])).toThrow();
    expect(() => exportHoldingsCsv([{ ...row, catalog_id: 'not-a-uuid' }])).toThrow();
    expect(() => exportHoldingsCsv(null)).toThrow();
  });

  it('does not silently truncate an excessive result set', () => {
    expect(() => exportHoldingsCsv(Array(5001).fill(row))).toThrow();
  });
});
