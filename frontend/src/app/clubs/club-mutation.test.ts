import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clubMutation } from './club-mutation';

const token = 'a'.repeat(43);
const session = (csrfToken: unknown = token, status = 200) => new Response(
  JSON.stringify({ csrfToken }), { status, headers: { 'content-type': 'application/json' } },
);
afterEach(() => vi.unstubAllGlobals());

describe('club browser mutation current-session CSRF', () => {
  it('fetches a fresh session token and forwards same-origin credentials, method and JSON body', async () => {
    const spy = vi.fn().mockResolvedValueOnce(session()).mockResolvedValueOnce(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', spy);
    const body = JSON.stringify({ role: 'member' });
    const response = await clubMutation('/api/v1/clubs/club-id/members/member-id/role', {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body,
    });
    expect(response.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0]).toEqual(['/app-api/v1/auth/session', {
      credentials: 'same-origin', cache: 'no-store', redirect: 'error',
    }]);
    expect(spy.mock.calls[1]![0]).toBe('/api/v1/clubs/club-id/members/member-id/role');
    const init = spy.mock.calls[1]![1] as RequestInit;
    expect(init).toMatchObject({ method: 'PATCH', body, credentials: 'same-origin', cache: 'no-store', redirect: 'error' });
    expect(new Headers(init.headers).get('x-csrf-token')).toBe(token);
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
  });

  it('refuses to send any mutation when the session is missing, failed or malformed', async () => {
    for (const reply of [session('', 200), session(null), session('short'), session(token, 401), session(token, 503)]) {
      const spy = vi.fn().mockResolvedValue(reply);
      vi.stubGlobal('fetch', spy);
      await expect(clubMutation('/api/v1/clubs/x/join', { method: 'POST' })).rejects.toThrow(/csrf|session/i);
      expect(spy).toHaveBeenCalledTimes(1);
    }
  });

  it('never reuses a token after a session rotation or account switch', async () => {
    const spy = vi.fn()
      .mockResolvedValueOnce(session('a'.repeat(43))).mockResolvedValueOnce(new Response('{}'))
      .mockResolvedValueOnce(session('b'.repeat(43))).mockResolvedValueOnce(new Response('{}'));
    vi.stubGlobal('fetch', spy);
    await clubMutation('/api/v1/clubs/x/join', { method: 'POST' });
    await clubMutation('/api/v1/clubs/x/leave', { method: 'POST' });
    expect(new Headers((spy.mock.calls[1]![1] as RequestInit).headers).get('x-csrf-token')).toBe('a'.repeat(43));
    expect(new Headers((spy.mock.calls[3]![1] as RequestInit).headers).get('x-csrf-token')).toBe('b'.repeat(43));
  });

  it('preserves backend 503 financial holds without retrying or converting to success', async () => {
    const spy = vi.fn().mockResolvedValueOnce(session()).mockResolvedValueOnce(new Response('{}', { status: 503 }));
    vi.stubGlobal('fetch', spy);
    const response = await clubMutation('/api/v1/clubs', { method: 'POST', body: '{}' });
    expect(response.status).toBe(503);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('rejects unrelated URLs, safe methods and caller-provided CSRF overrides', async () => {
    const spy = vi.fn(); vi.stubGlobal('fetch', spy);
    await expect(clubMutation('https://evil.example/api/v1/clubs', { method: 'POST' })).rejects.toThrow();
    await expect(clubMutation('/api/v1/clubs', { method: 'GET' })).rejects.toThrow();
    await expect(clubMutation('/api/v1/clubs', { method: 'POST', headers: { 'x-csrf-token': 'attacker' } })).rejects.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('wires all seven club mutation controls through the shared CSRF helper', () => {
    for (const [file, expected] of [
      ['./[clubId]/clubhouse-view.tsx', 4],
      ['./[clubId]/members/members-view.tsx', 1],
      ['./[clubId]/clubhouse-canvas.tsx', 1],
      ['./new/page.tsx', 1],
    ] as const) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      expect(source.match(/\bclubMutation\(/g)?.length ?? 0, file).toBe(expected);
    }
  });
});
