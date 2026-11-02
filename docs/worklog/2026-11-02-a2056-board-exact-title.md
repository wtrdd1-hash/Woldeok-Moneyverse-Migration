# A2056 — Public board exact-title discovery

## Before work
- Authority: `origin/main` `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b` (2026-11-02 20:56 KST), AGENTS.md, README.md, EN/KO living plans.
- Open PR audit: 253 open, 29 conflicting, 275 remote heads; existing board substring query supported, no exact-title PR discovered. Existing unrelated worktree is dirty; this branch is isolated.
- P1 product scope: allow an exact case-insensitive title match among the latest 50 publicly visible board posts, optionally scoped by stock. Do not claim archive-wide search.
- SQL remains the existing parameterized `SECURITY DEFINER` public list read model. No migration, ledger write, grant or session change.
- Strict request validation, provenance marker for exact results (including empty), Android fail-closed gateway, private noindex query results, web accessible selector.
- Rollback: omit `match=exact` or revert this isolated commit. Production release HOLD until all gates pass.

## In progress
- [x] RED recorded: Backend 2 failed / 18 passed; Frontend 4 failed / 9 passed.
- [x] Implemented backend SQL/HTTP, web selector/provenance and Android fail-closed proxy. GREEN focused verification pending final rerun.
- [ ] Recheck latest main/plan; test, typecheck, lint, build, DB read-only, CI; record evidence and blockers.

## Finished
- Pending verification; do not merge or deploy without exact-SHA official Test and GitOps gates.

## Midpoint
- `origin/main` re-fetched at 21:00 KST and remains `305d7c7f`. Other developers' dirty worktree untouched.
- First implementation had an unterminated SQL template and a legacy controller call arity regression; both corrected before further verification.

## Verification checkpoint (21:06 KST)
- Focused tests: Backend 20 PASS, Frontend 17 PASS, including RED-to-GREEN malformed JSON fail-closed.
- Typecheck PASS, lint 0 errors/1,027 warnings. Full build failed at Next static generation (SIGSEGV), not claimed PASS.
- `pnpm test` initially BLOCKED at generated Android contract drift; regenerated EN/KO schema and JSON, to commit before rerunning.
- DEV PostgreSQL read-only `member_board_public_list_with_stock(50)` exact query executed, 0 matching WLD titles; function EXECUTE=true. DEV direct `member_board_posts` SELECT=true remains a least-privilege finding, not a production assertion.
- `pnpm audit --audit-level=low`: 9 findings (1 low, 8 moderate), release HOLD.
- Main re-fetched, no advance at checkpoint. No Test/Production mutation.
