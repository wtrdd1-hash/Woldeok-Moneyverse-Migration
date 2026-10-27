# 2026-10-28 06:25 — A: Verified bank repayment impact preview

## BEFORE — v1 / 06:25 KST
- Source: origin/main `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`; branch `auto/hourly-a-bank-repay-preview-20261028-0625`; independent worktree.
- Read AGENTS, README, EN/KO project plans and integrated planning master, planning #1639/#1640, prior A and QA reports; reviewed active PRs and CI blockers.
- P1 gap: member bank repayment form submits without a server-verified read-only impact preview. Avoid overlap with A shop #1631/#1636, B privacy #1627, C security #1638, QA #1635.
- Decision: reuse existing `bank_get_my_standing(actor)` SECURITY DEFINER read model in a **single SQL statement** (cash and active loan), not new direct table grants or a migration. Server computes exact bigint string amounts; actual repayment remains independently authorized and revalidated. Preview is nonbinding and creates no financial mutation.
- Release gate: HOLD until full lint, CI, migrations, security, official exact-SHA Test/auth/E2E and backup restore PASS. Do not modify live DB, Test, Production or other worktrees.

## PLAN — v2 / in progress
1. RED tests: actor-only SQL read, forged loan refusal, amount precision/over-request/insufficient cash, CSRF/cache and Android contract.
2. GREEN: repository + controller + strict DTO, server action and accessible preview UI; Android gateway parity; no schema mutation.
3. Rerun tests, build, typecheck, lint, audits and isolated PostgreSQL if safe; fetch main mid/final; record all evidence, PR, CI and release HOLD.

## IN PROGRESS
- Started independent implementation; no shared environment mutation.

## IN PROGRESS — v3 / 06:30 KST
- RED observed: backend 6/6 failed due to missing preview symbols; frontend 3/3 failed due to missing action.
- GREEN: backend 6/6, frontend action 3/3, Android gateway existing bank no-store coverage 17/17, preview component 2/2 PASS under `NODE_ENV=test`. First UI test invocation without NODE_ENV=test loaded React production act and failed; corrected test invocation, not code.
- Typecheck PASS; changed-file lint PASS; `git diff --check` PASS. Midpoint origin/main re-fetched and unchanged (`b1cd54f...`).
- Implementation: strict amount string, actor-bound single existing SECDEF SQL call, exact BigInt, nonbinding receipt, CSRF, no-store, web CTA, Android proxy contract; no migrations or ledger writes.
- Remaining: full gates, independent PG fixture, GitHub CI, Test/Production exact SHA and release HOLD documentation.
