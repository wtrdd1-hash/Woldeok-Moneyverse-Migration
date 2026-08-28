import { describe, expect, it } from 'vitest';
import { requestClientKey, requestPath, tierFor } from './rate-limit';

describe('tierFor', () => {
  it('gives a versioned auth route the tightest tier', () => {
    expect(tierFor('/api/v1/auth/discord/authorize', 'GET')).toEqual({ name: 'auth', limit: 20 });
  });

  it('gives an unversioned auth route the tightest tier too', () => {
    expect(tierFor('/auth/discord/callback', 'GET')).toEqual({ name: 'auth', limit: 20 });
  });

  it('does not mistake a route merely containing the word auth for an auth route', () => {
    expect(tierFor('/api/v1/authors', 'GET').name).toBe('read');
  });

  it('gives a write to the API the sensitive tier', () => {
    expect(tierFor('/api/v1/wallet/transfers', 'POST')).toEqual({ name: 'sensitive', limit: 60 });
  });

  it('treats every non-GET API verb as sensitive', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(tierFor('/api/v1/things/1', method).name).toBe('sensitive');
    }
  });

  it('gives an API read the read tier', () => {
    expect(tierFor('/api/v1/wallet', 'GET')).toEqual({ name: 'read', limit: 240 });
  });

  it('gives a non-API page the read tier', () => {
    expect(tierFor('/health', 'GET')).toEqual({ name: 'read', limit: 240 });
  });
});

describe('requestClientKey', () => {
  // The security-relevant case. Honouring a client-supplied X-Forwarded-For
  // without a proxy that rewrites it lets any client forge a fresh identity
  // per request and evade rate limiting completely.
  it('uses the socket address when the proxy header is not trusted', () => {
    const request = {
      headers: { 'x-forwarded-for': '203.0.113.9' },
      socket: { remoteAddress: '10.0.0.4' },
    };
    expect(requestClientKey(request, { trustForwardedFor: false })).toBe('10.0.0.4');
  });

  it('uses the first forwarded address only when the header is trusted', () => {
    const request = {
      headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
      socket: { remoteAddress: '10.0.0.4' },
    };
    expect(requestClientKey(request, { trustForwardedFor: true })).toBe('203.0.113.9');
  });

  it('handles a repeated header arriving as an array', () => {
    const request = {
      headers: { 'x-forwarded-for': ['203.0.113.9', '198.51.100.7'] },
      socket: { remoteAddress: '10.0.0.4' },
    };
    expect(requestClientKey(request, { trustForwardedFor: true })).toBe('203.0.113.9');
  });

  it('falls back to the socket address when a trusted header is absent', () => {
    const request = { headers: {}, socket: { remoteAddress: '10.0.0.4' } };
    expect(requestClientKey(request, { trustForwardedFor: true })).toBe('10.0.0.4');
  });

  it('falls back to the socket address when a trusted header is empty', () => {
    const request = { headers: { 'x-forwarded-for': '  ' }, socket: { remoteAddress: '10.0.0.4' } };
    expect(requestClientKey(request, { trustForwardedFor: true })).toBe('10.0.0.4');
  });

  it('returns a stable placeholder when no address is available', () => {
    const request = { headers: {}, socket: {} };
    expect(requestClientKey(request, { trustForwardedFor: false })).toBe('unknown');
  });
});

describe('tierFor, on the reads a page makes every time', () => {
  it('does not spend the auth budget on the viewer lookup', () => {
    // The masthead asks once per page load. At the auth tier's twenty a
    // minute a reader who refreshed ten times was locked out of the whole
    // API, and the front end read that as a lost session.
    expect(tierFor('/api/v1/auth/viewer', 'GET')).toEqual({ name: 'read', limit: 240 });
    expect(tierFor('/auth/viewer', 'GET')).toEqual({ name: 'read', limit: 240 });
  });

  it('does not spend it on the session read either', () => {
    // Every member page opens with this, and every write fetches a CSRF
    // token from it.
    expect(tierFor('/api/v1/auth/session', 'GET')).toEqual({ name: 'read', limit: 240 });
  });

  it('still guards the routes that create sessions and reach a provider', () => {
    expect(tierFor('/api/v1/auth/discord/authorize', 'GET').name).toBe('auth');
    expect(tierFor('/api/v1/auth/google/callback', 'GET').name).toBe('auth');
    expect(tierFor('/api/v1/auth/logout', 'POST').name).toBe('auth');
    // A write to the session route is not the cheap read.
    expect(tierFor('/api/v1/auth/session', 'DELETE').name).toBe('auth');
  });

  it('is not fooled by a path that merely starts the same way', () => {
    expect(tierFor('/api/v1/auth/viewers', 'GET').name).toBe('auth');
    expect(tierFor('/api/v1/auth/session/extend', 'GET').name).toBe('auth');
  });
});

describe('requestPath', () => {
  it('prefers the original url, which survives a global prefix', () => {
    expect(requestPath({ originalUrl: '/api/v1/stocks', url: '/stocks' })).toBe('/api/v1/stocks');
  });

  it('drops the query, which says nothing about what a route costs', () => {
    expect(requestPath({ originalUrl: '/api/v1/stocks/x/candles?interval=60' })).toBe(
      '/api/v1/stocks/x/candles',
    );
  });

  it('falls back to url, then to root', () => {
    expect(requestPath({ url: '/health' })).toBe('/health');
    expect(requestPath({})).toBe('/');
  });
});
