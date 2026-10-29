import { describe, expect, it } from 'vitest';
import { securityEventsCsv } from './csv';

describe('privacy-minimized security event CSV', () => {
  it('writes only the allowlisted event type and ISO timestamp with UTF-8 BOM', () => {
    const csv = securityEventsCsv([{ type: 'local_login_succeeded', createdAt: '2026-10-30T00:01:02.000Z' }]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('event_type,occurred_at_utc');
    expect(csv).toContain('local_login_succeeded,2026-10-30T00:01:02.000Z');
    expect(csv).not.toContain('metadata');
  });
  it('refuses formula-capable, control-character or invalid event types', () => {
    expect(() => securityEventsCsv([{ type: '=1+2', createdAt: '2026-10-30T00:01:02.000Z' }])).toThrow();
    expect(() => securityEventsCsv([{ type: 'login\nprivate', createdAt: '2026-10-30T00:01:02.000Z' }])).toThrow();
  });
});
