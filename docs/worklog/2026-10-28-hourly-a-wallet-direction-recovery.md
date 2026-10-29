# Development A — Wallet direction filter recovery (2026-10-28 10:25 KST)

## BEFORE WORK
- Latest main: `a28bed9aa40ff74d492824ae12892a7d52132fdd` (re-fetched immediately before worktree creation).
- Source: previously closed without merge PR #1647, protected head `ed5289f3cabb28fd00c863c96ae5cb1358356920` and recovery ref `refs/moneyverse-recovery/2026-10-28/1647`.
- Incident #1663: 352 unique/unmerged PR heads locally preserved. No remote cleanup, PR closures or branch deletions authorized.
- Existing main lacks member wallet direction filtering. Recover only the verified feature delta into a fresh isolated branch; never overwrite concurrent A/B/C/QA/Gemini changes.
- English integrated plan is canonical; Korean plan is companion. AGENTS/README and recent QA reviewed.
- Invariants: authenticated owner-only ledger function, server-side filter BEFORE limit, signed integer-string precision, exact app-api parity, no schema/ledger mutation, no-store.
- Acceptance: RED-GREEN tests; focused backend/frontend/app-api; full lint/typecheck/build/unit/integration/real-PG/security/accessibility/SEO/E2E; exact-SHA Test and GitOps before merge/release. Block on any missing gate.

## IN PROGRESS
- [ ] RED: transplant original tests only and observe baseline failure.
- [ ] GREEN: transplant original implementation, reconcile latest main, review.
- [ ] Re-read latest main and EN/KO plans mid-work and before integration.
- [ ] Verify exact SHA, CI, official Test; record blockers honestly.

## FINISHED
- Pending.

### RED checkpoint 10:24 KST
- Test-only original PR #1647 patch applied; baseline Backend wallet period **5 FAIL / 3 PASS** after building contract (first attempt lacked contract build), Frontend wallet period **1 FAIL / 3 PASS**. Failure is missing direction selector and fourth SQL bind, not environment after retry.
- No runtime implementation yet. Test logs in miniPC reports. Other agents' worktrees untouched.

### GREEN and concurrent-change reconciliation checkpoint
- Transplanted only PR #1647's six runtime files, not stale repository snapshots. Conflict in Android app-api cache boundary resolved by UNION: wallet + bank + banking + chat + content/chat all remain private/no-store.
- Backend wallet focused 8/8 PASS; Frontend wallet + Android app-api focused 30/30 PASS. No ledger writes or migrations.
- Mid-work remote main still a28bed9aa; EN/KO integrated plan hashes unchanged.
- Awaiting isolated real PostgreSQL, full gates, CI, exact-SHA Test.

## FINISHED — source implementation; integration HOLD
- [x] RED and GREEN TDD checkpoints, SQL before LIMIT, integer-string precision, owner scoping and Android cache boundary.
- [x] Original #1647 unmerged head verified against recovery ref; no destructive cleanup.
- [x] Mid-work and pre-integration latest main/EN+KO plans re-read (unchanged a28bed9aa).
- [x] Isolated PostgreSQL 17.11 synthetic owner/ledger 2 PASS; ephemeral container removed.
- [x] Backend 1,930 PASS / 442 SKIP, DB 45 PASS / 3 SKIP, Bot 11 PASS, Frontend 1,866 PASS / 1 FAIL (unchanged admin blog test).
- [x] Full lint 0 errors / 1,102 warnings on retry; typecheck, contract, backend and Next builds PASS; root+bot high+ audit PASS.
- [ ] Aggregate root test: TIMEOUT after 310s; no PASS.
- [ ] Official Test exact-SHA authenticated E2E, full real DB ACL, independent restore, accessibility/SEO browser audit, GitOps release: BLOCKED.
- P0 incident #1663, Test release symlink target missing, Production public version unknown; no merge or deployment.
- Branches/PRs: 10 live remote heads incl main, 8 open PR before new PR; 352 recovery refs. Deleted 0; all unique/unmerged preserved. Rollback not triggered (no Test/Production change).
- See paired docs/qa/2026-10-28-a1025-wallet-direction-recovery[.ko].md and miniPC report logs.
