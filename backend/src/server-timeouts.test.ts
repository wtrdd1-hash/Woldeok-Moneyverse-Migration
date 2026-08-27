import { createServer, type Server } from 'node:http';
import { connect } from 'node:net';
import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { applyServerTimeouts } from './server-timeouts';

interface TimeoutBearing {
  headersTimeout?: number;
  requestTimeout?: number;
  connectionsCheckingInterval?: number;
  maxConnections?: number;
}

function applied(): TimeoutBearing {
  const server: TimeoutBearing = {};
  applyServerTimeouts(server as Server);
  return server;
}

describe('applyServerTimeouts values', () => {
  it('bounds header, request and sweep timings well below Node defaults', () => {
    const server = applied();
    expect(server.headersTimeout).toBe(8_000);
    expect(server.requestTimeout).toBe(20_000);
    expect(server.connectionsCheckingInterval).toBe(2_000);
    expect(server.maxConnections).toBe(1000);
  });

  // A requestTimeout below headersTimeout can fire before headers finish
  // parsing, which rejects slow but legitimate clients.
  it('keeps requestTimeout at least as large as headersTimeout', () => {
    const server = applied();
    expect(server.requestTimeout).toBeGreaterThanOrEqual(server.headersTimeout ?? 0);
  });

  // The sweep interval is what turns the timeouts above from a stated bound
  // into an enforced one.
  it('sweeps far more often than the header timeout it enforces', () => {
    const server = applied();
    expect(server.connectionsCheckingInterval).toBeLessThan(server.headersTimeout ?? 0);
  });

  // The request timeout has to fit the largest body the application accepts,
  // the 8 MiB image upload. Rather than assert a guessed link speed, derive
  // the throughput the chosen timeout demands and check it stays within
  // ordinary broadband: a client slower than this is cut off mid-upload.
  it('demands no more than 4 Mbps of a client sending the largest request', () => {
    const megabitsPerSecondRequired =
      (8 * 1024 * 1024 * 8) / ((applied().requestTimeout ?? 0) / 1000) / 1e6;
    expect(megabitsPerSecondRequired).toBeCloseTo(3.36, 2);
    expect(megabitsPerSecondRequired).toBeLessThan(4);
  });
});

/**
 * Asserting the property values proves the assignment happened, not that Node
 * acts on it. `connectionsCheckingInterval` in particular is documented as an
 * `http.createServer` option and is absent from `Server` in @types/node, so
 * whether a post-construction assignment is honoured is a real question. It
 * is, and this is what keeps that true: the test drives a real socket that
 * sends an unterminated header block and waits for Node to cut it off.
 *
 * Scaled-down timings are used so the test costs about a second rather than
 * the eight the production values would demand; the mechanism is identical.
 */
describe('applyServerTimeouts behaviour against a real socket', () => {
  it('cuts off a client that never finishes its header block', async () => {
    const server = createServer((_request, response) => response.end('ok'));
    applyServerTimeouts(server);
    // Same mechanism, one tenth of the wait.
    server.headersTimeout = 700;
    server.requestTimeout = 900;
    (server as Server & { connectionsCheckingInterval?: number }).connectionsCheckingInterval = 50;

    let timedOutAfterMs = -1;
    const startedAt = { value: 0 };
    server.on('clientError', (_error, socket) => {
      if (timedOutAfterMs < 0) timedOutAfterMs = Date.now() - startedAt.value;
      socket.destroy();
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;

    startedAt.value = Date.now();
    const socket = connect(port, '127.0.0.1');
    socket.on('error', () => {
      /* The server destroys this socket; that is the expected outcome. */
    });
    socket.write('GET / HTTP/1.1\r\nHost: probe\r\n');

    await new Promise((resolve) => setTimeout(resolve, 2_000));
    socket.destroy();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });

    expect(timedOutAfterMs, 'the drip connection was never cut off').toBeGreaterThan(0);
    // Header timeout plus at most a couple of sweeps.
    expect(timedOutAfterMs).toBeLessThan(1_500);
  }, 10_000);
});
