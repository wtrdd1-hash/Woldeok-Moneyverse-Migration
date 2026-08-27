import { describe, expect, it } from 'vitest';
import {
  authorizationUrl,
  createOAuthChallenge,
  pkceChallenge,
  randomToken,
  sha256,
} from './crypto';

describe('sha256', () => {
  it('produces a stable lowercase hex digest', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('randomToken', () => {
  it('produces a base64url token long enough for the session length checks', () => {
    const token = randomToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('does not repeat', () => {
    expect(randomToken()).not.toBe(randomToken());
  });
});

describe('pkceChallenge', () => {
  // A fixed vector. If the digest encoding ever silently changes from
  // base64url to base64, this is what catches it — base64 would produce
  // '+' and '/' characters that a URL query would then re-encode.
  it('is the base64url SHA-256 of the verifier', () => {
    expect(pkceChallenge('verifier')).toBe('iMnq5o6zALKXGivsnlom_0F5_WYda32GHkxlV7mq7hQ');
  });

  it('never emits a character that needs URL escaping', () => {
    expect(pkceChallenge('verifier')).not.toMatch(/[+/=]/);
  });
});

describe('createOAuthChallenge', () => {
  it('hashes the state and nonce rather than storing them in the clear', () => {
    const challenge = createOAuthChallenge('discord', 'https://example.com/auth/discord/callback');
    expect(challenge.stateHash).toBe(sha256(challenge.state));
    expect(challenge.nonceHash).toBe(sha256(challenge.nonce));
  });

  it('derives the code challenge from the verifier', () => {
    const challenge = createOAuthChallenge('google', 'https://example.com/auth/google/callback');
    expect(challenge.codeChallenge).toBe(pkceChallenge(challenge.codeVerifier));
  });

  it('uses a distinct random value for state, verifier and nonce', () => {
    const challenge = createOAuthChallenge('discord', 'https://example.com/auth/discord/callback');
    expect(new Set([challenge.state, challenge.codeVerifier, challenge.nonce]).size).toBe(3);
  });
});

describe('authorizationUrl', () => {
  it('requests S256 PKCE from Discord with the identify scope', () => {
    const challenge = createOAuthChallenge('discord', 'https://example.com/auth/discord/callback');
    const url = new URL(authorizationUrl('discord', challenge, 'client-id'));
    expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize');
    expect(url.searchParams.get('scope')).toBe('identify');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('nonce')).toBeNull();
  });

  it('sends a nonce to Google and requests openid profile', () => {
    const challenge = createOAuthChallenge('google', 'https://example.com/auth/google/callback');
    const url = new URL(authorizationUrl('google', challenge, 'client-id'));
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('scope')).toBe('openid profile');
    expect(url.searchParams.get('nonce')).toBe(challenge.nonce);
  });

  // The code verifier is the secret half of PKCE. It stays server-side; only
  // its hash travels in the authorization request.
  it('never puts the code verifier in the authorization URL', () => {
    const challenge = createOAuthChallenge('discord', 'https://example.com/auth/discord/callback');
    const url = authorizationUrl('discord', challenge, 'client-id');
    expect(url).not.toContain(challenge.codeVerifier);
    expect(url).toContain(encodeURIComponent(challenge.codeChallenge));
  });

  it('sends the state so the callback can be bound to this challenge', () => {
    const challenge = createOAuthChallenge('discord', 'https://example.com/auth/discord/callback');
    const url = new URL(authorizationUrl('discord', challenge, 'client-id'));
    expect(url.searchParams.get('state')).toBe(challenge.state);
  });
});
