# C v1134 — FX unjournaled balance mutation containment

## BEFORE (2026-10-28 21:45 KST)
- Main `35971c600f25869c96f1c666d4b9f58927202730`; isolated branch `auto/hourly-c-fx-ledger-hold-v1134-20261028-2145`.
- Debian miniPC seven services active; dev PostgreSQL connected, but no writes to shared/live DB. Disk 98% full.
- Read AGENTS, README and Korean guide, canonical EN/KO PROJECT_PLAN, integrated plan; open A/B/C/QA/planning PRs and issue #1129.
- Source proof: FX repository directly UPDATEs `account_balances`; service/controller still expose mutable paths in source, although FX controllers are not registered in app module. Admin `/admin/fx` is reachable and shows hard-coded fabricated reserve/rate/swap values when backend data absent. Do not claim FX execution currently routed.
- Plan: RED tests for all eight FX mutations, fail-closed service, replace misleading FX admin console with explicit unverified/disabled view, verify no fake status/actions and noindex; preserve read-only methods and existing admin auth.
- Release: HOLD until authoritative ledger, full exact-SHA gates, official isolated Test E2E and security pass. No Production or main edits.

## IN PROGRESS
- Pending RED tests and implementation.

## FINISHED
- Pending exact SHA, test/CI/PR and final release decision.
