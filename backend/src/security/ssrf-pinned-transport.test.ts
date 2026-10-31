import { randomInt } from 'node:crypto';
import { createServer } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { fetchPinnedUrl } from './ssrf-pinned-transport';

// Linux may allocate ephemeral ports as low as 1024. Fetch intentionally blocks
// ports such as 6000, 6667 and 10080 before the pinned transport can connect.
// Keep this socket fixture in the high, Fetch-permitted range; never relax
// the transport's SSRF policy to make a randomized test port work.
function isFetchSafeTestPort(port: number): boolean {
  return Number.isInteger(port) && port >= 49152 && port <= 65534;
}

async function listenOnFetchSafeTestPort(server: ReturnType<typeof createServer>): Promise<number> {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const port = randomInt(49152, 65535);
    if (!isFetchSafeTestPort(port)) continue;
    try {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', () => {
          server.removeListener('error', reject);
          resolve();
        });
      });
      return port;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error('Could not allocate a Fetch-permitted loopback test port');
}

describe('pinned outbound HTTP socket', () => {
  it('rejects Fetch-blocked ephemeral ports while allowing safe high ports', () => {
    expect(isFetchSafeTestPort(6000)).toBe(false);
    expect(isFetchSafeTestPort(6667)).toBe(false);
    expect(isFetchSafeTestPort(10080)).toBe(false);
    expect(isFetchSafeTestPort(65535)).toBe(false);
    expect(isFetchSafeTestPort(55000)).toBe(true);
  });
  const servers: Array<ReturnType<typeof createServer>> = [];
  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    })));
  });

  it('connects only to the selected address while preserving the original HTTP Host', async () => {
    const server = createServer((request, response) => {
      response.setHeader('content-type', 'text/plain');
      response.end(request.headers.host ?? 'missing-host');
    });
    const port = await listenOnFetchSafeTestPort(server);
    servers.push(server);

    // A non-resolvable hostname proves there is no second OS DNS lookup.
    // The loopback fixture is passed ONLY to this low-level transport test;
    // safeFetch's public policy rejects it before the transport is reachable.
    const response = await fetchPinnedUrl(
      new URL(`http://pinned.invalid:${port}/`),
      [{ address: '127.0.0.1', family: 4 }],
      { method: 'GET' },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(`pinned.invalid:${port}`);
  });
});
