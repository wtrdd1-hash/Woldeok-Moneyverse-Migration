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
