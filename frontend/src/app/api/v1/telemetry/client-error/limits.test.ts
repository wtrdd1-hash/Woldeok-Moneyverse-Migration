import { describe, expect, it } from 'vitest';
import { POST } from './route';
import { allowTelemetry } from '@/lib/telemetry-rate-limit';

const req = (body: string, ip: string) => new Request('http://localhost/api/v1/telemetry/client-error', {
  method: 'POST', headers: { origin: 'http://localhost', 'x-real-ip': ip, 'content-type': 'application/json' }, body,
});

describe('telemetry limits (independent review 2026-11-25)', () => {
  it('refuses an oversized body by bytes, multi-byte text included', async () => {
    expect((await POST(req(JSON.stringify({ errorMessage: '가'.repeat(3000) }), '10.0.0.1') as never)).status).toBe(413);
  });
  it('rate-limits one client to 20 lines a minute', () => {
    const now = 1_000_000;
    const results = Array.from({ length: 22 }, () => allowTelemetry('10.9.9.9', now));
    expect(results.filter(Boolean).length).toBe(20);
    expect(allowTelemetry('10.9.9.9', now + 60_001)).toBe(true);
  });
});
