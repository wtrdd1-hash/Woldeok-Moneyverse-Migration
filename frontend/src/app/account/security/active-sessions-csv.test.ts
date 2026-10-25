import { describe, expect, it } from 'vitest';
import { activeSessionsCsv } from './active-sessions-csv';

const sample = {
  createdAt: '2026-10-26T00:00:00.000Z', lastSeenAt: '2026-10-26T00:10:00.000Z',
  expiresAt: '2026-11-26T00:00:00.000Z', deviceLabel: 'Windows device',
  current: true, administratorSession: false,
};

const payload = { limit: 100, complete: true, asOf: '2026-10-26T00:20:00.000Z', sessions: [sample] };

describe('active session inventory CSV', () => {
  it('exports safe active-session metadata only and marks the snapshot time', () => {
    const csv = activeSessionsCsv(payload);
    expect(csv).toMatch(/^\uFEFF/);
    expect(csv).toContain('2026-10-26T00:20:00.000Z');
    expect(csv).toContain('Windows device');
    expect(csv).not.toMatch(/sessionId|token|ipAddress|userAgent/);
  });
  it('neutralizes spreadsheet formulas, quotes, control characters and leading whitespace', () => {
    const csv = activeSessionsCsv({ ...payload, sessions: [{ ...sample, deviceLabel: ' \t=HYPERLINK("x","y")\r\n' }] });
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain('\r\n"y"');
    expect(csv).toContain('""x""');
  });
  it('fails closed on incomplete, malformed, oversized and invalid time data', () => {
    expect(() => activeSessionsCsv({ ...payload, complete: false })).toThrow();
    expect(() => activeSessionsCsv({ ...payload, limit: 101 })).toThrow();
    expect(() => activeSessionsCsv({ ...payload, sessions: Array.from({ length: 101 }, () => sample) })).toThrow();
    expect(() => activeSessionsCsv({ ...payload, sessions: [{ ...sample, createdAt: 'tomorrow' }] })).toThrow();
    expect(() => activeSessionsCsv({ ...payload, sessions: [{ ...sample, current: 'yes' }] })).toThrow();
    expect(() => activeSessionsCsv({ ...payload, sessions: [{ ...sample, token: 'secret' }] })).toThrow();
  });
});
