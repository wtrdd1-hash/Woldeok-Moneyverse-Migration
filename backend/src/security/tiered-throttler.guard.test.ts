import { describe, expect, it, vi } from 'vitest';
import { TieredThrottlerGuard } from './tiered-throttler.guard';
import type { AppConfig } from '../core/config';

type Guard = TieredThrottlerGuard & {
  handleRequest: (request: unknown) => Promise<boolean>;
  getTracker: (req: Record<string, unknown>) => Promise<string>;
};

function guardWith(trustForwardedFor: boolean): { guard: Guard; counted: string[] } {
  const counted: string[] = [];
  const options = { throttlers: [] } as never;
  const storage = { increment: vi.fn(), getRecord: vi.fn() } as never;
  const reflector = { get: () => undefined, getAllAndOverride: () => undefined } as never;
  const config = { trustProxyForwardedFor: trustForwardedFor } as AppConfig;

  const guard = new TieredThrottlerGuard(options, storage, reflector, config) as Guard;
  // Stand in for the base class, which would reach the storage service. What
  // matters here is only whether it was reached at all.
  Object.getPrototypeOf(Object.getPrototypeOf(guard)).handleRequest = async (
    request: { throttler: { name: string } },
  ) => {
    counted.push(request.throttler.name);
    return true;
  };
  return { guard, counted };
}

const contextFor = (req: Record<string, unknown>) => ({
  switchToHttp: () => ({ getRequest: () => req, getResponse: () => ({}) }),
});

const requestFor = (name: string, req: Record<string, unknown>) => ({
  context: contextFor(req) as never,
  throttler: { name } as never,
  limit: 0,
  ttl: 0,
  blockDuration: 0,
  getTracker: (() => '') as never,
  generateKey: (() => '') as never,
});

describe('TieredThrottlerGuard', () => {
  it('counts a request against one budget, not all three', async () => {
    // The bug: every configured throttler ran against every route, so the
    // tightest of the three governed everything and a public listing meant
    // to allow 240 a minute stopped at 20.
    const { guard, counted } = guardWith(true);
    const req = { originalUrl: '/api/v1/announcements', method: 'GET' };

    for (const name of ['auth', 'sensitive', 'read']) {
      await guard.handleRequest(requestFor(name, req));
    }

    expect(counted).toEqual(['read']);
  });

  it('sends a write to the sensitive budget alone', async () => {
    const { guard, counted } = guardWith(true);
    const req = { originalUrl: '/api/v1/wallet/transfers', method: 'POST' };

    for (const name of ['auth', 'sensitive', 'read']) {
      await guard.handleRequest(requestFor(name, req));
    }

    expect(counted).toEqual(['sensitive']);
  });

  it('keeps the auth budget for the routes that create a session', async () => {
    const { guard, counted } = guardWith(true);
    const req = { originalUrl: '/api/v1/auth/discord/callback?code=x', method: 'GET' };

    for (const name of ['auth', 'sensitive', 'read']) {
      await guard.handleRequest(requestFor(name, req));
    }

    expect(counted).toEqual(['auth']);
  });

  it('counts the visitor rather than the proxy in front of them', async () => {
    // Every request arrives from the Next.js container, so the socket address
    // is one shared allowance for the whole site.
    const { guard } = guardWith(true);
    const tracker = await guard.getTracker({
      headers: { 'cf-connecting-ip': '203.0.113.9', 'x-forwarded-for': '198.51.100.7, 203.0.113.9' },
      socket: { remoteAddress: '192.168.32.3' },
    });
    expect(tracker).toBe('203.0.113.9');
  });

  it('ignores the forwarded header when no proxy is trusted', async () => {
    // Trusting it without a proxy that rewrites it lets a caller forge their
    // way out of the limit entirely.
    const { guard } = guardWith(false);
    const tracker = await guard.getTracker({
      headers: { 'x-forwarded-for': '203.0.113.9' },
      socket: { remoteAddress: '192.168.32.3' },
    });
    expect(tracker).toBe('192.168.32.3');
  });
});
