# F675-182 — owner-private wallet transaction detail (execution plan)

Approved engineering scope: latest English/Korean v1506 integrated planning; read-only and feature OFF by default. No ledger writes, app table grants, admin personal detail, or Production changes. Independent miniPC worktree from main.

1. **TDD owner DB projection.** Add 309 forward-only `SECURITY DEFINER` function with fixed search path and explicit `EXECUTE` only; preserve exact UTC microseconds, owner WLD CASH/BANK signed NUMERIC and count invalid currency; no new direct grants. Add SQL contract and isolated PostgreSQL fixture tests, watch RED then GREEN.
2. **TDD Nest read.** Add repository read, strict canonical ID/DTO and error semantics, authenticated/consented GET endpoint behind default-off switch; tests for owner, absent/foreign 404, malformed 400, invalid projection 503, exact integer strings, and privacy headers.
3. **TDD Next member page.** Add strict unknown-JSON parser, dynamic detail page with semantic labels, noindex, safe back link, retry/copy and explicit non-certification; add CTA on wallet activity only when enabled. Test missing/malformed/owner states.
4. **TDD Android app-api.** Enforce owner-private response proof, status parity, no-store/noindex/no-referrer for errors and success, no fallback zeros; adversarial gateway tests.
5. **Verify and release gate.** Run targeted and full suites, typecheck/lint/build, generated contract, isolated PostgreSQL/least privilege, exact-SHA CI, official Test; record every blocker. Re-fetch main/plans before PR, never merge or deploy without full PASS and independent restore.

TDD stages and evidence go into task worklog and isolated report folder. Release rollback is feature OFF; no data deletion.
