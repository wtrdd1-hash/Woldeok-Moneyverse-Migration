# Internal update — C v1261 — Stock depth source truth

- Source: main f13bbce27; mid-run main 561b78e74. Isolated auto/hourly-c-stock-depth-truth-v1261-20261101-1346.
- Provenance: simulated order depth and recent trades had no live database-backed producer; market-broadcast publisher only has test callers.
- Implemented: Nest 503 source-unverified endpoint, Next no-store fail-closed proxy, accessible responsive quote-only view, removal of fabricated trade toast.
- Tests: backend 56 PASS; frontend 14 PASS / 1 FAIL (quote formatting) corrected; rerun resource BLOCKED. Await exact-SHA gates.
- Production/Test/ledger/DB: untouched. Release HOLD.
