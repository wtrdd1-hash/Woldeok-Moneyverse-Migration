# QA — A2025 Public Board Stock-Name Search (2026-11-02, RELEASE HOLD)

## Scope and provenance
- Canonical `origin/main` at start and mid: `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; separate `auto/hourly-a-20261102-2025-board-stock-name` worktree. Implementation SHA `c09db875f4aa33b15b4e4d1b53bed32aab2d63b3`; lint repair SHA `b7385d0106183375dc1cc74392649994a0b79279`. Final documentation SHA is recorded in PR #2526.
- No migration, table grant, ledger mutation, idempotency write, privilege increase or Test/Production change. Existing public read function provides a bounded 50-row source; the name substring is applied by parameterized SQL. Literal `%` and `_` are not SQL wildcards.
- Backend allowlist and HTTP 400; accessible Next form; SSR and Android require `stockNameFilter` + `sourceWindow:50`, verify returned row stock names and UUID uniqueness, reject legacy success-shaped empty results and unprovable HEAD. Existing unfiltered response remains `{posts}`.

## Executed evidence (task evidence directory)
- RED observed before implementation: Nest 7 failed / 4 passed; frontend 4 failed. After implementation, focused Nest service/controller/HTTP integration **31 PASS**; frontend SSR/Android **9 PASS**.
- Root `pnpm test` on implementation SHA: policy/contract/database phases reached; Backend **2,997 PASS / 2 FAIL / 518 SKIP**. Both failures are existing `profile-private-response.http.test.ts` (expected 200, got 401); existing repair PR #2265. Root command FAIL and does not certify frontend.
- Frontend standalone on lint-repair SHA: **2,945 test assertions PASS**, but **one unhandled Vitest fork worker exit**, so suite **FAIL**. Separate focused tests PASS. Re-run with bounded worker concurrency is required; do not count this as full PASS.
- Typecheck PASS; Backend+Frontend build PASS; lint after local fix **0 errors / 1,027 pre-existing warnings**; mobile contract check PASS (184 endpoints); DB unit 62 PASS / 5 SKIP; contract unit 41 PASS.
- Supply chain: `pnpm audit --prod --audit-level low` PASS (0 known); full audit **FAIL** (1 low, 8 moderate). No silent exemption.
- DEV PostgreSQL 17.11 READ ONLY as `moneyverse_app`: `member_board_public_list_with_stock(50)` EXECUTE PASS; 1 public post, 0 name matches for `제주`. Positive multirow real-data proof is NOT available. DEV ACL **P0 FAIL**: app role has `user_items` DELETE and `account_balances` UPDATE; Production ACL unverified.
- Public edge probes at 20:40 KST: official Test backend/frontend `abfbb8aee63393c9f58e72159bd5bcab06f99412`, Production backend/frontend `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`; neither matches candidate. Both public `/api/treasury/overview` returned HTTP 200, conflicting with release HOLD gate requiring HTTP 503.
- Exact candidate Test auth/user-flow E2E, independent restore, full security/accessibility/SEO live audits and GitOps promotion proof **BLOCKED**. Build/lint/unit checks do not substitute for these.

## Repository audit and disposition
- At start: 277 remote refs (as counted locally), 258 unmerged; 250 open PRs. Mid: 278 remote refs, 259 unmerged, 251 open PRs (29 conflicting). Other branches/PRs contain unique work; **0 branches deleted**. Existing overlapping A PRs are protected.
- **Release HOLD**: no main merge, Test/Production deploy, service restart, Production DB write or rollback. Rollback is not needed because no deployment occurred. Preserve Draft PR #2526 until all gates independently pass.

## Follow-up exact-documentation-SHA verification (20:45–20:50 KST)
- On SHA `20e91722c4eb4970b36fa66a47342a4a006075c7`, frontend Vitest with bounded workers `--maxWorkers=2`: **560 files / 2,947 tests PASS, 0 unhandled errors**. The earlier default-parallel worker crash is a test-runner resource issue, not a remaining failing assertion. Default `pnpm test` on this SHA encountered a database Vitest worker `EPIPE` before reaching backend; it is NOT PASS.
- Independently on that SHA with bounded workers: policy 34 PASS; database 62 PASS/5 SKIP; contract 41 PASS; backend **2,997 PASS / 2 FAIL / 518 SKIP** (the same profile auth 401 failures). Thus the complete application gate remains **FAIL** even though the frontend suite passes.
- Latest main unchanged `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; latest observed open PR 253, remote refs 280, unmerged 261, conflicts 29. No branch deletion or integration.
- The subsequent final QA-only commit does not change application code; its exact SHA and final CI state will be recorded in PR #2526 and host evidence.
