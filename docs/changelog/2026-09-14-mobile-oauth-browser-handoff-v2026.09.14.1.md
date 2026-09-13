# v2026.09.14.1 — Mobile OAuth browser handoff

- Replaces the fragile HTTPS 302-to-custom-scheme hop after Google/Discord mobile OAuth with a tiny non-cacheable completion document.
- The completion document immediately attempts `woldeok-moneyverse://oauth/callback?...` in the browser and also exposes an explicit “Open Woldeok Moneyverse app” link for browsers that require a user gesture before launching an external app.
- Keeps the one-time handoff code server-generated, five-minute/single-use semantics unchanged, and does not accept caller-controlled return URIs.
- Adds `no-store`, `noindex`, a restrictive CSP, and HTML/script escaping around the generated deep link.
- Adds regression coverage for the default deep link and a server-configured fixed return URI.
- Validation before release: frontend typecheck passed; frontend suite passed 56 files / 548 tests. Test exact-SHA and backend/database smoke remain mandatory before Production promotion.