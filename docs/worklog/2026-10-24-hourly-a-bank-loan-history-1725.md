# Development A — Owner loan history and status filters (A1725)

## Before work — 2026-10-24 17:25 KST
- Baseline `origin/main`: `49788d09494fed3e463651945b83386e87dd47bc` (fetched); branch `auto/hourly-a-bank-loan-history-20261024-1725`, isolated worktree.
- Read AGENTS.md, README.md, English/Korean PROJECT_PLAN and integrated masters, QA v1209, open PRs and CI. The plan's global ENV/SEC/REL P0 gates remain HOLD; this P1 member read feature is not a production authorization.
- Open PR count at initial inspection: 45; remote refs 1,103 (including HEAD/main); main SHA as above. Open A/B/C/QA/Gemini branches contain unique changes; no deletions or modifications.
- Scope: owner-scoped GET `/api/v1/bank/loans?status=active|overdue|repaid|all`, new authenticated `/bank/loans` page, Android gateway query forwarding; use existing `bank_my_loans` PostgreSQL SECURITY DEFINER read without migration or ledger write.
- Safety: reject invalid filter, no silent partial results, exact integer-string WLD, no cache/indexing, distinguish overdue/repaid, preserve current loan operations. No migration number allocated. Do not merge or deploy without complete gates.
- TDD plan: write service/controller/page/gateway regression tests first and observe RED; implement minimal read path; run focused tests and all feasible gates; refresh main mid-work and before integration.

## In progress
- Pending.

## Finished
- Pending; Test/Production release HOLD until verified.

### Checkpoint 1 — RED
- Re-read current main and EN/KO plans before implementation; main remains `49788d09494fed3e463651945b83386e87dd47bc`.
- Added backend service/controller, web UI, and Android query/no-store regression tests before implementation. Backend RED verified: 4 expected failures (status ignored, invalid status accepted, controller not forwarding); frontend RED verified: missing component import. Contract build prerequisite repaired before valid backend RED.
- Existing Android app-api already forwards the query and preserves backend `cache-control`; new regression covers it without changing gateway security boundaries.
