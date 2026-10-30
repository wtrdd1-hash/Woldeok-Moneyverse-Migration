# Development A — Owner Wallet Calendar Range (2026-10-30)

## Before work (13:28 KST)
- MiniPC Debian 13 reachable; backend/frontend/nginx/docker active; PostgreSQL connected. Root 44% used, DATA 49% used. No production mutations.
- Remote main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; remote 10 branches and 9 open Draft PRs. Preserve every unmerged head and other developers' worktrees.
- Read AGENTS.md, README.md, English/Korean project plans, QA v1388, release/CI and open PRs. Existing wallet activity supports all/7d/30d and direction, but no KST calendar range (F675-181). Current production/Test exact-SHA and treasury provenance remain blocked.
- Independent branch `auto/hourly-a-20261030-1325-wallet-calendar-range` from current main. This is an owner-private read-only enhancement; no ledger writes, grants or applied migration edits.

## In progress
- [ ] TDD strict Gregorian KST date range and bound-to-cursor validation.
- [ ] Backend/controller/repository owner-scoped SQL, web filter, Android app-api contract and regression tests.
- [ ] Exact SHA isolated PostgreSQL and full quality gates, CI and Test attestation.

## Finished
- Pending verification. Never merge or deploy without every release gate PASS.

## In progress (13:40 KST)
- RED→GREEN tests: KST Gregorian 1–366 day bounds, owner/session/range/direction signed microsecond cursor, SQL pre-limit owner/date filters, Next form/a11y, Android strict response validation, stale cursor HTTP 410.
- Real isolated PostgreSQL 17.11: 305 current-main migrations applied with SHA256 evidence, 74 synthetic balanced transactions (72 owner in range, one other owner, one outside range), 0 unbalanced. `moneyverse_app` SELECT allowed, INSERT denied on ledger transactions; exact 50+22 keyset and microsecond ordering verified.
- Typecheck PASS, full lint 0 errors / 1,043 warnings, API contract PASS, database unit 56 PASS / 4 SKIP, full local build PASS. Exact-SHA CI, complete suites, official Test and release gates pending.
- Rechecked origin/main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` and EN/KO plans. No production DB, deployment, Docker cleanup or other developer branch mutation.

## Finished (13:46 KST — release HOLD)
- Implementation spans NestJS controller/service, owner-scoped PostgreSQL read query, purpose-separated 15-minute signed microsecond cursor, accessible Next.js date filters and Android app-api strict response proof. Calendar bounds are strict Gregorian, inclusive KST days 1–366, UTC half-open SQL; legacy period/cursor behavior preserved. No new migrations, grants, tables, ledger writes or balances changed.
- Target backend wallet tests 47 PASS (including isolated real PostgreSQL); target frontend/Android tests 22 PASS before three additional adversarial app-api cases, all subsequently PASS. Database 56 PASS/4 SKIP; security policy 20 PASS; mobile API contract PASS; production dependency audit 0 known vulnerabilities; full typecheck, lint and local build PASS (lint 0 errors / 1,043 existing warnings).
- **Full suite failure:** backend 2,577 PASS / 119 FAIL / 495 SKIP; frontend 2,621 PASS / 53 FAIL. These are not claimed PASS and require separate baseline/root-cause triage. Exact-SHA CI and official Test authenticated E2E remain pending/BLOCKED. Never merge or deploy on target-only evidence.
- Isolated PG 17.11: 305 checksum-tracked migrations; 74 synthetic transactions (72 in-range owner, 1 foreign, 1 outside); 0 unbalanced; `moneyverse_app` ledger SELECT yes, INSERT no. Microsecond keyset 50+22, foreign owner hidden, boundary exclusion verified. No production data touched. Test container will be stopped after evidence capture.
- **Release HOLD:** official Test candidate exact-SHA frontend/backend/edge, Treasury provenance, independent restore, GitOps and rollback evidence not available. Revert code-only branch commit to roll back this feature; no migration rollback. Do not touch other developer branches or worktrees. No production deployment, restart, branch deletion or main merge.
- Source main checked at start/mid/before PR: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`. PR head/CI and final branch counts recorded in external QA/release evidence and GitHub PR comments.
