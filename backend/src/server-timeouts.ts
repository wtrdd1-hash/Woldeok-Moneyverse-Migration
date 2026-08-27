import type { Server } from 'node:http';

/**
 * `connectionsCheckingInterval` is writable on a live server -- Node reads it
 * on each sweep -- but @types/node declares it only as an `http.createServer`
 * option, not as a property of `Server`. This is the narrowest way to say
 * "assigning it is intended", verified by the slowloris test beside this
 * file, which fails if the sweep ever stops honouring the assignment.
 */
type SweepTunableServer = Server & { connectionsCheckingInterval?: number };

/**
 * Slowloris protection. With none of these set, Node falls back to its own
 * defaults -- headersTimeout 60s, requestTimeout 5 minutes, no connection cap
 * -- and a client that trickles bytes, or none, can hold a socket open for
 * that whole window while contributing nothing.
 *
 * A separate module rather than inline in main.ts so the behaviour can be
 * tested against a real socket without booting the application.
 */
export function applyServerTimeouts(server: Server): void {
  // Every route reads at most a few KB of headers, which arrives in well
  // under a second even on a poor mobile link. 8s leaves an order of
  // magnitude of headroom while bounding a header-drip attacker to
  // single-digit seconds rather than Node's 60s default.
  server.headersTimeout = 8_000;
  // Covers the body too, so it must fit the largest request the application
  // accepts -- the 8 MiB image upload. 20s asks 3.36 Mbps of that client,
  // within ordinary broadband, while staying a fraction of Node's 5-minute
  // default. Must stay >= headersTimeout or it can fire before headers
  // finish parsing.
  server.requestTimeout = 20_000;
  // Node enforces both through a periodic sweep that defaults to 30s, so
  // without this a connection past its 8s headersTimeout could still sit open
  // for ~30s more -- most of the protection above given back as sweep
  // latency. 2s bounds that to headersTimeout + ~2s.
  (server as SweepTunableServer).connectionsCheckingInterval = 2_000;
  // A hard ceiling on concurrent sockets for the whole listener, well above
  // expected legitimate load, to bound worst-case memory and file-descriptor
  // use during a connection flood.
  server.maxConnections = 1000;
}
