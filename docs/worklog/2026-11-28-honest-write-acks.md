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
