# Release decision — A2325 public board author search

**HOLD — do not merge or promote.** Draft PR #2393; implementation and contract SHA `a70db033e7f0a018e4ac5f23f0ecda2984ded39f`; final documentation SHA must be rechecked after the closeout commit.

Local Backend 2,981 PASS / 518 SKIP, Frontend 2,910 PASS, DB 62 PASS / 4 SKIP, build/typecheck PASS, Android API contract PASS, lint 0 errors, DEV PostgreSQL read-only positive/negative filter PASS. These do not certify official Test.

Blockers:
1. P0 #993: DEV `moneyverse_app` direct board SELECT, balances UPDATE, item DELETE violate least privilege. Production ACL unverified.
2. Official Test serves `e39af10f6a876f56b40b7e5a070cdb3dcb61d699`, not the candidate. Exact-SHA Test backend/API/DB/auth/author user flow and authenticated E2E NOT RUN.
3. Production backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, frontend `1793450413898` (timestamp, not SHA). Release executable identity, independent backup restore and rollback rehearsal unverified.
4. Final GitHub CI and candidate image checks not yet certified green; release workflow/GitOps gate not authorized.

No main merge, staging, Production, migration, ledger mutation, restart, branch deletion or rollback. Rollback is code revert/disable of this optional read-only filter only after authorized integration; no schema rollback is required. Other PRs and all unmerged branches are preserved.
