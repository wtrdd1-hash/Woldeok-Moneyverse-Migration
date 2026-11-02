# C v1291 — Public stock-market source integrity

## BEFORE — 2026-11-02 09:48 KST
- Host: Debian 13.6 miniPC, seven services active, development PostgreSQL connected (read-only status).
- Baseline canonical `origin/main`: `a8541927c3a351d980454c66e95a3356c47e0722`; original shared checkout has pre-existing `M implementation_plan.md` and remains untouched.
- Independent worktree/branch: `auto/hourly-c-public-stock-market-proof-v1291-20261102-0945`.
- Read AGENTS, README.md, README/README.ko.md, English/Korean integrated project plans, recent A/B/C/QA PRs and QA v1458. All open PRs remain Draft/HOLD. Latest QA reports Production 14/28 localized 500, direct app-role DML and migration checksum drift; release blocked.
- Proven P1 gap on canonical main: public `/stocks` assumes `marketData.stocks` is an array, sorts unverified rows, treats failed upstream as a genuine zero-stock market, converts bigint WLD prices to JS Number (precision loss), and claims unverified real-time 10-depth quotes and signup reward in SEO copy. Existing Nest GET `/api/v1/stocks` reads `stock_market_overview()` and returns integer strings.
- Scope: runtime-validated public market source, exact BigInt display and day change, explicit unavailable/verified-empty distinction, accurate multilingual SEO and accessible recovery. No DB/API changes, no financial mutation, no new endpoints.
- Isolation: avoid overlapping C stock comparison PR #2245, stock alert #2237, watchlist #2427, verified executions #2437 and A/B/QA work.

## IN PROGRESS
- [ ] RED tests on malformed/unavailable/valid market and exact WLD rate.
- [ ] Implement validated parser and render states, remove unverified claims.
- [ ] Re-run focused tests, full gates and real isolated PostgreSQL if feasible.
- [ ] Re-fetch main and planning before any merge; merge only if all gates PASS.

## FINISHED — PENDING
- SHA/tests/CI/Test/Production/rollback/retention: pending.

## IN PROGRESS — 2026-11-02 09:51 KST
- TDD RED: parser 3/5 failing on stub, SSR page 4/5 failing on actual main behavior (malformed API crashes, upstream outage presented as empty, 31-digit WLD rounded, unsupported SEO promises).
- GREEN: pure parser/math 5/5, server-rendered page 5/5; added halted-trade guard and 320px wrapping assertion for the next focused run.
- Focused ESLint and frontend typecheck PASS after contract build. No shared checkout or database writes.
- Midpoint fetch: origin/main remains `a8541927c3a351d980454c66e95a3356c47e0722`; integrated plans SHA256 EN `0e18217e147699dbb04f2f85fa94308922a57889d5b070b3fe081ceff8b78c34`, KO `2a384f4c842eac8ecf3813fcbcc6627fd08c98c3ccfabe1a17730d9f97f8cd12`.
