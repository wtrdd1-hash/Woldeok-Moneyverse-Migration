# Backend B v600 — DNS-pinned SSRF outbound transport (Draft / HOLD)

Date: 2026-10-28 KST. Issue: #1369. Base main: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`. Independent branch: `auto/hourly-b-ssrf-pin-v600-20261028-0535`.

## Problem and implementation

`safeFetch` validated `dns.lookup(host, { all: true })` but passed the hostname to the global fetch client, which could resolve again to an internal address. No evidence of a real Production exploit is claimed. This branch adds a dedicated Undici 7.30.1 dispatcher with a pinned validated address per request and redirect hop. The original hostname remains the HTTP Host/TLS SNI and certificate verification identity; the dispatcher does not delegate to environment proxy settings. All A/AAAA records must pass public-address checks before the first socket. Redirects remain manual, capped at three, and reject cross-origin credential/body forwarding. Host header overrides and caller-owned URL mutations are refused/fenced. Hexadecimal IPv4-mapped IPv6 private addresses are classified correctly. Each response is bounded to 16 MiB and fully consumed before the one-shot dispatcher is closed; caller abort and a ten-second total timeout are combined.

API paths and normal successful response payloads are unchanged. This security hardening can reject oversized responses, explicit Host overrides and unsafe addresses. No database schema, applied migration, WLD balance, ledger or authorization role is modified.

## TDD and evidence

Initial RED: two failures (no pinned dispatcher, hexadecimal IPv4-mapped loopback). Second RED: two failures (mutable URL TOCTOU, Host override). Final focused security suite: 20/20 PASS. A real local HTTP transport test uses a non-resolvable hostname mapped by a test-only pinned connector to loopback, verifying original Host preservation and no second DNS lookup; this does not authorize loopback in `safeFetch`.

Full root typecheck PASS, full build PASS, backend unit 1,693 PASS / 430 SKIP, frontend unit 1,681 PASS. Changed-file ESLint PASS. Root lint FAIL on two pre-existing blog-data.ts useless escapes (#1600 / QA #1606); full root test FAIL on duplicate migration 283 and missing 285 (#1605 / QA #1635). Root audit after upgrading Undici: 11 vulnerabilities (9 moderate, 2 low), no Undici advisories; bot audit FAIL (1 critical, 5 high). These are release blockers, not accepted deviations.

## Release boundary

No main merge, official Test exact-SHA, authenticated admin/core-flow E2E, Production promotion or live database write is authorized. The official Test release identity is still unverified (QA v1333). PR stays Draft + hold pending all required CI/security/DB/Test/GitOps gates. Do not modify A/C/Gemini/QA branches, worktrees or automations. No branch cleanup is justified.
