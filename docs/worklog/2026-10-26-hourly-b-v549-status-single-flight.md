# B v549 — status collector single-flight evidence (P1 / HOLD)

## Before work — 2026-10-26 07:33 KST
- Authoritative main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch `auto/hourly-b-status-single-flight-v549-20261026-0735`.
- miniPC Debian 13.6: service status healthy; root `/` at 100% (783MiB available), data volume 76% (46GiB available). No deletion of others' worktrees.
- Read AGENTS.md, README.md, EN/KO PROJECT_PLAN, current open PRs and CI. Open status-page PR #1172 changes frontend only; no open PR identified modifying backend status collector.
- Selected P1: overlapping scheduled `collectOnce()` invocations can complete out of order and overwrite a newer outage with an older green status. Scope is backend status collector only, no ledger/DB schema/API changes.
- Plan: reproduce with deferred probes (RED); add minimal single-flight guard with finally reset; run focused, backend, build/typecheck, lint, security and CI; do not merge or deploy without all required gates.

## In progress
- RED/GREEN and verification pending.

## Finished
- Pending.
