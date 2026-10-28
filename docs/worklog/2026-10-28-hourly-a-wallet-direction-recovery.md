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
