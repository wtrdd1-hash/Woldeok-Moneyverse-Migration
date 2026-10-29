import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDLE } from '@/lib/action-state';

const { api, apiWithCookie, relaySetCookie, revalidatePath } = vi.hoisted(() => ({
  api: vi.fn(), apiWithCookie: vi.fn(), relaySetCookie: vi.fn(), revalidatePath: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api, apiWithCookie, ApiError: class ApiError extends Error {} }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));

import { openConsole, closeConsole } from './security-actions';

const opened = { state: 'open', csrfToken: 'synthetic-csrf-token', expiresAt: '2027-01-01T00:00:00.000Z', idleExpiresAt: '2026-11-01T00:00:00.000Z' };
const rotated = 'mv_session=synthetic-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000';
const cleared = 'mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

beforeEach(() => { vi.resetAllMocks(); api.mockResolvedValue({ csrfToken: 'synthetic-csrf' }); });

describe('administrator console server actions', () => {
  it('refuses an HTTP 200 open with no rotated session cookie', async () => {
    apiWithCookie.mockResolvedValue({ payload: opened, setCookie: [] });
    const state = await openConsole(IDLE, new FormData());
    expect(state.status).toBe('error');
    expect(relaySetCookie).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses an HTTP 200 open with a contradictory state', async () => {
    apiWithCookie.mockResolvedValue({ payload: { ...opened, state: 'closed' }, setCookie: [rotated] });
    const state = await openConsole(IDLE, new FormData());
    expect(state.status).toBe('error');
    expect(relaySetCookie).not.toHaveBeenCalled();
  });

  it('relays only verified open evidence before claiming success', async () => {
    apiWithCookie.mockResolvedValue({ payload: opened, setCookie: [rotated] });
    const state = await openConsole(IDLE, new FormData());
    expect(state.status).toBe('ok');
    expect(relaySetCookie).toHaveBeenCalledWith([rotated]);
    expect(revalidatePath).toHaveBeenCalledWith('/admin');
  });

  it('refuses an HTTP 204 close without a deletion cookie', async () => {
    apiWithCookie.mockResolvedValue({ payload: null, setCookie: [] });
    const state = await closeConsole(IDLE, new FormData());
    expect(state.status).toBe('error');
    expect(relaySetCookie).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses an HTTP 204 close that rotates rather than clears a cookie', async () => {
    apiWithCookie.mockResolvedValue({ payload: null, setCookie: [rotated] });
    const state = await closeConsole(IDLE, new FormData());
    expect(state.status).toBe('error');
    expect(relaySetCookie).not.toHaveBeenCalled();
  });

  it('keeps mobile touch targets and screen-reader feedback on the console gate', () => {
    const gate = readFileSync('src/app/admin/console-gate.tsx', 'utf8');
    const page = readFileSync('src/app/admin/page.tsx', 'utf8');
    expect(gate).toContain('min-h-11');
    expect(gate).toContain('<ActionAlert state={state} />');
    expect(page).toContain('robots: { index: false, follow: false }');
  });

  it('reports a failed browser cookie relay as an error rather than a successful open', async () => {
    apiWithCookie.mockResolvedValue({ payload: opened, setCookie: [rotated] });
    relaySetCookie.mockRejectedValue(new Error('cookie store unavailable'));
    const state = await openConsole(IDLE, new FormData());
    expect(state.status).toBe('error');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('relays only verified deletion evidence before claiming console closure', async () => {
    apiWithCookie.mockResolvedValue({ payload: null, setCookie: [cleared] });
    const state = await closeConsole(IDLE, new FormData());
    expect(state.status).toBe('ok');
    expect(relaySetCookie).toHaveBeenCalledWith([cleared]);
    expect(revalidatePath).toHaveBeenCalledWith('/admin');
  });
});
