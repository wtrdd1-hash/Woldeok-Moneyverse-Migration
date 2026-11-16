# v2026.11.17.1 — Admin runtime log viewer security and production-readiness

Status: **BEFORE WORK** — 2026-11-17 KST. Independent task branch: `fix/admin-system-logs-hardening-v2026.11.17.1`.

## Source of truth and baseline
- Re-fetched origin/main at `86777fb2d5a1f8bbc680453368c0a5f04b5c7715` (PR #3201), with existing UI and Spring log API.
- Read `AGENTS.md`, integrated planning master, Spring observability skill, `docs/RELEASING.md`, the current service state and the relevant source files.
- Production GET `https://easy-scraping.com/admin/logs/system` returned 404; local Spring port 4550 returned 404 for this endpoint. No claim of deployment or function operation.
- Found a bypass in the source: any nonempty `x-internal-token` is accepted as administrator; live currently returns 404 because runtime artifact does not expose the endpoint.
- Log output has no credential/PII redaction and error paths can be presented as empty/healthy.
- Other security task branches are active: do not edit their worktrees or integrate into main without cross-checking.

## Plan
- [x] Add explicit authenticated superadmin authorization on every log request, including Next.js server actions; reject arbitrary internal headers.
- [x] Bound reads and filters; mask secrets and personal data; distinguish source failures from verified empty logs.
- [x] Use the observed frontend service as the log source and make source configuration explicit.
- [x] Add backend/frontend focused regression tests and run available build/lint/test gates.
- [ ] Re-fetch origin/main mid-work, record deltas and conflicts, push isolated commits, open a PR.
- [ ] Verify official Test exact candidate, actual HTTP auth rejection, and rollback readiness before any production promotion. Hold production if any gate remains unverified.

## Checkpoints
- BEFORE WORK: baseline and risks captured; no runtime, DB, Nginx or production mutations.
- IN PROGRESS (2026-11-17 00:49 KST): live four source readability verified without emitting raw log text; internal Nginx gateway falls back to Spring; source API not present in currently running Spring jar. Focused Spring security tests 14/14 pass with Java25 ByteBuddy experimental flag, Spring bootJar PASS; frontend server action 3/3 pass, typecheck PASS. Initial 1024MiB Next build OOM; retry with bounded 2304MiB ongoing. GitHub/internal changelogs created, main re-fetched unchanged `86777fb`. No production or official Test mutation.
- FINISHED: pending.
