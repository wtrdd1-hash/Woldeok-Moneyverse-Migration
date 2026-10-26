import dns from 'node:dns/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Agent } from 'undici';
import { safeFetch, SsrffSecurityError } from './ssrf-defense';

vi.mock('undici', () => ({
  Agent: vi.fn().mockImplementation(() => ({ close: vi.fn().mockResolvedValue(undefined) })),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.mocked(Agent).mockReset();
  vi.mocked(Agent).mockImplementation(() => ({ close: vi.fn().mockResolvedValue(undefined) }) as never);
});

function pinnedLookup(index: number) {
  const options = vi.mocked(Agent).mock.calls[index]?.[0] as {
    connect?: { lookup?: (hostname: string, options: { all?: boolean; family?: number }, callback: (error: Error | null, address?: unknown, family?: number) => void) => void };
  } | undefined;
  expect(options?.connect?.lookup).toBeTypeOf('function');
  return options!.connect!.lookup!;
}

describe('SSRF validated DNS socket pinning', () => {
  it('pins the approved public address even when DNS changes before connect', async () => {
    const resolver = vi.spyOn(dns, 'lookup').mockImplementation(async () => [
      { address: '8.8.8.8', family: 4 },
    ] as never);
    const request = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', request);

    await expect(safeFetch('https://public.example.test/private')).resolves.toHaveProperty('status', 200);
    expect(Agent).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[1]?.dispatcher).toBeDefined();

    resolver.mockImplementation(async () => [{ address: '127.0.0.1', family: 4 }] as never);
    const lookup = pinnedLookup(0);
    const cb = vi.fn();
    lookup('public.example.test', { family: 4 }, cb);
    expect(cb).toHaveBeenCalledWith(null, '8.8.8.8', 4);
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toBe('https://public.example.test/private');
    const wrongHost = vi.fn();
    lookup('private.example.test', { family: 4 }, wrongHost);
    expect(wrongHost.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  it('pins every public redirect hop independently', async () => {
    vi.spyOn(dns, 'lookup').mockImplementation(async (hostname) => [
      { address: hostname === 'first.example.test' ? '8.8.8.8' : '1.1.1.1', family: 4 },
    ] as never);
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'https://second.example.test/final' } }))
      .mockResolvedValueOnce(new Response('ok')));

    await expect(safeFetch('https://first.example.test/start')).resolves.toHaveProperty('status', 200);
    expect(Agent).toHaveBeenCalledTimes(2);
    const first = vi.fn();
    const second = vi.fn();
    pinnedLookup(0)('first.example.test', { family: 4 }, first);
    pinnedLookup(1)('second.example.test', { family: 4 }, second);
    expect(first).toHaveBeenCalledWith(null, '8.8.8.8', 4);
    expect(second).toHaveBeenCalledWith(null, '1.1.1.1', 4);
    const all = vi.fn();
    pinnedLookup(0)('first.example.test', { all: true }, all);
    expect(all).toHaveBeenCalledWith(null, [{ address: '8.8.8.8', family: 4 }]);
  });

  it('rejects mixed public and private DNS answers before a socket is created', async () => {
    vi.spyOn(dns, 'lookup').mockImplementation(async () => [
      { address: '8.8.8.8', family: 4 }, { address: '169.254.169.254', family: 4 },
    ] as never);
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    await expect(safeFetch('https://mixed.example.test/')).rejects.toThrow(SsrffSecurityError);
    expect(Agent).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it('fails closed on private IPv4-mapped IPv6 and IPv4-compatible answers', async () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    for (const address of ['::ffff:7f00:1', '::7f00:1']) {
      vi.spyOn(dns, 'lookup').mockImplementation(async () => [{ address, family: 6 }] as never);
      await expect(safeFetch('https://mapped.example.test/')).rejects.toThrow(SsrffSecurityError);
    }
    expect(request).not.toHaveBeenCalled();
  });

  it('does not allow an injected caller dispatcher to replace the pinned socket', async () => {
    const request = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', request);
    await safeFetch('https://8.8.8.8/', { dispatcher: { dangerous: true } } as RequestInit);
    expect(request.mock.calls[0]?.[1]?.dispatcher).not.toEqual({ dangerous: true });
    expect(Agent).toHaveBeenCalledTimes(1);
  });
});
