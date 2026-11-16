# v2026.11.17.7 — Official Test KDIC read-only schema recovery

**Status:** BEFORE / TEST ISOLATION, NO PRODUCTION DATA MUTATION

## BEFORE — 2026-11-17 08:08 KST
- Owner explicitly approved unresolved functionality resolution through gated Production promotion.
- Reviewed origin/main cd822aa098d16a6f8bbfa5e41cf721eb1594e767, docs/planning/PROJECT_PLAN.md, INTEGRATED_PLANNING_MASTER.md, AGENTS.md, docs/DOCUMENTATION_POLICY.md and docs/RELEASING.md.
- Production Nest :4500 KDIC public portal GET is real DB-backed 200; official Test Nest :3100 same URL is 500.
- Independent read-only PostgreSQL queries: Production KDIC read functions public.kdic_read_fund_v1743() and public.kdic_read_institutions_v1743() exist; official Test woldeok_moneyverse_ci has neither functions nor deposit_insurance_funds/insured_institutions tables (119 MB DB, 152 public tables).
- Existing migrations 257 (KDIC table creation plus explicit 2-institution/10m WLD Test fixture seed) and 335 (SECURITY DEFINER no-write scoped KDIC readers) are in canonical GitHub main. Do not invent a second schema.
- Test credentials stay private and no server environment files printed. Take isolated Test DB snapshot, restore into separate scratch Test DB, test 257+335 and ACLs without Production writes before considering official Test changes. No automatic full Production promotion.
- Live Nginx emergency finance release hold v2026.11.17.6 remains in place.
## MID — 2026-11-17 ~08:11 KST
- Initial Test CI default database woldeok_moneyverse_ci was inspected, snapshotted, cloned and migrations 257+335 tested. Later exact systemd process environment revealed that official Test uses DIFFERENT database wdmv_v761_test_acl_v1544_restore on Test PostgreSQL port 5585; no migrations were applied to the wrong CI default DB. Do not confuse clone preflight with official Test success.
- Read-only actual Test DB catalog showed existing KDIC fund/institution base tables but missing all four scoped read functions from migration 335; actual Test service /api/v1/kdic/portal was 500, while Production Nest canonical endpoint was 200.
- Took independent restricted 0600 pg_dump -Fc of actual Test DB: 21,932,123 bytes SHA256 b140de45a7c16e5c8aa425fc54fbce2b78fa3dc2c5ac81ec68732851f19bd419, directory /srv/moneyverse-data/tasks/kdic-schema-test-recovery-v2026.11.17.7.
- Restored this 241MB Test DB into separate scratch DB wdmv_v761_kdic_21117, applied canonical existing 335 migration SHA256 a80599820b6c3cd0615e70a43becd3b029ef12c33c0c895e72e5c8107530d6 successfully.
- Checked Test app role: no direct SELECT on KDIC tables, scoped read functions EXECUTE allowed; read-only function calls yielded one fund and two insured institutions. Production DB not used or changed.
## CLOSE — 2026-11-17 ~08:14 KST
- Rechecked main source cd822aa098d16a6f8bbfa5e41cf721eb1594e767 and official Test DB absence of functions; validated snapshot hash and migrated only official Test PostgreSQL DB wdmv_v761_test_acl_v1544_restore with canonical, existing read-only 335 script.
- Official Test service was NOT restarted. Direct Test backend :3100 and public https://test.easy-scraping.com/api/v1/kdic/portal changed from HTTP 500 to 200. Anonymous admin KDIC overview remained HTTP 401; official Test homepage and /api/version remained 200.
- PostgreSQL Test moneyverse_app still has NO direct KDIC financial table SELECT; SECURITY DEFINER readers only. No ledger postings, transfers, financial payouts or Production data changes.
- This is Test infrastructure/schema readiness, not exact candidate full application promotion. No fake production success claim; current Test may still have other release blockers and positive admin-session E2E not yet done.

GitHub review / 검토 기록: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3224
