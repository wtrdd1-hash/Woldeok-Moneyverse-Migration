# C v1264 — Stock conditional order source truth (canonical)

## BEFORE WORK — 2026-11-01 15:40 KST
- Base: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` (`origin/main` fetched).
- Debian 13 miniPC: 7/7 core services active, development PostgreSQL connected; no shared service or database writes planned.
- Reviewed AGENTS.md, README.md, README/README.ko.md, English/Korean integrated project plans, open PRs, current A/B/QA branches and CI. Main planning snapshot v1518 is a historical release-hold document; newer planning PR #2335 is draft and not merged.
- Existing client `stock-conditional-orders.tsx` stores rules in browser localStorage, marks simulated threshold crossings `TRIGGERED`, and plays trade-success audio without a server order or ledger receipt. It advertises automatic market sells; user/account scoping and durable execution do not exist. This is a P0 false-trade claim.
- Existing authenticated `POST /api/v1/stocks/alerts` + owner readback action and migration 182 provide actual persistent, owner-scoped, CSRF-protected *notification-only* alerts. No server conditional sell contract exists.
- Non-overlap: A #2337 board order, B #2332 crafting, QA #2326 mini-showdown, C #2336 venture; #2322 stock depth is distinct.
- Decision: replace the deceptive browser-only conditional-order surface with a truthful, accessible entry to existing persisted stock price alerts; explicitly state that no automatic sell or WLD transaction occurs. Do not add financial writes or alter SQL grants.

## Plan / checkpoints
- [x] Establish isolated worktree and inspect authority and competing work.
- [x] RED: three new tests failed against the original simulated local-only execution UI.
- [x] GREEN: remove local-only rules and fabricated trade receipts; use existing owner-verified alert action/dialog and alert listing.
- [x] Verify responsive/keyboard/screen reader and security/DB/API contracts.
- [x] Run available exact-SHA gates and record blocked/failed release gates; retain Draft PR.

## IN PROGRESS
RED reproduced (3/3); replaced conditional-order client with server-backed price-alert entry, preserved stock detail and mobile/desktop component interface. Legacy browser state is never read, written, or interpreted as a trade. The pre-existing alert action verifies a returned UUID against the owner-scoped database readback. Focused tests and full gates pending.

## FINISHED — candidate code SHA `3c1454426b9ab42f95d57f7a1c1a503e06ffcb86`

### Verification evidence (Debian 13 miniPC)
- RED: 3/3 new regression tests failed before implementation. GREEN: focused web + persisted-alert action 25/25 PASS.
- Full lint PASS: 0 errors / 1,017 pre-existing warnings. Typecheck PASS. Frontend full 2,906 PASS. Backend first single-worker run timed out at 180 seconds; final two-worker run 2,963 PASS / 518 SKIP (exit 0).
- Frontend and Backend production builds PASS at candidate code SHA.
- Contract 41 PASS. Database package 62 PASS / 4 SKIP. App-api schema contract 184 endpoints PASS. Backend stock alert focused 9 PASS / 1 DB SKIP. Security scripts 12 PASS.
- Isolated network-disabled PostgreSQL 17.11: 316/316 numbered migrations 002..317 applied. `moneyverse_app` EXECUTE on `stock_alert_rules_list` and `stock_alert_rule_create` true; raw alert-rule INSERT and raw ledger INSERT false; owner-scoped read returns zero in fresh DB. Temporary container removed.
- Production-dependency High+ audit PASS (0 known). Full dependency audit FAIL (9: low 1, moderate 8). Full-route QA FAIL (required `artifacts/qa/full-route-ledger.json` absent).
- Independent candidate Next HTTP HEAD `/stocks/alerts`: private/no-store cache PASS, `X-Robots-Tag: index, follow` FAIL, referrer strict-origin-when-cross-origin; authenticated E2E unavailable without isolated auth credentials (`INTERNAL_API_TOKEN` intentionally absent). Shared official Test edge HEAD currently reports noindex/nofollow but is a different SHA. Reported direct Next issue on existing PR #2225.
- Official Test version `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; neither runs this candidate. No main merge, database change, GitOps release, Test/Production deployment, rollback or branch deletion.
- Additional independent fabricated stock live-trade toast tracked in issue #2340, deliberately excluded from this focused change.
- GitHub Draft PR #2338. Remote CI classify/policy/release-input and both runtime-check jobs PASS; candidate build job pending at last check. Final exact-head status documented in PR comment; release remains PARTIAL / BLOCKED because full audit, HTTP privacy, route QA and official authenticated E2E are not PASS.

### Work preservation
- Branch/worktree remain isolated. A/B/QA/Gemini branches, main and services were not modified. Backups and final SHA checks recorded in PR final comment.
