# v2026.10.31.1546 — Admin sovereign wealth fund evidence restoration

Status STARTED; separate miniPC worktree, from current origin/main 65193a0940778ac659e4d4952589ee49c291c30f; no Production or financial DB modifications.
## START: user screenshot incident
- User mobile screenshot easy-scraping.com/admin/treasury displays "국부펀드 관측 정보를 검증할 수 없습니다" while public Treasury remains 503 fail-closed. This means missing admin SWF evidence, NOT zero investments.
- Review authority: AGENTS.md, DOCS_INDEX.md, docs/DOCUMENTATION_POLICY.md, docs/planning/PROJECT_PLAN.md, docs/planning/INTEGRATED_PLANNING_MASTER.md, docs/RELEASING.md, and previous v1541–v1545 release operations. Another agent may work concurrently, avoid all shared main edits.
- Read-only actual Production DB: SWF 1 config, 4 portfolios, 270 events. moneyverse_app cannot SELECT protected SWF base tables but can EXECUTE public.admin_swf_snapshot(uuid), a SECURITY DEFINER actor/approver-protected function installed by migration 300.
- Actual AdminTreasuryController GET swf calls service.getConfig/getPortfolios/getRecentEvents directly (now forbidden); existing service.getAdminSnapshot(actorId) uses malformed SQL admin_swf_snapshot(::uuid) instead of $1::uuid. This is an actual source regression and can explain screenshot.
- Plan: tests RED, change controller GET swf to require verified session user ID and return actor-scoped DB function; fix binding placeholder; test 401/403 and no raw-table SELECT. Preserve fail-closed 503 on missing/unverified source; no extra table grants or WLD writes. Verify miniPC full targeted/backend checks, isolated Test with authenticated role and then branch CI + production promotion using immutable exact SHA and current release records. No replacing runtime in-place.
## MID/FINISH
PENDING.

## MID — scope extension, user requested all related functions
Admin SWF config PUT also writes protected base tables directly; production app role has UPDATE=false on configs and INSERT=false on events. This is a second functional defect beyond GET. Develop a narrow SECURITY DEFINER governance-only writer with actor approver check, bounded inputs, atomic audit event, and without changing asset balances, ledger postings, or autonomous SWF executions. Backend PUT must require session+AdminGuard+CSRF; Next BFF must call server-only mutate after same-origin verification. All staged on isolated branch, no Production DB DML before live rollout verification.

## MID — scoped audited governance policy extension
- Owner requested complete functionality: production moneyverse_app cannot UPDATE treasury_swf_configs or INSERT treasury_swf_events. Existing save button was guaranteed to fail even once GET was repaired.
- Added migration 313 with a narrowly parameterized SECURITY DEFINER admin_swf_update_config: role approver/superadmin check, exact numeric reserves and capped percentages, row lock, atomic policy update + non-monetary audit event, no ledger/account/portfolio writes, original table grants still revoked.
- Backend PUT requires authenticated actor and CsrfGuard, calls only parameterized scoped function, maps PG 42501→403; server-only Next BFF uses mutate() CSRF and rejects cross-origin submissions and unverified response. Backend tests 11/11 and frontend policy tests 3/3 PASS.
- Before any production migration, apply migration ONLY to already independently restored actual official Test clone wdmv_v761_test_acl_v1544_restore and prove rejected actor, successful bounded policy change, rollback, original Test/Production row counts unchanged.

## MID / FINISH — source and isolated data verification
- Initial TDD RED: 3 failures showed malformed positional SQL and controller raw-table access; after repair actor-scoped GET 6/6 and wider Treasury backend 141 PASS, 18 DB-dependent SKIP, frontend Treasury 27 PASS.
- Added verified governance-only security migration 313 with retained direct table denies, authorized actor, bounded numerical precision, single-transaction audit, no ledger/account/market mutations.
- Read-only actual Production moneyverse_app executes existing snapshot: config 1, 4 holdings, latest 20 of 270 events, frontend exact evidence validator accepted; non-approver rejected 42501.
- Applied migration 313 only to restored official Test database clone. Actual Test moneyverse_app role successfully updates governance inside a rolled-back transaction with zero-WLD audit and exact 16-digit WLD string; after rollback config and events are identical to originals; unknown actor rejected 42501 and fractional WLD rejected 22023. Production DB and original Test DB untouched.
- Combined backend governance unit+DDL 13 PASS, Next BFF policy origin/CSRF/evidence 3 PASS. Workspace typecheck PASS; touched backend/frontend ESLint no errors. Source CI, exact SHA official Test and Production code rollout still required; source work must not be called deployed until those pass.

## FINAL QA fixture correction
Adding CsrfGuard to the Treasury config route initially exposed 3 Nest HTTP test modules lacking mock SessionRepository. These suites are about SWF liquidation and Treasury pagination, not CSRF authorization. Isolated test fixtures now override CsrfGuard with a mock while production guard stays mandatory. Treasury suite final 144 PASS, 18 DB-only SKIP, 0 FAIL across 21 passed files; frontend Treasury suite 30 PASS, 0 FAIL; release scripts 122 PASS; workspace typecheck and touched lint 0 errors. Exact-SHA CI/Test/Production not yet executed.

## Late E2E finding / v1546.1
- Constructed a new wholly disposable PostgreSQL Test database and a short-lived synthetic approver + session; zero Production/real Test users or financial writes. Initial signed-in backend SWF GET 200, frontend BFF GET 200, missing CSRF 403, backend policy PUT 200. Frontend BFF PUT 403 code SWF_ORIGIN_DENIED under TLS-terminating Nginx because comparing browser HTTPS Origin to private HTTP Next request.url is wrong.
- Fixed Next BFF origin fence to compare against trusted configured APP_BASE_URL (public HTTPS), NOT proxy loopback origin or client-controlled X-Forwarded headers. Added regression test for HTTPS behind internal HTTP; frontend origin/CSRF tests 7/7 PASS. Prior exact SHA 248ab is now superseded; code must be rebuilt under a new exact SHA.
- Disposable Test clone restored with --no-privileges unexpectedly lacked original Test auth_sessions SELECT (real official Test has it); HTTP session path returned 500 in test environment even though DB snapshot worked. Taken SHA-private Test original ACL source and restored its 600 ACL/default privilege entries transactionally to both disposable smoke and currently migrated official Test clone ONLY, then confirmed app auth_sessions SELECT true, SWF original raw tables still false, migration 313 writer EXECUTE true. Original Test and Production DB ACL unchanged.
- Synthetic actor auth produced append-only audit_logs foreign key constraints; do not delete/alter immutable logs. Disposable smoke DB must be dropped after final E2E, rather than deleting user/audit records. No signed-in Production evidence claimed.
