# A2056 — exact-title public board QA (DRAFT / FAIL / HOLD)

- Code SHA before evidence: `7ac4998487a2c1b9232acabcea81939b3f657e97`; base main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. Exact final SHA must be rechecked after this report commit.
- Backend focused 20 PASS, Frontend focused 17 PASS (including malformed JSON, text/plain, duplicate IDs, provenance and empty responses). TDD RED evidence saved.
- Backend full limited workers: **2,986 PASS / 2 FAIL / 518 SKIP**; profile private HTTP tests return 401 rather than expected 200; pre-existing PR #2265. Backend suite FAIL.
- Frontend full `NODE_ENV=test --maxWorkers=2`: **2,941 PASS / 3 worker errors** (no asserted test failures; 3 unhandled worker start/exit errors). FAIL, not PASS. Earlier incorrect direct `vitest` invocation inherited NODE_ENV=production and generated 502 React.act failures; discarded as non-authoritative.
- Contract 41 PASS; DB unit 62 PASS / 5 SKIP. Android 184 endpoint schema regenerated EN/KO. `pnpm test` FAIL because Backend/Frontend suites not green.
- `pnpm typecheck` PASS; `pnpm lint` PASS with 0 errors/1,027 warnings before final code hardening; rerun after final SHA.
- `pnpm build` FAIL: Next static generation SIGSEGV. `MONEYVERSE_NEXT_BUILD_CPUS=1 NODE_OPTIONS=--max-old-space-size=1024` retry FAIL due to Rayon thread pool `Resource temporarily unavailable`. No build PASS claim.
- DEV PostgreSQL 17.11 read-only function query executed; zero WLD exact matches; `moneyverse_app` function EXECUTE true; direct `member_board_posts` SELECT true (least-privilege review needed, not proof of Production state). No migration/data mutation.
- `pnpm audit --audit-level=low`: 9 vulnerabilities (1 low, 8 moderate). Security gate FAIL.
- Official Test `/api/version` `abfbb8aee63393c9f58e72159bd5bcab06f99412`; Production `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e` at 21:16 KST. Neither is candidate. Official exact-SHA auth E2E and independent restore BLOCKED; no Test/Production changes.
- 275 remote heads / 253 open PR / 29 conflict at start; 277 remote heads / 254 open PR / 29 conflict at checkpoint; 18 remote non-main refs proven ancestors of main, preserved due to cross-task references. 0 deletions, 0 forced merges. Prior A #2526/#2494 and auth repair #2265 inspected, unique changes preserved.
- Evidence: `/srv/moneyverse-data/tasks/mv-a-20261102-2056-board-exact-title/evidence/`.
