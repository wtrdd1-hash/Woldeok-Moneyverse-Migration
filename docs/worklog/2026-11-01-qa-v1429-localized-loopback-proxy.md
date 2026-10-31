# QA v1429 — Localized loopback rewrite TLS regression

## Before work (2026-11-01 ~05:21 KST)
- Source SHA: f13bbce273ffc65e8576170992d82ea00c27a1c9. Branch: qa/20261101-0521-v1429-localized-proxy. Independent clean worktree.
- Production GET /ko/login, /en/login, /ko/wallet, /en/admin, /ko and /en all HTTP 500; official Test equivalents HTTP 200. Production frontend journal reports `Failed to proxy https://localhost:4165/...` with `EPROTO wrong version number`. Direct local `http://127.0.0.1:4165` responds while HTTPS to that port fails TLS. Actual proxy.ts constructs localized rewrite target from `request.url`, preserving HTTPS even when Next's internal loopback listener is HTTP.
- Scope: preserve external HTTPS and locale/query semantics; only normalize HTTPS loopback rewrite targets to HTTP. No production configuration or database change.

## Planned / in progress
- [x] RED: real NextRequest/NextResponse proxy regression for HTTPS loopback, public HTTPS, and HTTP loopback.
- [x] GREEN: minimal loopback-only scheme normalization at localized rewrite construction.
- [x] Focused test, typecheck/lint/build and source diff review. Exact candidate SHA GitHub CI pending.
- [ ] Draft PR pending; official Test exact-SHA and Production promotion HOLD.

## In progress — 2026-11-01 ~05:23 KST
- RED confirmed: 1 failing behavior assertion, 2 controls passing. Received `https://localhost:4165/login?ref=abc&__mv_path_locale=en` instead of local HTTP; exact reproduced EPROTO on public Production.
- GREEN confirmed: 3/3 NextRequest/NextResponse proxy tests passed with loopback-only scheme normalization. Public HTTPS remains HTTPS; HTTP loopback remains HTTP; lookalike host is not downgraded. No source other than frontend/src/proxy.ts changed.
- Independent official Test exact SHA still BLOCKED. Candidate cannot be promoted on focused tests alone.

## Verified candidate — 2026-11-01 ~05:28 KST
- Source baseline origin/main `f13bbce273ffc65e8576170992d82ea00c27a1c9` unchanged; English/Korean master planning docs unchanged.
- TDD RED 1 expected failure/2 controls passing (exit 1), GREEN 3/3 passing (exit 0). Contract build, full workspace typecheck, focused ESLint, 3 targeted locale/proxy test files, and optimized frontend build all exit 0.
- Change is scoped to loopback HTTPS rewrite downgrade only; public HTTPS is preserved. No Production/Test service, Nginx, DB, financial transaction, release manifest or deployment modified.
- Main's exact-SHA official Test gate remains BLOCKED (Test `bc8cd8a6...` vs main `f13bbce...`); Draft PR only, no merge or Production promotion. Full candidate CI to be evaluated against exact PR head SHA after push.
