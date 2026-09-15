# Release runtime routing recovery — v2026.09.15.113

## Scope

Restore the missing public Test routing bridge on the miniPC release path without weakening the exact-SHA production gate.

## Runtime evidence before change

- `test.easy-scraping.com` and `easy-scraping.com` both reached the same Nginx default upstream (`127.0.0.1:3001`).
- The isolated Test frontend was already listening on `3101`, with its backend on `3100`.
- A pod/cluster runtime is not present on this host; GitOps desired-state commits therefore did not by themselves change the local public runtime.
- The release contract remains fail-closed: a Test runtime must return the exact candidate/main SHA before Production is eligible.

## Change

- Add an opt-in `TEST_FRONTEND_ORIGIN` host rewrite in the production Next.js middleware.
- Only `Host: test.easy-scraping.com` is forwarded to that origin.
- With the variable absent, behavior is unchanged.
- Test builds leave the variable absent, preventing a self-proxy loop.

## QA / promotion sequence

1. Unit-test disabled and enabled routing behavior.
2. Typecheck and build frontend.
3. Launch the routing build on an alternate port and verify Host-based forwarding to isolated Test.
4. Rebuild isolated Test from the exact current main SHA and verify local exact-SHA/noindex/backend smoke.
5. Bootstrap the routing build into Production frontend, then verify public Test exact SHA.
6. Re-run the existing exact-SHA Production gate; do not promote if any SHA, backend, catalog, or noindex check differs.
