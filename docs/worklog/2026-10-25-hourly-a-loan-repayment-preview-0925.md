# Development A — Loan repayment preview — 2026-10-25 09:25 KST

## Start / policy and baseline
- Main SHA: `c9a868b1e622341e2daa8b936ddf0988eda9988e`; independent worktree `auto/hourly-a-loan-repayment-preview-20261025-0925`.
- Debian 13.6; services backend/frontend/bot/MCP/nginx/docker active; root filesystem 100% (440 MiB available), data disk 95 GiB free. Worktree on data disk.
- GitHub start: 128 remote heads (before concurrent changes), 124 open PRs; existing conflicts #1143, #1110, #1107. No branch deletion. Preserve all other agents' changes.
- Read main AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated EN/KO plans, prior QA v1209 and previous A release evidence. No root PROJECT_PLAN files; authoritative paths under docs/planning.
- Priority P1: show authenticated member's actual outstanding virtual loan, minimum due, cash coverage, proposed repayment and expected post-repayment balances before an irreversible ledger write. Current banking screen can repay but has no explicit server-verified quote. This is a *snapshot*, never a reservation or approval. No new migration, grant or ledger mutation.

## Checklist / live checkpoints
- [x] Start audit, branch and documentation before code.
- [ ] RED tests for input, owner scope, precision, fail-closed and mobile gateway.
- [ ] GREEN implementation: existing owner-scoped PostgreSQL function -> Nest API -> private Next page -> app-api proxy.
- [ ] Midpoint main/plans/PR and duplicate check.
- [ ] Focused and complete build/lint/typecheck/test/DB/security/a11y/SEO/mobile/E2E evidence.
- [ ] Final exact SHA CI and safe merge/release decision; English/Korean release notes and preserved branch rationale.

## Design / invariants
- GET `/api/v1/banking/repay-preview?amount=<positive decimal integer>` (optional amount uses current loan minimum capped by outstanding), guarded by existing session/auth/consent; actor is *never* supplied by client.
- Use only `bank_get_my_standing(actor)` read function. Quote reflects `bank_repay` semantics: `payable=min(requested,outstanding)`; projected cash/outstanding computed with BigInt, and insufficiency flagged rather than hidden. A failed/null/malformed DB snapshot is an error, not fabricated zero balances.
- Private `/bank/repay-preview` page with noindex/no-store and bank navigation; Android app-api GET mirrors same API. No write endpoint or auto-submit.
- Exact SHA official Test and GitOps release required before any production promotion. Existing security/CI/DB isolation issues are independent release blockers.

## 09:35 KST duplicate audit / scope correction
- GitHub PR #1197 already implements an unmerged, full-stack loan repayment *amount preview* (A0020). The initial 12 backend + 16 frontend/mobile focused tests developed in this isolated branch reproduced overlapping behavior; those uncommitted files were discarded before push, without touching PR #1197 or any other worker's branch.
- **Revised unique P1 scope:** loan *maturity deadline and minimum-cash readiness* dashboard, not repayment amount calculation, repayment receipts or loan history. Existing PR #1199 covers aggregate obligations; #1163 covers single loan detail; neither supplies the dedicated due-soon/overdue time-window + cash-coverage status endpoint. Search of open PR titles found no loan deadline equivalent. No scheduled reminders or actual financial mutation.
- New contract: `GET /api/v1/banking/loan-deadline` -> guarded owner-only `bank_get_my_standing(actor)` -> validated status/maturity, server timestamp and deterministic 7-day due-soon/overdue window; exact integer-string WLD; `/bank/loan-deadline` private noindex page; Android app-api proxy.
- Worktree branch name retains its originally assigned timestamp to avoid deleting an unmerged branch; PR title and implementation reflect corrected scope. Original plan below superseded by the appended revision.

## 09:38 KST implementation checkpoint (revised scope)
- `GET /api/v1/banking/loan-deadline` uses existing owner-only `bank_get_my_standing` through BankRepository; no client-supplied actor, no SQL DML, no migration, no new grants.
- Deterministic 7-day threshold, overdue and remaining days, effective minimum capped by outstanding, exact WLD strings and null for undefined minimum readiness. Null/invalid DB snapshot => 503; browser unavailable state does not fabricate balances.
- Private dynamic/noindex `/bank/loan-deadline` and bank loan-tab link; Android app-api proxy cookie/Cache-Control test and 180-entry generated mobile contract (179 baseline + new endpoint).
- TDD RED confirmed for pure module, controller and page; GREEN backend 12/12 (includes mounted unauthenticated HTTP guard test), frontend/app-api 16/16. Full typecheck PASS, lint PASS (0 errors, 1,137 preexisting warnings), mobile contract generation PASS.
- Isolated PostgreSQL 17.11 `moneyverse-test-db` / `woldeok_moneyverse_ci`: `SET LOCAL ROLE moneyverse_app` can EXECUTE bank_get_my_standing, cannot INSERT ledger_transactions or UPDATE ledger_postings. Real active test member standing returns JSON object, numeric-string cash and no active loan. Transaction `BEGIN READ ONLY` / `ROLLBACK`; no write. Positive-loan real DB E2E remains unverified.
- Main SHA and EN/KO living/integrated plans rechecked unchanged at midpoint. Duplicate PR #1197 protected; no branch deletion or edits to other workers.
