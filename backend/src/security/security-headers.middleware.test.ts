import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { securityHeaders } from './security-headers.middleware';

describe('securityHeaders middleware', () => {
  it('injects all required enterprise security headers', () => {
    const middleware = securityHeaders({ isProduction: true });
    const headers = new Map<string, string>();

    const req = {} as Request;
    const res = {
      setHeader: vi.fn((key: string, value: string) => {
        headers.set(key.toLowerCase(), value);
      }),
    } as unknown as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('permissions-policy')).toBe('camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    expect(headers.get('cross-origin-opener-policy')).toBe('same-origin');
    expect(headers.get('x-xss-protection')).toBe('0');
    expect(headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
  });

  it('omits HSTS header in non-production local development', () => {
    const middleware = securityHeaders({ isProduction: false });
    const headers = new Map<string, string>();

    const req = {} as Request;
    const res = {
      setHeader: vi.fn((key: string, value: string) => {
        headers.set(key.toLowerCase(), value);
      }),
    } as unknown as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.has('strict-transport-security')).toBe(false);
  });
});
