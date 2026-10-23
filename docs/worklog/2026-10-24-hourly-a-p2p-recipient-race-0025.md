# Development A — P2P Recipient Search Race (2026-10-24 00:25 KST)

**BEFORE WORK — DRAFT / RELEASE HOLD.**

- Debian 13.6 mini-PC: backend/frontend/bot/MCP/nginx/Docker active, dev DB connected. Read-only status verified through PC MCP.
- Latest origin/main SHA `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` (initial and worktree creation). Isolated branch `auto/hourly-a-p2p-recipient-race-20261024-0025`, worktree `/home/debian/worktrees/mv-a-p2p-recipient-race-20261024-0025`; shared main untouched.
- Remote branches 16; open PRs 15. Existing #1023/#1026/#1034, B #1035, C #1036, QA #1039 and all other unmerged refs preserved. No cleanup authorized.
- Read AGENTS.md, README.md, English and Korean PROJECT_PLAN, English integrated master, prior A #1026/#1034 worklogs and diffs, QA and CI summary, P0 #1025, release policy. Superpowers workflow applied with an independent plan, RED/GREEN and exact-SHA evidence; interactive design approval unavailable in this unattended run.
- **P1 feature:** prevent stale nickname results from selecting the wrong P2P recipient. DB and backend search endpoint already exist; no migration or grants are needed for the frontend race fix. Backend search privacy remains Draft #1034, not claimed as merged.
- Plan: `docs/superpowers/plans/2026-10-24-p2p-recipient-race.md`.
- Status: [x] Preflight [ ] RED [ ] GREEN [ ] Focused checks [ ] Full checks [ ] GitHub PR/CI [ ] Test [ ] Production.

## IN PROGRESS
Pending implementation and verification.

## FINISHED
Pending. Production RELEASE HOLD until full security, privilege, authenticated Test, ledger and GitOps gates pass.

## IN PROGRESS (00:30–00:36 KST)
- RED: 3/3 new browser component regressions failed on baseline: older HTTP response replaced newer nickname results; obsolete member stayed selectable after typing a different query; malformed recipient IDs were selectable.
- GREEN: 5/5 new component regressions PASS. Aborts obsolete requests, invalidates async continuations even if the transport ignores abort, clears results immediately on query changes, rejects malformed/oversized recipient data, caps selectable results to ten, and displays an accessible search failure.
- Focused frontend app-api + P2P UI: **15/15 PASS**. Focused backend wallet E2E/precision: **23/23 PASS**. Changed-file ESLint **0 errors / 3 pre-existing warnings**. Typecheck PASS; build PASS.
- Full tests: contract and DB package executed; backend **1,313 PASS / 398 SKIPPED**; frontend **1,388 PASS / 1 FAIL** (`src/app/blog/blog.test.tsx` AI draft title assertion). QA PR #1039 owns blog test repair. Do not duplicate.
- Full lint **FAIL** due pre-existing `frontend/src/app/wallet/export-ledger-csv.tsx:19` `no-control-regex` (QA PR #1021 owns). Full production dependency audit **FAIL**: `next@16.3.8`, Critical 2 / High 1; existing A recovery PR #1023 contains Next 16.4.2, unmerged.
- Development DB read-only: 877 ledger transactions, 1,784 postings, 0 unbalanced, 0 short-posting; 241 public tables, app role can INSERT into 235 (P0 #993 unresolved). Eight profiles with nonempty display names. No production DB verification or data writes.
- Code commit: `f85a4690f768d0724c94292f3ab4c64f49dae9e8`; only `frontend/src/components/p2p-transfer-modal.tsx` and new `p2p-recipient-race.test.tsx` changed in code. No backend/DB/app-api implementation changed; their existing route contracts were tested but this is not a complete new five-layer financial feature.
- Latest main `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` rechecked mid-work and before integration; unchanged. English/Korean living plans and integrated master reread. New isolated branch preserves #1026 and #1034 (potential future modal integration conflict), B/C/QA and Gemini refs.

## FINISHED (source candidate / RELEASE HOLD)
- Regression implementation complete at source level, but required full lint, full tests and security audit are failing on unrelated main-baseline issues. Exact-SHA remote CI and official Test pending.
- **No main merge, Test promotion, Production deployment, DB migration, balance mutation, branch deletion, or automation modification.** Rollback: keep Draft PR unmerged. If merged later, revert the P2P recipient-search UI commit after verification.
- Do not treat backend mock tests or development DB read-only integrity as authenticated exact-SHA finance E2E. Migration266 parity, least privilege, app-api auth, Test/Production ledger projection, backup+restore and GitOps gate remain BLOCKED.
- Final PR URL, final SHA, CI and branch/PR count will be appended to PR discussion after push.
