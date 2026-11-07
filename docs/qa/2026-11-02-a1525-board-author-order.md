# Development A QA — Public board author ordering (2026-11-02 15:25 KST)

**Disposition: DRAFT / RELEASE HOLD.** Not an authorization to merge or deploy. Candidate was branched from `a8541927c3a351d980454c66e95a3356c47e0722`, in isolated `auto/hourly-a-20261102-1525-board-author-order`.

## Scope and proof
- Added opt-in `sort=author` to `GET /api/v1/board/public/stock-posts`. Existing PostgreSQL `member_board_public_list_with_stock(50)` bounds the source before `ORDER BY author_name COLLATE "C" ASC, post_id ASC`. Existing stock/title filters preserved. Default two-argument service invocation and response remain unchanged.
- Next `/board` exposes keyboard-accessible GET controls and validates `sortApplied: author` even for empty results. No query is sent for an invalid selector. Author ordering is bytewise UTF-8, **not** locale-aware Korean 가나다순. Filtered page robots noindex, sorted fetch revalidate=0.
- Android `/app-api/v1/board/public/stock-posts?sort=author` rejects duplicate/invalid sort with 400; rejects missing proof, invalid/duplicate UUIDs, unverified ordering and oversized rows with 503; overrides upstream cache to no-store, noindex and no-referrer. Generated Android contract updated.
- No schema migration, table grant, finance ledger, wallet, identity, session, or Production mutation.

## Evidence and gates
- Test-first RED: 3 Backend failures; 3 Frontend files failing before implementation. GREEN: targeted Backend 18/18 after compatibility repair, Frontend 8/8, SSR 3/3.
- First full Backend run before compatibility repair: 2,980 PASS / 3 FAIL / 518 SKIP. One failure was a new two-argument mock regression; fixed and targeted rerun PASS. Other two profile HTTP 401-vs-200 failures are pre-existing and tracked in PR #2265. **Backend full suite must not be labeled PASS.**
- First full Frontend run: 2,929 PASS, 0 FAIL. Database 62 PASS / 5 SKIP. Contract tests 41 PASS. Typecheck PASS. Lint 0 errors, existing warnings. Backend/Frontend production build PASS (602 static/dynamic page entries); full lint 0 errors / 1,027 existing warnings; typecheck PASS; security policy/backup/release unit checks 20 PASS. Production-only dependency audit 0 known vulnerabilities/PASS; **full dependency audit 9 vulnerabilities (1 low, 8 moderate)/FAIL**. Full-route QA ledger check **BLOCKED**: `artifacts/qa/full-route-ledger.json` absent in this branch; do not count as PASS.
- Real PostgreSQL 17.11 `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app; ... ROLLBACK`: public function EXECUTE granted; actual public posts 1; author-order query EXPLAIN and execution PASS; synthetic 3-row collation order PASS. Existing P0 DEV role `account_balances` UPDATE and `user_items` DELETE both TRUE. This does not establish Production ACL state.
- Official Test exact candidate SHA, authenticated owner flow, independent backup restore, GitOps release gates and public Production runtime provenance are not green for this candidate. No deployment or rollback performed.

## Branch audit and preservation
- At START remote heads 235 (main included), open PRs 217, GitHub-reported conflicts 29. Midpoint open PRs 217/conflicts 29; main unchanged. Fetched tracking refs 241 include stale references; 14 refs verified merged, 226 unmerged in fetched set; do not equate these with live remote counts. All unique unmerged branches protected. Deleted 0; no forced merges. Other A/B/C/QA/Planning branches are untouched.
- Local evidence: `/srv/moneyverse-data/tasks/mv-a-20261102-1525-board-author-order/evidence/` (start/mid audits, RED/GREEN, full gates, PostgreSQL and release checks). Final PR SHA and end audit recorded in task evidence and PR comment.

**Rollback:** no runtime change; if later deployed, disable/hide `sort=author` controls and revert this optional query handling via a reviewed rollback release, without altering existing data or applied migrations.
