import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The console gate's answer to a session that ended.
 *
 * Every administrator page starts with `adminConsole`, so whatever it throws
 * is what the operator sees. It used to rethrow everything but a 403, which
 * meant an expired session -- or a console opened in another tab, which
 * rotates the cookie this one is holding -- drew the error boundary: a
 * heading, a reference code, and no way forward.
 */
const { redirected, called } = vi.hoisted(() => ({
  redirected: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
  called: vi.fn(),
}));

vi.mock('next/navigation', () => ({ redirect: (path: string) => redirected(path) }));
vi.mock('next/headers', () => ({ cookies: async () => new Map(), headers: async () => new Map() }));
vi.mock('./api', async (importOriginal) => {
  // The real ApiError, because `session.ts` narrows on `instanceof`.
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, api: (path: string) => called(path) as Promise<unknown> };
});

const { ApiError } = await import('./api');
const { adminConsole } = await import('./session');

const SESSION = '/api/v1/auth/session';
const SECURITY = '/api/v1/admin/security';

function answers(map: Readonly<Record<string, unknown>>): void {
  called.mockImplementation(async (path: string) => {
    const answer = map[path];
    if (answer instanceof Error) throw answer;
    return answer ?? {};
  });
}

describe('adminConsole', () => {
  beforeEach(() => {
    redirected.mockClear();
    called.mockClear();
  });

  it('sends an operator whose session ended to sign in, not to an error page', async () => {
    answers({ [SESSION]: {}, [SECURITY]: new ApiError(401, 'unauthorized') });
    await expect(adminConsole()).rejects.toThrow('REDIRECT /login?error=login_required');
    expect(redirected).toHaveBeenCalledWith('/login?error=login_required');
  });

  it('sends one who has not accepted the current policy to the consent screen', async () => {
    answers({ [SESSION]: {}, [SECURITY]: new ApiError(428, 'consent required') });
    await expect(adminConsole()).rejects.toThrow('REDIRECT /login?error=consent_required');
  });

  it('sends a signed-in visitor who is not an operator home', async () => {
    answers({ [SESSION]: {}, [SECURITY]: new ApiError(403, 'forbidden') });
    await expect(adminConsole()).rejects.toThrow('REDIRECT /');
  });

  it('still lets a real failure through, because that is an error and reads as one', async () => {
    answers({ [SESSION]: {}, [SECURITY]: new ApiError(500, 'boom') });
    await expect(adminConsole()).rejects.toThrow('boom');
    expect(redirected).not.toHaveBeenCalled();
  });

  it('answers with the console when the API does', async () => {
    answers({ [SESSION]: {}, [SECURITY]: { consoleSession: { state: 'open' } } });
    await expect(adminConsole()).resolves.toMatchObject({ consoleSession: { state: 'open' } });
  });
});
