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
