# Test database lineage repair and exact-source release — v2026.10.17.753

**English canonical** | [한국어](TEST_DATABASE_LINEAGE_REPAIR_v2026.10.17.753.ko.md)
**Status:** TEST_VERIFIED for exact-source public Test, anonymous route smoke, read-only finance. **Production application promotion BLOCKED.**

## Authority and starting state
Authoritative PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, v523/542/543 ledger conservation, v530 authenticated UI QA and v713 release P0 remain in force. The original public Test v735.2 was bound to woldeok_moneyverse_v506_test, with 246 migration rows, 60 account balances and 96 auth sessions. Missing monetary policy and PvP tables caused public PvP GET HTTP 500. The separate public Production remained v717.

## Correct historical migration repair
The historical Test migration names 243-private-chat, 244-treasury-privilege and 245-runtime-maintenance conflict by number with canonical current main 243-treasury-security, 244-central-bank-mint and 245-auto-monetary. Original historical checksums and the public Test database were NOT rewritten.

A complete PostgreSQL 17.11 backup preserving source object ownership and ACLs was restored to a separate Test-cluster database wdmv_v753_test_acl. The first trial clone without ACL had correctly failed the application financial read test; broad direct grants were not used as a workaround. Balance 60 and session 96 deterministic row hashes equaled the original.

On the separate clone only, the legacy treasury_cast_citizen_budget_vote(uuid,text,text) function had no dependents but a conflicting named parameter. After controlled DROP FUNCTION RESTRICT, the canonical 243, 244 and 245 scripts passed. Canonical 248–272 then passed in strict order. The three actually applied canonical file checksums were recorded in addition to the three preserved historic names: 274 migration-history rows = 271 exact canonical files + 3 historic names. SHA256 parity across all 271 current files passed; no migration was marked applied without successful SQL execution.

The ACL-preserving Test clone had zero unexplained WLD, 60 account balances, zero unbalanced transactions, and no application DML grants on five protected money tables. The Test-only financial read-only gate reported READY_FOR_OTHER_RELEASE_GATES; this does not certify Production.

## Source-exact running Test and rollback
GitHub main application source SHA c2d4667b44c0222ed422cea2a59626a0a318face. An immutable Test release directory on the 200GB data filesystem was staged, with Nest backend, Next.js production frontend (590 static pages), exact frontend BUILD_ID and compiled internal workspace contract.

The 02:40 KST first cutover failed because the immutable directory lacked @moneyverse/contract/dist/index.js. The rollback restored the old Test release pointer and Build ID env, confirming v735.2 health. Compiling that dependency from exact source, and running the immutable package itself in a private backend canary, resolved the failure. The 02:43 KST second cutover succeeded: public backend/front SHA matched, public Test health 200, 11 representative anonymous routes five rounds (55/55 HTTP 200), PvP GET 200, anonymous room creation 401, public noindex, Test role finance preflight and exact runtime identity PASS. The scheduler remained disabled by the v752 single-leader safety rule.

Protected rollback artifacts are stored under /srv/moneyverse-data/backups/test-v2026.10.17.753-precutover/ (complete before and after DB snapshots and previous Test Build ID env files). The prior immutable Test v735.2 release and original Test database remain intact. Current operator DB selection is restricted to the Test service and does not change Production DB.

Main Test candidate CI run 38938140942 passed. Official GitHub Production IMAGE gate run 38942314503 passed preparation, exact public Test verification and image build. Neither is a running Production host cutover.

## Remaining nonwaivable boundaries
Existing real authenticated member/admin session-cookie and 2FA continuity, v530 all-route UI ×5, full Test feature transaction negative cases and rollback observation remain distinct from the 55 anonymous checks. Test crawler requests generated SeoService warnings due denied insert to seo_crawler_logs; fix through scoped command or safe no-op, not a broad financial/admin grant. Production still has 19 unverified account-vs-ledger projections, 5 unposted cash balances and direct app DML on 5 core tables. No Production host release, money/DB migration or feature flag was changed in v753.
