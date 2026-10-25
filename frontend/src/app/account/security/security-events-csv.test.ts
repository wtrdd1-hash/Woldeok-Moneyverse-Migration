import { describe, expect, it } from 'vitest';
import { securityEventsCsv } from './security-events-csv';

describe('security events CSV export', () => {
  it('uses only type and timestamp, without secrets, tokens, IPs, or device labels', () => {
    const csv = securityEventsCsv([{ type: 'local_login_succeeded', createdAt: '2026-10-26T00:00:00.000Z', ip: '1.2.3.4', token: 'secret' }]);
    expect(csv).toContain('local_login_succeeded');
    expect(csv).not.toContain('1.2.3.4');
    expect(csv).not.toContain('secret');
    expect(csv).toMatch(/^\uFEFF/);
  });

  it('rejects formula injection and malformed events rather than exporting them', () => {
    expect(() => securityEventsCsv([{ type: '=HYPERLINK("bad")', createdAt: '2026-10-26T00:00:00.000Z' }])).toThrow();
    expect(() => securityEventsCsv([{ type: 'local_login_succeeded', createdAt: 'yesterday' }])).toThrow();
    expect(() => securityEventsCsv(Array.from({ length: 51 }, () => ({ type: 'local_login_succeeded', createdAt: '2026-10-26T00:00:00.000Z' })))).toThrow();
  });

  it('renders a valid header-only CSV for no security events', () => {
    expect(securityEventsCsv([])).toContain('Event type');
  });
});
