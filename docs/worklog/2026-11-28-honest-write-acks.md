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
- Spring full suite: 940 tests / 0 failures / 0 errors / 0 skipped (local, this branch).
- Database-backed integration and browser QA not rerun for this change (no SQL or UI change); official Test (G8) and Production (G9) HOLD. Independent review pending.

## Not done / follow-up
- Fabricated *reads* (constant figures in some public/admin GET handlers) are a separate register item.
- Real implementations (help report via support thread function, backup inventory evidence) are backend functional work.
