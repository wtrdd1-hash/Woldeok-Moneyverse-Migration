import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { fetchPinnedUrl } from './ssrf-pinned-transport';

describe('pinned outbound HTTP socket', () => {
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
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;

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
