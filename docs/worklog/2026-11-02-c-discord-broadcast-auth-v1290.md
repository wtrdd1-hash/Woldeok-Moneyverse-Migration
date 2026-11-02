# Development C v1290 — Discord broadcast gateway authorization and receipt truth
## Before work — 2026-11-02 08:45 KST
- Status: IN PROGRESS; no production or test deployment authorized.
- Baseline: origin/main a8541927c3a351d980454c66e95a3356c47e0722.
- Debian 13 miniPC: connected; seven services active; development PostgreSQL connected.
- Reviewed AGENTS.md, README.md, README/README.ko.md, both living project plans, open PRs (A #2448, B #2447, C #2446, QA #2398), and current CI. No open PR targets the Discord broadcast gateway.
- P0 evidence: Next POST /api/discord/broadcast accepts a fixed fallback secret as authentication, enabling unauthenticated requests to be treated as internal when neither env secret is configured. The same handler treats malformed successful bot responses as delivered. Browser administrator requests have no origin check. Bot listener is loopback-only; the public ingress is the Next route.
- Scope: remove default credential; compare only a configured sufficiently strong secret; require same-origin administrator browser requests; validate bounded input; verify actual bot receipt; preserve existing legitimate caller contract. No DB, ledger, or runtime changes.
- Plan: write failing route tests, observe RED, implement minimal safe gateway, observe GREEN, run complete repository gates, re-fetch main, publish draft PR only; release HOLD on any gate failure.
## In progress — 08:50 KST
- RED: 20/21 focused tests failed on the original route, demonstrating absent runtime env-secret support, missing Origin/shape checks, and unverified bot receipt acceptance.
- GREEN: 23/23 focused tests pass after implementation; frontend TypeScript typecheck PASS after fixing a strict indexed access issue.
- Gateway now requires a configured 32–512 byte secret, timing-safe comparison, same-origin administrator browser authority, bounded JSON/field validation, private HTTP response headers and bot acceptance receipt.
- No production secret value recorded. No service restarted or DB/ledger changed.
- Re-fetched origin/main mid-task; remains a8541927c3a351d980454c66e95a3356c47e0722.
- Next: full gates and CI; release remains HOLD.
## Second TDD cycle / actual HTTP — 08:58 KST
- Built isolated Next.js on loopback: forged historical fallback secret and cross-origin POST both returned HTTP 403; no bot dispatch.
- Real HTTP revealed that global Next.js config overrode route response privacy headers: X-Robots-Tag was public index/follow and Referrer-Policy strict-origin-when-cross-origin.
- RED: one edge header policy test failed. GREEN: exact endpoint-specific header override added; 33/33 focused security/config tests pass. Fresh isolated HTTP rebuild required.
- RED: elevated admin console lock test failed; GREEN: browser requests now require both verified administrator viewer and backend /api/v1/admin/security consoleSession.state=open, fail closed on backend outage.
- Initial SHA 56ecaacc24598c6d63b0be5523208975b8cfee69 full gates: Lint PASS (0 errors/1027 warnings), Typecheck PASS, Build PASS, Frontend 2945 PASS, Backend 2978 PASS/2 FAIL/518 SKIP (pre-existing profile HTTP 401 vs 200), Contract PASS, Database package 62 PASS/5 SKIP, app-api 184 endpoints PASS, security 11 PASS, production high audit PASS, full audit FAIL (9 advisories), route QA FAIL (missing ledger), bot test first failed due absent worktree node_modules but 11 PASS after symlink.
- Isolated PostgreSQL 17.11: 322/322 migrations PASS, 27 real-DB tests PASS, outbox INSERT/UPDATE and audit DELETE denied to app role. Container removed.
- Fresh SHA gates required after edge and elevated-session corrections.
## Finished — 2026-11-02 09:06 KST (release decision)
- Final code candidate SHA: 04ac83fa64e682b80e64b5c84cd20803b5377a5d; final documentation commit will advance HEAD and requires its own exact-SHA gate record. Branch: auto/hourly-c-discord-broadcast-auth-v1290-20261102-0845; Draft PR #2449.
- Final code SHA: Lint PASS (0 errors, 1,027 warnings), Typecheck PASS, Build PASS, Frontend 2,947 PASS, Backend 2,978 PASS / 2 FAIL / 518 SKIP (unchanged profile-private-response HTTP 401 vs expected 200), contract PASS, Database package 62 PASS / 5 SKIP, app-api 184 endpoints PASS, security 11 PASS, bot 11 PASS after dependency symlink, production high-severity audit PASS, full dependency audit FAIL 9 advisories (8 moderate, 1 low), full-route QA FAIL missing artifacts/qa/full-route-ledger.json.
- Final code SHA isolated PostgreSQL 17.11: 322/322 migrations PASS; 27 real database tests PASS; app role outbox INSERT/UPDATE and audit DELETE denied; temporary DB removed.
- Final code SHA isolated Next.js HTTP: forged historical default secret POST returned HTTP 403, Cache-Control private/no-store, X-Robots-Tag noindex/nofollow, Referrer-Policy no-referrer. No bot message dispatched; server removed.
- Remote required CI: classify, policy, release-input PASS; runtime-check still pending at final record. No claim of full CI success.
- Official Test and Production public frontend version 510dbe6bf4d5c2a8089fc06b480776053da7a2e3, not this candidate. No exact-SHA official Test, authenticated browser/Android E2E, real Discord delivery or session continuity verification.
- Re-fetched origin/main at start, midpoint and finish: a8541927c3a351d980454c66e95a3356c47e0722 unchanged. Planning English/Korean canonical documents were read; neither was edited. No A/B/QA/Gemini branch touched.
- Decision: PARTIAL / RELEASE BLOCKED. Do not merge Draft #2449 or deploy to Test/Production until required gates pass. No main, GitOps, runtime, DB, WLD or release mutation. No rollback needed; preserve branch and PR. Any potential conflict with C #2446 on frontend/next.config.ts must be reconciled on a refreshed main before integration.
- Security follow-up: bot loopback webhook currently reports success after sendLog swallows Discord channel errors. Gateway reports bot acceptance, not proof of external Discord delivery; independently verify/fix bot receipt semantics before claiming delivered messages.
