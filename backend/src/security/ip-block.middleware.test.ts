import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { ipBlockGate } from './ip-block.middleware';

const request = {
  method: 'GET', originalUrl: '/api/v1/shop/holdings',
  headers: {}, socket: { remoteAddress: '203.0.113.9' },
} as unknown as Request;

function responseStub() {
  const headers = new Map<string, string>();
  const response = {
    setHeader: vi.fn((key: string, value: string) => { headers.set(key.toLowerCase(), value); }),
    status: vi.fn().mockReturnThis(), type: vi.fn().mockReturnThis(), send: vi.fn(),
  } as unknown as Response;
  return { response, headers };
}

describe('IP deny response privacy', () => {
  it('overrides permissive cache and indexing headers on a blocked address', async () => {
    const { response, headers } = responseStub();
    headers.set('cache-control', 'public, max-age=3600');
    headers.set('x-robots-tag', 'index');
    const next = vi.fn();
    const pool = { query: vi.fn().mockResolvedValue({ rows: [{ blocked: true }] }) };
    ipBlockGate({ pool: pool as never, trustForwardedFor: false })(request, response, next);
    await vi.waitFor(() => expect(response.send).toHaveBeenCalledTimes(1));
    expect(headers.get('cache-control')).toBe('private, no-store');
    expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not add denial headers when the address is allowed', async () => {
    const { response } = responseStub();
    const next = vi.fn();
    const pool = { query: vi.fn().mockResolvedValue({ rows: [{ blocked: false }] }) };
    ipBlockGate({ pool: pool as never, trustForwardedFor: false })(request, response, next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1));
    expect(response.setHeader).not.toHaveBeenCalled();
    expect(response.send).not.toHaveBeenCalled();
  });
});
