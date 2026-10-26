import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { dynamicEtag } from './etag.middleware';

type HeaderValue = string | string[] | number;

function execute(options: {
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, HeaderValue>;
  method?: string;
  body?: string;
}) {
  const headers = new Map<string, HeaderValue>(
    Object.entries(options.responseHeaders ?? {}).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const request = {
    method: options.method ?? 'GET',
    headers: options.requestHeaders ?? {},
  } as unknown as Request;
  const sent = vi.fn();
  const end = vi.fn();
  const response = {
    statusCode: 200,
    getHeader: (key: string) => headers.get(key.toLowerCase()),
    setHeader: (key: string, value: HeaderValue) => headers.set(key.toLowerCase(), value),
    removeHeader: (key: string) => headers.delete(key.toLowerCase()),
    send: sent,
    end,
    status(code: number) { this.statusCode = code; return this; },
  } as unknown as Response;
  const next = vi.fn();
  dynamicEtag()(request, response, next);
  response.send(options.body ?? 'private response');
  return { response, headers, sent, end, next };
}

describe('dynamic ETag private response isolation', () => {
  it.each(['no-store', 'max-age=0, NO-STORE', 'private, max-age=60'])
  ('never converts Cache-Control: %s to a bodyless 304', (cacheControl) => {
    const result = execute({
      requestHeaders: { 'if-none-match': '*' },
      responseHeaders: { 'Cache-Control': cacheControl },
    });
    expect(result.response.statusCode).toBe(200);
    expect(result.sent).toHaveBeenCalledWith('private response');
    expect(result.end).not.toHaveBeenCalled();
    expect(result.headers.has('etag')).toBe(false);
  });

  it.each(['cookie', 'authorization'])('does not create a shared validator for %s requests', (header) => {
    const result = execute({ requestHeaders: { [header]: 'sensitive-value', 'if-none-match': '*' } });
    expect(result.response.statusCode).toBe(200);
    expect(result.sent).toHaveBeenCalledWith('private response');
    expect(result.headers.has('etag')).toBe(false);
  });

  it('does not create a validator when a response sets session cookies', () => {
    const result = execute({
      requestHeaders: { 'if-none-match': '*' },
      responseHeaders: { 'Set-Cookie': ['session=rotated; HttpOnly'] },
    });
    expect(result.response.statusCode).toBe(200);
    expect(result.sent).toHaveBeenCalledWith('private response');
    expect(result.headers.has('etag')).toBe(false);
  });

  it('keeps public GET conditional caching functional', () => {
    const result = execute({
      requestHeaders: { 'if-none-match': '*' },
      responseHeaders: { 'Cache-Control': 'public, max-age=60' },
      body: 'public resource',
    });
    expect(result.response.statusCode).toBe(304);
    expect(result.end).toHaveBeenCalledOnce();
    expect(result.headers.get('etag')).toMatch(/^W\//);
  });
});
