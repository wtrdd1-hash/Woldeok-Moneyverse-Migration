# Internal update — C v1261 — Stock depth source truth

- Source: main f13bbce27; mid-run main 561b78e74. Isolated auto/hourly-c-stock-depth-truth-v1261-20261101-1346.
- Provenance: simulated order depth and recent trades had no live database-backed producer; market-broadcast publisher only has test callers.
- Implemented: Nest 503 source-unverified endpoint, Next no-store fail-closed proxy, accessible responsive quote-only view, removal of fabricated trade toast.
- Tests: backend 56 PASS; frontend 14 PASS / 1 FAIL (quote formatting) corrected; rerun resource BLOCKED. Await exact-SHA gates.
- Production/Test/ledger/DB: untouched. Release HOLD.

## Closeout / release hold
- Draft PR #2322. Main advanced to 143190d38; branch rebased without overlap. Exact post-closeout SHA in PR.
- Targeted: frontend 15 PASS, backend 56 PASS; lint 0 errors/1020 warnings; typecheck PASS. Full build frontend timed out at 200s; full frontend EPIPE, backend EAGAIN. Full CI FAIL (2 unrelated admin session tests).
- Real isolated PostgreSQL 17.11: 316 migrations PASS; direct ledger INSERT false; container removed. DB unit 62 PASS/4 SKIP; mobile contract 184 PASS; security scripts 11 PASS; production High+ audit PASS; full audit 9 vulnerabilities; route ledger FAIL missing evidence.
- Exact SHA Test/Production/E2E not executed; no merge, deploy, rollback or branch cleanup. Release HOLD.
