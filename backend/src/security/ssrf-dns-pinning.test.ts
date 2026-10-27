import dns from 'node:dns/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { agentOptions } = vi.hoisted(() => ({
  agentOptions: [] as Array<{ connect: { lookup: (hostname: string, options: object, callback: (error: Error | null, address?: string, family?: number) => void) => void } }>,
}));

// Inspect the *real* outbound transport boundary: a per-request dispatcher must
// pin the already-validated address instead of asking DNS a second time.
vi.mock('undici', () => ({
  Agent: class {
    constructor(options: (typeof agentOptions)[number]) {
      agentOptions.push(options);
    }
    async close() {}
  },
}));

import { isPrivateIp, safeFetch, SsrffSecurityError } from './ssrf-defense';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  agentOptions.length = 0;
});

describe('outbound SSRF DNS rebinding containment', () => {
  it('pins a validated public socket destination when DNS later changes to loopback', async () => {
    const lookup = vi.spyOn(dns, 'lookup')
      .mockResolvedValueOnce([{ address: '8.8.8.8', family: 4 }] as never)
      .mockResolvedValueOnce([{ address: '127.0.0.1', family: 4 }] as never);
    const request = vi.fn(async () => new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', request);

    await expect(safeFetch('https://public.example/data')).resolves.toHaveProperty('status', 200);
    expect(agentOptions).toHaveLength(1);
    expect(request).toHaveBeenCalledWith('https://public.example/data', expect.objectContaining({
      dispatcher: expect.anything(),
      redirect: 'manual',
    }));

    const pinned = await new Promise<{ address?: string; family?: number; error: Error | null }>((resolve) => {
      agentOptions[0]!.connect.lookup('public.example', {}, (error, address, family) => {
        resolve({ error, address, family });
      });
    });
    expect(pinned).toEqual({ error: null, address: '8.8.8.8', family: 4 });
    expect(lookup).toHaveBeenCalledTimes(1);
  });

  it('rejects mixed public/private DNS results before sending any request', async () => {
    vi.spyOn(dns, 'lookup').mockResolvedValueOnce([
      { address: '8.8.8.8', family: 4 },
      { address: '10.1.2.3', family: 4 },
    ] as never);
    const request = vi.fn();
    vi.stubGlobal('fetch', request);

    await expect(safeFetch('https://mixed.example/private')).rejects.toThrow(SsrffSecurityError);
    expect(request).not.toHaveBeenCalled();
  });

  it('rejects a redirect whose newly resolved destination is private', async () => {
    vi.spyOn(dns, 'lookup')
      .mockResolvedValueOnce([{ address: '1.1.1.1', family: 4 }] as never)
      .mockResolvedValueOnce([{ address: '169.254.169.254', family: 4 }] as never);
    const request = vi.fn().mockResolvedValueOnce(new Response(null, {
      status: 302, headers: { location: 'https://redirect.example/metadata' },
    }));
    vi.stubGlobal('fetch', request);

    await expect(safeFetch('https://first.example/')).rejects.toThrow(SsrffSecurityError);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('treats hexadecimal IPv4-mapped IPv6 loopback and metadata as private', () => {
    expect(isPrivateIp('::ffff:7f00:1')).toBe(true);
    expect(isPrivateIp('::ffff:a9fe:a9fe')).toBe(true);
    expect(isPrivateIp('::ffff:808:808')).toBe(false);
    expect(isPrivateIp('0:0:0:0:0:ffff:7f00:1')).toBe(true);
  });
  it('snapshots a caller-owned URL before an asynchronous DNS check', async () => {
    let completeLookup!: (value: { address: string; family: number }[]) => void;
    vi.spyOn(dns, 'lookup').mockImplementationOnce(() => new Promise((resolve) => {
      completeLookup = resolve;
    }) as never);
    const request = vi.fn(async () => new Response('ok'));
    vi.stubGlobal('fetch', request);
    const mutable = new URL('https://public.example/original');
    const pending = safeFetch(mutable);
    mutable.hostname = '127.0.0.1';
    completeLookup([{ address: '8.8.8.8', family: 4 }]);
    await pending;
    expect(request).toHaveBeenCalledWith('https://public.example/original', expect.anything());
  });

  it('rejects a caller-provided Host override before opening any socket', async () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    await expect(safeFetch('https://8.8.8.8/path', {
      headers: { Host: '127.0.0.1' },
    })).rejects.toThrow(SsrffSecurityError);
    expect(request).not.toHaveBeenCalled();
  });


});
