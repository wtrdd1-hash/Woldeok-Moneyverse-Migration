# Backend B v735 — Warfare/derivatives release policy source-truth gate

- **Scope:** P1 QA #2391, release/security/QA CI policy (no API, DB, migration, ledger or member data mutation).
- **Baseline main:** `3d5e321c3d1221febff677469fecdfcb3cf42e7d` (checked before and during work).
- **Isolation:** `auto/hourly-b-v735-warfare-policy-20261101-2335`, independent worktree; no other agent branches touched.
- **Root cause:** Old QA source-text assertion demanded simulation labels on both warfare and derivatives. Both are now authenticated, fail-closed read-only source-truth pages, not simulated transactions. Quant still simulates, so it must retain a simulation label.
- **Code:** Split QA policy into separate quant simulation, warfare member/verified-club/no-payout, and derivatives member/verified-API/no-uncertified-trade guards. Add a release-policy test importer for the security, backup and QA suites. The existing CI policy job already executes `scripts/release/*.test.mjs`, so no workflow file or permission change is needed.
- **RED:** `node --test scripts/qa/ui-backend-truth.v629.test.mjs` exited 1 on baseline, reproduced stale assertion.
- **GREEN:** focused 12/12; broad `node --test scripts/release/*.test.mjs scripts/security/*.test.mjs scripts/backup/*.test.mjs scripts/qa/*.test.mjs` 196/196 before CI importer, then 244/244 after importer (duplicate imported test modules are counted).
- **CI integration:** `node --test scripts/release/*.test.mjs` now exercises the imported policy suites, 195/195 PASS. Direct workflow-file push was denied due to missing GitHub OAuth `workflow` scope; no workflow file is included in this candidate.
- **Local gates:** offline frozen pnpm install PASS; workspace typecheck PASS; lint PASS (0 errors, 1,027 warnings); workspace build PASS.
- **Global test gate:** `pnpm test` FAIL: backend 2,968 PASS / 2 FAIL / 518 SKIP (pre-existing profile HTTP expected 200, received 401). Frontend full suite separately timed out after 125 seconds, so it is NOT a pass.
- **PostgreSQL/security/E2E:** no database changes; isolated real PG, official Test exact-SHA, authenticated E2E and release promotion gates not certified for this candidate.
- **Release decision:** DRAFT/HOLD; no merge, no Test/Production deploy. Never infer approval from focused policy tests alone.
