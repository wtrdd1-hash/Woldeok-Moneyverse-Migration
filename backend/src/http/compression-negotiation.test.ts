import { describe, expect, it, vi } from 'vitest';
import { inflateSync, gunzipSync } from 'node:zlib';
import type { Request, Response } from 'express';
import { responseCompression } from './compression.middleware';

function exercise(acceptEncoding: string, vary?: string) {
  const headers = new Map<string, string>([['content-type', 'application/json']]);
  if (vary) headers.set('vary', vary);
  const request = { method: 'GET', headers: { 'accept-encoding': acceptEncoding } } as unknown as Request;
  let sent: unknown;
  const response = {
    statusCode: 200,
    getHeader: (name: string) => headers.get(name.toLowerCase()),
    setHeader: (name: string, value: string) => { headers.set(name.toLowerCase(), value); },
    removeHeader: (name: string) => { headers.delete(name.toLowerCase()); },
    send: (body: unknown) => { sent = body; return response; },
    json: vi.fn(),
  } as unknown as Response;
  responseCompression()(request, response, vi.fn());
  const original = JSON.stringify({ data: 'x'.repeat(2000) });
  response.send(original);
  return { headers, sent, original };
}

describe('HTTP response compression negotiation and cache variation', () => {
  it('does not select gzip when the client explicitly assigns it q=0', () => {
    const { headers, sent, original } = exercise('gzip;q=0, deflate;q=1');
    expect(headers.get('content-encoding')).toBe('deflate');
    expect(inflateSync(sent as Buffer).toString('utf8')).toBe(original);
  });

  it('leaves payload uncompressed when both supported encodings are forbidden', () => {
    const { headers, sent, original } = exercise('gzip;q=0, deflate;q=0');
    expect(headers.get('content-encoding')).toBeUndefined();
    expect(sent).toBe(original);
  });

  it('preserves the CORS Origin cache key while adding Accept-Encoding', () => {
    const { headers, sent, original } = exercise('gzip', 'Origin');
    expect(headers.get('vary')).toBe('Origin, Accept-Encoding');
    expect(gunzipSync(sent as Buffer).toString('utf8')).toBe(original);
  });

  it('keeps Vary wildcard without narrowing the cache policy', () => {
    const { headers } = exercise('gzip', '*');
    expect(headers.get('vary')).toBe('*');
  });

  it('respects a preferred deflate quality over a lower gzip quality', () => {
    const { headers } = exercise('gzip;q=0.2, deflate;q=0.8');
    expect(headers.get('content-encoding')).toBe('deflate');
  });

  it('uses wildcard for an unlisted supported encoding but honors explicit gzip refusal', () => {
    const { headers } = exercise('gzip;q=0, *;q=1');
    expect(headers.get('content-encoding')).toBe('deflate');
  });

  it('does not duplicate an existing Accept-Encoding cache variation', () => {
    const { headers } = exercise('GZIP;Q=1', 'Origin, accept-encoding');
    expect(headers.get('content-encoding')).toBe('gzip');
    expect(headers.get('vary')).toBe('Origin, accept-encoding');
  });

  it('rejects invalid quality values rather than accidentally compressing', () => {
    const { headers, sent, original } = exercise('gzip;q=9, deflate;q=0');
    expect(headers.get('content-encoding')).toBeUndefined();
    expect(sent).toBe(original);
  });

});
