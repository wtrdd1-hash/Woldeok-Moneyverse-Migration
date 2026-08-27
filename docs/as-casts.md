# Surviving `as` casts

Real narrowing is preferred. A cast that survives is listed here with the
invariant that justifies it and the test that keeps that invariant true.

| Location | Cast | Invariant | Verified by |
| --- | --- | --- | --- |
| `backend/src/server-timeouts.ts` | `server as SweepTunableServer` | `connectionsCheckingInterval` is read by Node on every connection sweep and is writable on a live server, but `@types/node` declares it only as an `http.createServer` option, never as a property of `Server`. Assigning it post-construction is honoured — measured on Node v26.5.0: with the interval set to 50ms and `headersTimeout` 700ms, an unterminated header block is cut off after ~700ms rather than sitting until the 30s default sweep. | `backend/src/server-timeouts.test.ts` — "cuts off a client that never finishes its header block" drives a real socket and fails if the sweep stops honouring the assignment. |
