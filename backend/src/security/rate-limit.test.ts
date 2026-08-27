import { describe, expect, it } from 'vitest';
import { requestClientKey, tierFor } from './rate-limit';

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
