## v2026.10.16.715 — Documentation PRs #878/#881 integrated; Production HOLD

## v2026.10.17.801 — Secret auction ledger safety containment (main merged)
- Halt new bids before SQL and prevent unjournaled auction settlement; preserve existing auction/log read paths, replace misleading bidder UI with maintenance status. Full local tests, build, typecheck, lint passed; 396 backend DB tests skipped. Production financial release gate still BLOCKED. PR #928 main `bd6cf172` merged after runtime CI and Test candidate image build success. No Test/Production application promotion. [Release](../releases/v2026.10.17.801.md).


- **v2026.10.17.796 — Marketplace appraisal ledger-first (candidate):** Atomic one-transaction fee and certificate, duplicate/insufficient protection; real disposable Test DB E2E passed. Official Test/Production unchanged; financial/UI gates open. [Release](../releases/v2026.10.17.796.md).

## v2026.10.17.791 — Reject mismatched frontend build in immutable staging (main merged)
- Read-only Test identity gate found Next artifact BUILD_ID drift despite 200/version/manifest agreement. Host staging now rejects an artifact whose Next build ID differs from approved SHA before creating a release. RED/GREEN; 56 release tests PASS. PR #923 merged main `92cb1582`; no Test/Production cutover. [Release](../releases/v2026.10.17.791.md).


## v2026.10.17.790 — Financial release gate rejects incomplete evidence (candidate)
- Prevent missing/malformed ledger/grant metrics and inconsistent WLD totals from producing false-green financial preflight. RED/GREEN tests; 55 release tests PASS. Read-only live DB remains BLOCKED (five app DML grants; 19 unexplained balance projections). No Test/Production app deployment. [Release](../releases/v2026.10.17.790.md).


- **v2026.10.17.786 — SEO background fail-closed (candidate):** Test/shadow outbound crawl and daily digest schedules disabled; explicit Production leader+job opt-in, initial-timer cleanup, 17 targeted tests pass. Production finance and UI release gates remain blocked. [Release](../releases/v2026.10.17.786.md).

## v2026.10.16.739 — Background SEO scheduling isolation
- Test and shadow no longer schedule public IndexNow submissions; production requires explicit indexing opt-in. Startup and periodic timers cleaned up, 4 focused tests PASS; Production verification pending. [Release](../releases/v2026.10.16.739.md).


## v2026.10.16.734 — Active host release identity gate, read-only
- Reconciles existing PR #886 onto latest main; live v717 Production and v721.2 Test identity 100% matched against active systemd generation. Release tests 29/29 PASS. No runtime rollout, balances or sessions touched. [Release](../releases/v2026.10.16.734.md).


## v2026.10.16.717 — Blog regional SEO and truthful editorial gate (LIVE in Production)
- 24 country-specific financial education editions with localized canonicals/hreflang and sitemap. Unsafe legacy financial autopublishing 403/503 fail-closed; 4 new negative tests. No schema or money mutation. [Release](../releases/v2026.10.16.717.md).

- Both ready docs PRs refreshed against latest main and passed classify/policy CI before merge. Source branches removed. Test/Production remain v712 SHA 142e36b5; finance/session exact-SHA release gates remain BLOCKED. [Release](../releases/v2026.10.16.715.md).

## v2026.10.16.714 — Discord music QA evidence reliability (PR #882 merged, Production HOLD)
- Repaired invalid Node.js QA tool, removed unproven ad-bypass claims, added bounded provider/daemon verification and 4 regression tests. Standard bot tests 8/8 and GitHub CI/candidate build PASS; merged PR #882, but exact-SHA Debian Test and Production acceptance BLOCKED. [Release](../releases/v2026.10.16.714.md).

## v2026.10.16.701 — Host capacity and PUBLIC definer containment
- Owned merged worktree cache cleanup recovered 2.44GiB without touching live releases. Production-schema shadow verified narrowly scoped PUBLIC SECURITY DEFINER EXECUTE removal and rollback; app explicit grants retained. Direct financial DML remains open. [Release](../releases/v2026.10.16.701.md).

## v2026.10.15.697 — Live Production blue-green promotion
- GitHub #874 merged to main; public backend/frontend exact source SHA a5a1e9da with persistent systemd and Nginx. Five public smoke passes, Production DB backup and isolated restore succeeded; no Production SQL migration. Remaining direct financial DML and missing full authenticated Production E2E remain tracked. [Release](../releases/v2026.10.15.697.md).

## v2026.10.15.696 — Public Test exact-SHA acceptance, Production HOLD
- Public Test v695 verified including authenticated session restart. v696 emergency monetary/auction containment candidate passed local tests and builds; Production ACL, migration, finance, release provenance remain blocked. [Release](../releases/v2026.10.15.696.md).

## v2026.10.15.695 — Isolated integration candidate (no production)
- #850 and #852 combined with limited v678 Treasury route build fix; local tests and Next build passed. Test identity, finance, session and release gates remain blocked. [Release](../releases/v2026.10.15.695.md).

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
