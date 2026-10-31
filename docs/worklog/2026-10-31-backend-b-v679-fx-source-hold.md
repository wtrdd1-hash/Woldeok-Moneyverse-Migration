# Backend B v679 — Public FX source-truth hold

## Before work — 2026-10-31 08:05 KST
- Starting main SHA: 761a55a094fb9dd383d213e817305e68c79fa23c
- Branch: auto/hourly-b-v679-fx-public-source-hold-20261031-0805
- Worktree: /srv/moneyverse-data/tasks/mv-b-v679-fx-public-source-hold-20261031-0805
- Scope: P1 #2111 public FX 500 on DB ACL, unverified stale seed rates. Development C v1215 owns UI; do not edit C files.
- Root cause: public portal fans out to direct SQL table SELECTs that the app role cannot access, while rate methods synthesize fallback and/or treat stale seeded observations as current. No authoritative source/provenance is recorded in FX schema.
- Approach: TDD for fail-closed public reads and no fabricated spot/forward rates. Preserve financial mutation holds; no SQL grants, migrations or production DB writes.
- Checkpoints: [ ] RED; [ ] GREEN; [ ] full gates; [ ] main recheck; [ ] PR/HOLD; [ ] exact-SHA Test (expected blocked unless gates pass).

## In progress — 2026-10-31 08:09 KST
- TDD: seven focused source-truth tests were RED (6 failed, 1 passed) before the fix, then GREEN 7/7; existing FX focused tests 10/10 PASS.
- Nest HTTP 2/2 PASS with 503 `fx_source_unverified`, `Cache-Control: no-store`, no synthetic rate and no service call. The test module overrides unrelated guards, not an authenticated production E2E.
- Existing FX financial mutations remain blocked; DB ACL #2111 remains unresolved and is not bypassed by broad grants.
- Full mandatory gates and isolated PostgreSQL evidence pending.

## Finished candidate validation — 2026-10-31 08:17 KST
- Initial code SHA: `decdd9235c9100b85bc8e8b660aa431884213cb6`. Main unchanged `761a55a094fb9dd383d213e817305e68c79fa23c` at mid/end recheck.
- Full lint PASS (0 errors, 1,049 warnings); typecheck PASS; full backend build and frontend Next build PASS; mobile API contract 184 PASS; production dependency audit 0 known vulnerabilities; release test command PASS.
- Full backend test 2,787 PASS / 501 SKIP; frontend test 2,770 PASS. Focused FX 17 PASS, Nest HTTP 2 PASS. Skipped DB tests are **not** integration PASS.
- Isolated network-none PostgreSQL 17.11: 311 migrations 002..312 applied; app-role SELECT privileges on `foreign_exchange_reserves` and `foreign_exchange_rates` both FALSE; direct app-role SELECT correctly failed with `permission denied for table foreign_exchange_reserves`. Temporary container removed. First startup attempt encountered the Postgres initialization restart; clean retry PASS.
- Read-only official public probes: Test SHA `c2129625aa6629c616fb31ce790950618b8d92b2`, `/api/v1/fx/portal` HTTP 500, `/api/v1/fx/forward/rates` HTTP 500; Production SHA `bf8d0d48f810932b43783d8605dce53954c60cff`, both endpoints HTTP 200 with reserve `updatedAt=2026-10-07T06:04:59.131Z`. Neither environment runs the candidate SHA.
- Draft/HOLD PR #2114 created; issue #2111 and C handoff #2108 updated. No migrations, broad grants, shared DB writes, finance/ledger mutations, merge, Test deployment, Production deployment, rollback or reservation changes.
- Remote CI runtime-check and Test candidate build were pending at this checkpoint. Exact-SHA official authenticated Test E2E, independent recovery and release gates BLOCKED; release remains HOLD.
- Follow-up: independently verifiable FX source/provenance and narrowly scoped SQL read function in reviewed migration stack, then coordinated C UI and exact-SHA authenticated Test.
