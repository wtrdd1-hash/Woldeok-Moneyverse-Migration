# A — Public board reply-presence filter: QA (2026-10-31)

## Source and scope
- Canonical main checked start/mid/pre-integration: `1a3625f3c5e426c857e2b44a412d7949ac4a6257`.
- Code candidate SHA: `510752cba2e798e08e6df19d93ae144d33ba5fc4` (final documentation commit SHA recorded in PR).
- Draft PR #2170. Backend public controller/service + existing PostgreSQL `SECURITY DEFINER` function + Next.js public board + Android app-api. Only latest 50 public posts; filter `replies=all|with|without` and combine stock/title. No new migration or grants.
- Test-first commit `6502a8bd76ca1e8da98d85e4a1c6ab99f92131c2`. A compiled preimplementation runtime smoke failed on `replies=with` (HTTP 400), establishing a meaningful RED. Subsequent compiled candidate runtime smoke passed. Early Vitest RED attempts were blocked by host process limits, not claimed as assertion failures.

## Verified
- Backend compiled runtime smoke PASS: with/without/all, materialized latest-50 SQL, combined filters, invalid/duplicate HTTP refusal. Backend TypeScript typecheck PASS, backend Nest build PASS.
- Frontend focused Vitest: 75 PASS across board parser and Android app-api; changed-file ESLint PASS; frontend TypeScript typecheck PASS.
- Read-only real development PostgreSQL 17: `member_board_public_list_with_stock(integer)` exists, is SECURITY DEFINER, `moneyverse_app` has EXECUTE. The exact materialized query parsed and executed. Latest 50 public sample: 1 total, 0 with replies, 1 without. No row contents, user identity, or financial balances returned; no writes or schema changes.
- Android rejects duplicate/malformed reply filters and mismatched HTTP 200 responses, sets no-store/noindex on filtered results. Web search form labeled with 44px touch target and noindex filtered metadata.
- Previous code SHA `2dcb13081328967e908d9dbf33ae282040a72507` GitHub CI: lint, typecheck, build and migrations PASS; tests 3408 PASS / 2 FAIL / 107 SKIP (2 failures in changed board tests). Root causes: existing mock expected 2 rather than 3 arguments; duplicate-filter test was parameterized incorrectly. Both fixed at code SHA `510752c...`; new exact-SHA CI and candidate image workflow required before any green claim.

## BLOCKED / failures
- MiniPC `moneyverse-mcp.service` cgroup at 1016/1027 tasks (P0 issue #2171): intermittent `EAGAIN`, SWC Rust thread spawn failure, local Next build spawn failure. Full local frontend Vitest timed out after 150s without a summary. Backend Vitest worker startup BLOCKED. No local full-suite PASS.
- Isolated clean PostgreSQL migration chain and authenticated exact-SHA official Test E2E NOT VERIFIED for this candidate. Existing app role direct SELECT on `public.member_board_posts` observed in DEV; no grant added or revoked (see P0 ACL issue #993).
- Production provenance mismatch (issue #1984): public backend `95485a299885693e3becb694dfc36ad45e832f97`, frontend timestamp-like `1793422036848`; backend/frontend process CWDs point to deleted v1515 release. Official Test backend/frontend `32c737a782b15fa1ae1d41dc243a7ffcd5bbdf9d`, not candidate.
- Independent backup restore, production image/digest, auth/login smoke, GitOps promotion and rollback gates BLOCKED. No merge/deploy.

## Branch/PR audit
- Before own branch/PR: 96 remote branches, 87 open PR. After creation: 97 total (96 non-main), 88 open (87 Draft); 8 conflicting PR, 31 PR with failing/cancelled checks, 88 unique open PR head SHAs. 89 non-main branch heads unmerged/diverged, 6 ancestor of main, 1 unavailable object; 0 duplicate branch head SHA groups. UNKNOWN and unique work preserved; even ancestor branches retained pending ownership and PR verification.
- Branch deletion 0; main merge 0; Test/Production deploy 0; process restart 0; production DB writes 0; ledger movement 0; rollback 0.
- Source paths changed: 9 code/test paths (including preexisting board HTTP test) plus 3 planning/worklog paths; this QA and release evidence are additional docs. Full `git diff --name-only` is authoritative.
- Status: **P1 CODE IMPLEMENTED / TARGETED PASS / REAL DEV PG READ-ONLY PASS / FULL CI PENDING OR FAIL / PRODUCTION HOLD**.
