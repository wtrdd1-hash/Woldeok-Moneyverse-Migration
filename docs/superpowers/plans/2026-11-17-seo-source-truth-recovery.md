# SEO Source-Truth Recovery Implementation Plan

> **For agentic workers:** Follow systematic debugging, worktree isolation, TDD, and verification-before-completion. Work only on `fix/seo-node-source-truth-v2026.11.17.2`.

**Goal:** Stop routing administrator SEO, crawler monitoring, GSC and IndexNow API calls to Spring Boot's nonfunctional/example SEO endpoints; restore proven NestJS source-of-truth without impacting other domains.

**Architecture:** Surgical Nginx internal gateway `127.0.0.1:4400` path override for `/api/v1/seo/`, positioned before broader Spring regex routing. NestJS `127.0.0.1:4500` is currently retained and already enforces admin session, whereas Next.js BFF uses versioned SEO APIs. Stage using an independent localhost Nginx instance, then zero-downtime reload live gateway only after passing negative security and response-schema tests.

**Tech Stack:** Nginx, NestJS (retained runtime), Next.js BFF, Python 3 standard library smoke tests, Git.

**Spec:** `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/standards/SEO_SITEMAP_INDEXING_STANDARD.ko.md`, `AGENTS.md`.

## Global constraints
- Do not change finance, DB, user's balances, authentication/CORS policy, other Spring routing, `.well-known/indexnow.key` or feature switches.
- No crawler-log or admin raw output in public; unauthorized status/admin, crawl-audit, GSC and submission must remain denied.
- IndexNow accepted response is not evidence of indexing; never trigger live submission as a smoke test.
- Keep main clean and track both English canonical and Korean records; re-read main halfway.
- Keep rollback copy; independent Test; only `nginx -t` plus reload after checks and rollback readiness.

## Review focus
- Nginx `^~` prefix must beat the broad Spring regex without matching other domains.
- A NestJS failure must fail closed, not return Spring's fabricated counts/receipts.
- Direct public responses remain aggregate-only and never contain `indexNowKey` or crawler IPs.
- Cookies and x-internal-token continue unmodified through BFF to retained backend; anonymous admin API must be 401/403.
- Both IndexNow key URL and public UI remain unchanged. No actual POST request is made in QA.

### Task 1 — Evidence and failing regression
- [ ] Capture `main` SHA, active nginx and runtime identity, affected routes and status codes in worklog.
- [ ] Write `scripts/qa/verify-seo-gateway.py` requiring HTTP 200 valid public schema, 401/403 for protected GET and POST; deny sample Spring response.
- [ ] Run against existing `:4400`: observe RED (404 for admin, sample public JSON).

### Task 2 — Isolated gateway candidate
- [ ] Write `ops/nginx/seo-node-bridge.conf` strictly versioned SEO location to established upstream `prod_node`.
- [ ] Create disposable Nginx test gateway `:4401` using same snippet and `127.0.0.1:4500` upstream.
- [ ] `nginx -t` on stage, query actual `:4401` and run the same regression script: GREEN.
- [ ] Add fail-closed test for unavailable backend and confirm HTTP 502, not fabricated HTTP 200.

### Task 3 — Controlled production promotion
- [ ] Re-fetch origin/main; confirm branch isolation, currently running Node, Spring, frontend and nginx, key public route.
- [ ] Save immutable nginx config rollback copy, install include in *internal 4400 server only*, `nginx -t` and zero-downtime reload.
- [ ] Smoke real :4400 (public SEO + anonymous admin negatives), Next public SEO telemetry and public SEO key; verify unrelated health/version and Spring route unchanged.
- [ ] Roll back immediately on any regression. If unsupported, stop with RELEASE HOLD.

### Task 4 — Documentation and delivery
- [ ] Update worklog at midpoint/closeout, internal and GitHub change logs EN/KO, and release/remaining limitations.
- [ ] Recheck main just before commit; run full QA smoke; review diff; git commit, push isolated branch and open review PR without merging to main unless approval/gates confirm.
