# Honest failure for fabricated write acknowledgements — v2026.11.28.0830.1

**English canonical** | [한국어](2026-11-28-honest-write-acks.ko.md)

Branch `security/honest-write-acks-20261128`, stacked on `security/app-hardening-20261126` @ 743307328e (PR #3456 line). main 1df1150e97 (unchanged at start).
Worker: Claude Code (claude-opus-5-5). Ticket 2f2223d4cd-P3-S-04 (v2002.1 P3-S, remaining S01–S04 coverage).
Skills: security-review method (ordinary defensive review, not CVP-labelled), superpowers:test-driven-development, verification-before-completion.

## Before work
- [x] Read fresh handoff v2006.1, directives v2002.1/v2006.1/v0823.1, P8-AR directive, TESTGATE.1, S01–S04 coverage matrix.
- [x] Static classification of the 190 write routes outside the boundary filters (`uncovered-write-routes.txt`): 88 verify session + CSRF, 39 answer 503, 3 signed, the rest public/auth or needing a read.

## In progress → finished
- [x] Finding: several Spring handlers acknowledged writes that never happened (no service, no database). Member side: help-article report returned a "verified" thread id; burn-draw participation returned burned WLD and ten tickets; club war declaration/battle result. Administrator side: permanent suspension, address block/unblock, scheduled-task run and maintenance mode, manual backup job and an invented backup inventory (fixed file names, "VERIFIED", remote bucket configured), game catalogue register/update/toggle, AI-news settings/generate/publish, help draft, blog article, chat-report detail/action, hot-time trigger. Severity Medium: false security/operational assurance (an operator believes an abuser is blocked or a backup exists), not a ledger change.
- [x] RED: `FabricatedWriteAcknowledgementGateTest` 12 tests, 10 failed for the expected reason (2xx instead of 503); the two authorization-order tests passed.
- [x] GREEN: each handler keeps its existing session/role check and then answers 503 with a stable `*_SOURCE_UNAVAILABLE` code, matching the 2026-11-25 source-truth gate for services. No route, contract shape or migration change.
- [x] Callers: Next help report (flag-gated, treats a failure as uncertain), burn-draw BFF (shows the error), backup-inventory gateway (already maps failure to 503), AI-news admin page (`apiOrNull` → unavailable). No frontend change needed.

- [x] Independent review (Codex, read-only): REQUEST_CHANGES with one Medium — profile image DELETE answered deleted=true without deleting. Fixed test-first (RED 1 → GREEN); the profile action already reads the owner settings back.

## Validation
- Spring full suite at 1b91bf41bb: 941 tests / 0 failures / 0 errors / 0 skipped (first commit 2e5224e445: 940/0/0/0).
- Codex re-review of 1b91bf41bb: APPROVE. Gemini not run this round (earlier quota holds); three-family final review remains with the integration candidate.
- Database-backed integration and browser QA not rerun for this change (no SQL or UI change); official Test (G8) and Production (G9) HOLD. Independent review pending.

## Finished
State CODE_READY on the task branch; not merged, not deployed. S04-CVP HOLD (entitlement unverified).

## Not done / follow-up
- Fabricated *reads* (constant figures in some public/admin GET handlers) are a separate register item.
- Real implementations (help report via support thread function, backup inventory evidence) are backend functional work.

## Unit 2 — administrator evidence reads (ticket 1b91bf41bb-P3-S-05)
### Before work
- [x] main 1df1150e97 unchanged. Inventory of GET handlers that return literals without a canonical source: 65 candidates; administrator evidence screens first.
### In progress → finished
- [x] Finding (Medium): API health reported the database OPERATIONAL even when its probe query failed, with invented per-domain latency/success rates labelled ROUTE_METRICS and invented connection/cache figures. Backup inventory (second copy), storage headroom, audit verification/retention/disposition lists (always empty, which would hide a failed chain verification), financial events, chat-report queue, control flags/kill switches, abuse rules and game list answered constants.
- [x] RED: `FabricatedOperationalEvidenceGateTest` 7/7 failed. GREEN: API health reports the real probe outcome (DEGRADED on failure, latency null), route metrics NOT_MEASURED/null, `isLiveTelemetry` false; the rest answer 503 after the existing role check. One existing test asserted the hard-coded flag and now expects 503 (canonical feature state is `feature_switches`, fail closed).
- [x] Independent review: Codex REQUEST_CHANGES (unmeasured CPU shown as 0, heap substituted for RSS) → null in Spring, nullable in the dashboard with a frontend test (RED: TypeError on null → GREEN) → Codex APPROVE.
### Validation (exact SHA 61076e9394)
- Spring 948 / 0 failures / 0 errors / 0 skipped. Frontend 624 files / 3,261 tests passed; typecheck clean.
- Not run: database-backed integration and browser QA (no SQL change; dashboard change covered by render tests). G8/G9 HOLD.
### Follow-up register
- Real reads via existing SQL functions (audit verifications/retention/dispositions as the legacy gateway does; feature switches) — backend functional work.
- Remaining constant reads on member/public screens (burn event, warfare season, hot-time, FX portal, quant, ventures, districts, verified blog/help seeds, newspaper poll) — next unit after triage of which are product copy versus live state.

## Unit 3 — member and public invented live state (ticket 61076e9394-P3-S-06)
### Before work
- [x] main 1df1150e97 unchanged. Triage of the remaining constant reads: already-honest 503s (FX, quant, ventures, derivatives, weekly brief) and taxonomy/product copy (blog categories, help category names, lore) left as they are.
### In progress → finished
- [x] Finding (Medium): burn event totals/jackpot/participants and cumulative stats, warfare season standings and territory taxes, active 1.5x hot time and buff schedule, real-estate district prices/occupancy, a "connected" Discord guild with ids and latency, a member's own collection pieces and a collection edit that saved nothing, a popup for a non-existent season, invented terms text for any page slug, unreviewed "verified" help search/articles/counts and blog articles; then (review) the newspaper poll seeded with invented counts and unauthenticated in-memory votes.
- [x] RED `FabricatedMemberStateGateTest` 8/9 (session-order test passed) + poll 1 → GREEN; 503 after any existing session check. Eight legacy Phase6/13/14 checks asserted the constants and now expect 503; their unrelated assertions (forged-header 401) are unchanged.
- [x] Independent review: Codex REQUEST_CHANGES (poll — fixed; burn-event card shows zeros on 503 — ruled unreachable, the component is imported nowhere, follow-up; help article page rethrows 503 into the error boundary — honest failure, unchanged) → Codex APPROVE.
### Validation (exact SHA 39dd590a9f)
- Spring 958 / 0 failures / 0 errors / 0 skipped. No frontend change in this unit (frontend suite last run at 61076e9394: 3,261 passed).
- Not run: database-backed integration and browser QA. G8/G9 HOLD.

## Unit 4 — member object-access (BOLA/IDOR) sweep (ticket 39dd590a9f-P3-S-07)
### Before work
- [x] main 1df1150e97 unchanged. Static classification of 60 non-admin handlers taking an object id/key: 24 derive the actor from the session, 16 answer 503, 20 neither (each read). No handler was found acting on another member's object; ownership is enforced in the SQL functions where they are used.
### Findings → fixes
- [x] Unlinking a login method answered success without unlinking (Medium) → 503.
- [x] Sealed auction bid log public and unauthenticated (bidder ids, names, amounts) and invented bids on a failed read (Medium) → not disclosed; service never invents bids. Record: migration 271 still leaves SELECT on `black_market_bid_logs` to the application role (a later forward migration should move the read behind a function).
- [x] Pocket customisation answered success when the owner predicate matched no row (Low) → 404.
- [x] (Codex, High) Media served any well-formed key to anyone: private chat attachments, unreviewed photo submissions with an immutable public cache, images of hidden board posts → reads ask the legacy gateway's SQL visibility functions; a refused key is never read from disk. Chat and board uploads registered ownership by direct INSERT into revoked tables (always failed, echoed the database error) → `chat_media_register` (with the required `chat_` prefix) and `member_board_register_image_upload`, removing the file when refused. The frontend's `/api/v1/board/public/images` path is now served; the board upload returns its guarded path; public board image cache 300 s as in the legacy gateway.
- [x] (Codex, Medium) Stock alerts: creation returned a random id, deletion answered success for any id, events always empty, failed list read shown empty → ported to the owner-scoped `stock_alert_*` functions with the legacy validation.
- Independent review: Codex REQUEST_CHANGES (media High; auction modal; stock alerts) → fixed; re-review REQUEST_CHANGES (board upload URL, board cache) → fixed; Codex APPROVE at 2206aa37b2 with the gallery-cache ruling accepted as residual risk.
- Rulings: secret-auction modal and burn-event card are unreachable (no importer) — follow-up; published gallery photos keep the legacy 24 h immutable public cache by design — residual risk for an owner decision (unpublish does not purge caches).
- TDD note: `MediaAccessService` was written before its test file; the controller behaviour tests and the service failure test were then written and observed failing (compile-level RED for the new API) before the controllers changed. Other tests in this unit were RED by assertion first.
### Validation (exact SHA 2206aa37b2)
- Spring 982 / 0 failures / 0 errors / 0 skipped. The Phase11 media integration test no longer asserts that an unreviewed upload is public (H2 has no visibility functions; their answers are mocked there).
- Not run: database-backed integration against PostgreSQL for the new function calls (CI-only), browser QA, sandbox probes. G8/G9 HOLD.

## Correction 2026-11-28 10:45 KST (from the integration sandbox run)
- The old Spring chat upload failed because its key lacked the `chat_` prefix required by the registry CHECK (reproduced on the owned sandbox: SQLSTATE 23514), not because the role lacked a grant. Migration 350 keeps INSERT on `chat_media_registry` and `member_board_image_uploads` for the former direct path, so board uploads did work. The commit messages of 35acdb12e4 overstate this; this entry is the record. Registration now goes through `chat_media_register` / `member_board_register_image_upload`; a later forward migration can revoke those two 350 grants.
- Integrated as candidate 78c9399123 (integration branch): Spring 1157/0/0/0, sandbox SQL probes as `moneyverse_app` all as expected, ledger invariants 0/0/0; Codex APPROVE, Gemini APPROVE.

## Unit 5 — proxy cache on authorised media (QA04 finding, 2026-11-28 11:10 KST)
- Browser QA showed a private chat attachment served through Next with "public, max-age=31536000, immutable" (proxy stamped every .png/.webp/.svg path). Fixed test-first in 27dc592999: /api, /app-api and /media paths keep the origin's Cache-Control; build/public static assets unchanged. RED 6 → GREEN; frontend 625 files / 3,270 tests, typecheck clean. Also present on main (Production) — release priority note in the internal handoff.
