# Worklog — v2026.10.22.1109 wallet owner pocket delta read projection

**Start:** 2026-10-22 10:08 KST, origin/main `27a73acb248b5eb4b86cbb86284de0cc4e86e52a` fresh fetch and integrated plan/policy read. Isolated `fix/wallet-pocket-read-projection-v2026.10.22.1109` worktree. CI #2878 and local backend 4 wallet failures reproducible; other worktrees/Gemini unmodified. MiniPC start log: `/srv/moneyverse-tasks/Moneyverse-Wallet-v1109-START.md`.

**Mid:** RED 4/4 in `wallet-pocket-deltas.test.ts`, log `wallet-v1109-red.log`. Added signed owner-scoped ledger read SQL aggregation per USER_CASH and USER_BANK, returning cash_delta/bank_delta without changing any financial account/ledger data. Service exposes pocket amounts if actual read model supplies a complete pair, rejects partial/noncanonical/mismatched values via exact BigInt. GREEN 4/4, focused 27/27, full backend **1,283 pass, 397 DB skipped**, Nest backend typecheck and build pass; no DB role or money-changing SQL. Logs: wallet-v1109-green/focused/backend-full/tsc/build.

**Release acceptance:** No actual finance transaction or Production/Test rollout in this patch. CI, exact Test SHA, session/admin, complete financial safety and rollback gates remain required. Separate wallet PR should merge before rebasing blog PR #986; no force/skip of failed checks.
