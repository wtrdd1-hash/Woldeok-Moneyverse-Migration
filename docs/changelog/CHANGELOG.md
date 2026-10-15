## v2026.10.15.690 — Treasury scoped read and payment safety (NOT PROMOTED)
- Read-only operator SQL 274, 11 legacy payout route holds, isolated Test role/invariant tests and backend 1217 / frontend 1218 PASS. Still no verified funding or deployment. [Release](../releases/v2026.10.15.690.md).

## v2026.10.15.684 — Core Treasury donation settlement in isolated Test (NOT PROMOTED)
- Added forward-only 273, idempotent WLD account-to-account donation receipt, guarded member API default OFF and wallet donation label. Real restored Test rollback successful; no approved finance policy, other P0 hold. [Release](../releases/v2026.10.15.684.md).

## v2026.10.15.683 — Scoped Treasury ledger proof and no fake public payouts (NOT PROMOTED)
- Forward-only migration 272 on isolated Test, operator-only reconciliation, two unsafe donation routines paused, 503 truthful public finance. Backend 1191/front 1211 pass; 391 DB tests skipped. Production code/schema untouched. [Release](../releases/v2026.10.15.683.md).

## v2026.10.15.682 — Treasury SWF emergency containment; Production code promotion BLOCKED
- Verified encrypted backup and disabled Production synthetic SWF via policy setting, no balances/schema altered; restored isolated DB exposed broken migration 269 donation and migration 271 read-ACL incompatibility. No code merge/Production promotion. [Release gate report](../releases/v2026.10.15.682.md).

## v2026.10.15.674 — Branch audit integration closure (no Production promotion)
- Docs PRs #846/#847/#849/#855 merged and their source branches deleted after exact SHA ancestry proof; CI/document gates passed. Test/finance/session/zero-downtime gates remain BLOCKED. [Detail](../worklog/2026-10-15-branch-ci-release-close-v674.md).

## v2026.10.15.673 — PR audit integration (docs only, BLOCKED)
- Merge #849 audit docs; preserve #846/#847 records in an isolated integration candidate, resolve v652 filename collisions. Test/finance/Production promotion remain blocked. [Notes](../releases/v2026.10.15.673.md).

## v2026.10.15.670 — Host release source-identity guard (candidate)
- Read-only systemd/Test preflight verifies release manifest, backend/frontend BUILD_IDs, compiled frontend build, running directories and public version against one approved SHA. Regression tests and bilingual runbook added. No Test/Production runtime, DB or member-money change. [Notes](../releases/v2026.10.15.670.md).

## v2026.10.15.652 — Production promotion gate (BLOCKED)
- Verified live Debian Test/Production source/version and DB roles after explicit promotion request. Test backend SHA does not match its manifest/frontend; Production version remains unknown; 237 public tables writable by app role and 11 publicly callable SECURITY DEFINER routines. No runtime promotion; full finance/UI/session/rollback acceptance is pending. [Release report](../releases/v2026.10.15.652.md).

## v2026.10.15.651 — Web functional stability audit (docs only)
- Independently confirmed six Production 404 routes, invalid candle-id 503, overbroad application-role DB privileges (241/245 writable public tables, 11 publicly executable SECURITY DEFINER functions), direct balance updates and an incomplete full-route QA gate. No running-system modifications or deployment. [Release notes](../releases/v2026.10.15.651.md).

## v2026.10.15.650 — Audited CI/PR integration (docs + Android signing)
- Integrated web audit PRs #841–843 and Android signing-security PR #27 following their successful CI. Fixed root documentation conflict-marker artifact on a separate CI/PR branch, retained #844/Android #23–25 acceptance blockers. No server or Play/Production deployment. [Release notes](../releases/v2026.10.15.650.md).

## v2026.10.14.618 — Integrated release candidate (verification only)
- Combined v606 fullstack, v606 SEO tools, v604 growth plan and two v605 audits; preserved conflicting historical update records. Regenerated 179-endpoint mobile API contract and fixed sitemap hreflang regression assertion. Local lint/typecheck/build, frontend 1,178 tests, backend non-DB 1,162 tests PASS (29 skipped). CI/PostgreSQL/Test and Production acceptance are still required. [Worklog](../worklog/2026-10-14-fullstack-branch-integration-v618.md).

## v2026.10.14.604 — Repository branch reconciliation, worktree pruning & discord bot keep-alive system

## v2026.10.14.605 — Comprehensive functional verification (docs only)
- Audited exact main c56af867; build/typecheck PASS, backend 1,162 pass/29 skipped, frontend 1,134 pass/35 failed, contract drift 3 files, dev migration gap 237/269, read-only GET 63. All-functional acceptance remains **BLOCKED**. [Full report](../findings/MONEYVERSE_FULL_FUNCTION_ACCEPTANCE_AUDIT_v2026.10.14.605.md), [worklog](../worklog/2026-10-14-full-function-acceptance-v605.md). No Production changes.

- Fully reconciled and deleted 70+ stale remote/local branches and worktrees across GitHub and production host.
- Built persistent Discord bot keep-alive architecture: uncaughtException/unhandledRejection crash guards, gateway shard auto-reconnect, 30s voice-state watchdog, and hardened 2s systemd restart policy.
- Enforced deployment Keep-Alive invariant preventing bot restart during frontend/backend promotions.

## v2026.10.14.603 — Source/security audit (docs only)
- Recorded SEC-603-01–14 against refreshed main 6be44719 and Android e24a2f8c. 3,890 tracked web files inventoried, 1,916 code/config scanned, no runtime changes. See [audit](../findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md) and [worklog](../worklog/2026-10-14-full-code-security-audit-v603.md).

## v2026.10.14.602 — Deep product strategy and live SEO evidence audit (docs only)
- Published EN/KO strategic assessment, 47-source external research register, live sitemap audit with 36 URL samples, DRAFT unadopted product direction, worklog, GitHub and internal update records. No application/Test/Production changes.


## v2026.10.14.600 — Reconcile planning/runtime authority (docs only)
- Distinguish observed Production v599, Test v541 and planning authority v530; record unresolved casino/treasury/API drift.
- Add bilingual authority notes, documentation catalog clarification, worklog, internal/GitHub update records. No release.

## 2026-10-13 Development A: outbound redirect credential isolation (PR #817 integrated)
- Added five regression scenarios and runtime safeguards against forwarding Authorization/cookies/API keys or request bodies to a different origin during outbound redirects; URL userinfo is rejected.
- Restored stock-depth type-only import and disposable CI database-name parity without editing any applied migration.

## v2026.09.23.390 — QA branch lifecycle cleanup hardening

- Branch: `fix/qa-branch-cleanup-v2026.09.23.390`.
- Fixed the merged-branch cleanup workflow so squash-merged PR source branches are deleted when the current branch head still exactly matches the merged PR head SHA.
- Branches that advanced after merge are retained, preventing deletion of new post-merge work.
- Cleanup still preserves branches without merged-PR evidence, even when their content happens to be contained in `main`.
- Manual repository hygiene pass reduced stale remote/local branches and removed clean patch-equivalent worktrees without deleting unique unmerged commits.

## v2026.09.23.383 — Caller-owned idempotency for asset overrides
- Admin cash/bank asset overrides now require a caller-owned UUID idempotency key instead of minting a replacement key inside the API.
- This makes timeout/retry behavior replay-safe at the HTTP contract while preserving the existing PostgreSQL ledger function and step-up authorization boundary.
- Added DTO regression coverage for missing and malformed keys.

## v2026.09.23.381 — Stock operator idempotency contract
- Manual price changes, market-event publication, and corporate actions now require caller-owned UUID idempotency keys.
- Existing admin clients already send these keys; schema, privileges, and ledger semantics are unchanged.

## v2026.09.22.367 — Unblock backend API completeness audit CI
- Fixed prefer-const CI blocker in backend API completeness auditor without altering audit semantics.

## v2026.09.21.322 — Migration authority fail-closed gate
- Production migration execution now rejects database-applied migration filenames absent from the exact repository checkout.
