# Development A — Owner support message sender filter (2026-10-31)

**Status: DRAFT / RELEASE HOLD. English is authoritative; Korean companion follows.**

## Before work
- Connected directly to the authorized Debian 13.6 miniPC; backend/frontend/nginx/Docker active, development DB connected. Read AGENTS.md, README.md, English/Korean project plans, prior QA and development logs, branch/PR/CI inventory.
- Source `origin/main` `bf8d0d48f810932b43783d8605dce53954c60cff`. New isolated worktree and branch `auto/hourly-a-20261031-0325-support-message-sender`. No shared worktree or production modification.
- Reviewed concurrent B pocket-payment and C inventory work and planning Draft #2080; chose an independent, read-only support feature. Preserve existing no-query behavior.

## In progress
- TDD RED: backend sender/owner tests failed 2; frontend sender parser and Android gateway tests failed before implementation.
- Added authenticated `sender=admin|user` filter on the existing owner-scoped support messages GET, SQL predicate **after** the `support_thread_messages(actor,thread,200)` SECURITY DEFINER function, member-only Next form, and Android gateway fail-closed validation for stale/forged HTTP 200.
- Never scan all-time history: the function returns the first maximum 200 messages in chronological order; UI explicitly states this. Rejected invalid and duplicate sender query values. No migration, new grants, balance change, ledger mutation, or idempotency changes.
- Midpoint `origin/main` rechecked unchanged; latest unmerged planning v1534 concerns inventory expiry and does not overlap.

## Verification and blockers
- Backend targeted 7 PASS; frontend parser, Android and UI targeted 7 PASS; Android gateway regression 55 PASS; Backend contract/guard 11 PASS; database package 62 PASS / 4 SKIP; SEO and UI 5 PASS.
- Typecheck PASS, Backend build PASS, Frontend build PASS, changed ESLint PASS, dependency audit 0 known vulnerabilities.
- Real isolated PostgreSQL 17.11 **source-function fixture**: 6 PASS (direct SELECT denied in fixture, EXECUTE granted, owner sender counts, first-2 limit, rollback). Full clean-schema migration **BLOCKED** by role bootstrap/017–020 unsafe membership checks in the scratch harness; do not present fixture as 311-migration integration proof. No DEV/Production DB changes.
- Full Backend 2,656 PASS / **126 FAIL** / 501 SKIP. Full Frontend 2,708 PASS / **55 FAIL**. Failure identifiers match previous A baseline; zero new names. Full lint **1 ERROR / 1,043 WARNINGS** (existing shop purchase test parser error under Draft #2038). All failures still block merge.
- Prior QA/plan flags DEV direct support-table DML privileges despite intended revokes; the isolated fixture does **not** resolve that environment-level P0. Authenticated official Test exact-SHA E2E, independent backup restore, live edge header and Production executable provenance not proven.

## Finish and release decision
- Pre-integration main checked unchanged. Candidate code is a DRAFT PR; **do not merge or deploy** without required CI, clean-schema/ACL, exact-SHA Test, backup restore and GitOps gates. Rollback: revert optional sender filter code; existing unfiltered read remains, no DB rollback.
- Other A/B/C, planning and QA branches remain protected. No branch deletion, main merge, Test/Production deploy, service restart, production DB change or rollback executed.
