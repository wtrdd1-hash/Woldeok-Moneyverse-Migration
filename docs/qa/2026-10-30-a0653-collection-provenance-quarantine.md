# QA — A 2026-10-30 06:53 Collection provenance quarantine

**Status: TARGETED PASS / FULL GATES FAIL / RELEASE HOLD.**

## Source and threat
- Main baseline `62c6cd038951d65c94b709302bdaec6e75b080b6`; independent branch `auto/hourly-a-collection-truth-20261030-0653`.
- Existing collection GET inserted four unearned badges; the web displayed hard-coded ownership and localStorage cache on failed requests. Curation GET could insert a progress row. This is not evidence of genuine member achievements.
- No migration/checksum was modified. Forward-only migration 306 adds only a least-privilege SECURITY DEFINER count. Historical rows are preserved, quarantined, and **not** retroactively certified.

## Executed evidence
- RED: backend 3 failing; frontend 3 failing, including Android public cache leak. New count function RED 1 failing before implementation.
- GREEN: backend collection/controller 7 PASS; frontend collection + Android gateway + generic app-api 41 PASS; changed-code ESLint PASS; complete TypeScript typecheck PASS.
- Isolated PostgreSQL 17.11: all 305 SQL migrations (002–306) applied; source 002–305 checksum manifests 304/304 match; app role has no collection table SELECT/INSERT/UPDATE/DELETE. Synthetic owner A 2, owner B 1, third owner 0, unauthorized UPDATE 42501. Isolated container removed.
- Full ESLint FAIL: 3 pre-existing `stale-tab-notice.tsx` no-empty errors; 1,044 warnings. Full backend 2,353 PASS / 240 FAIL / 494 SKIP. Full frontend test timed out at 105 seconds with existing failures; mobile API contract FAIL on pre-existing generated schema drift. Generated files restored to avoid unrelated changes.
- Backend build and TypeScript PASS. Frontend Next.js compilation, TypeScript, 607 static pages PASS, but standalone tracing/copy failed with ENOSPC on the 197GB `/srv/moneyverse-data` filesystem; generated local `.next` removed safely. **Full build FAIL.**
- No official exact-SHA authenticated Test, independent off-host backup restore, or approved GitOps gate. No Production deployment, financial writes, ledger migration, or rollback.

## Release decision
**HOLD.** Targeted success is not a release. Existing P0 treasury provenance and stale frontend version remain separate blockers. Require full exact-SHA CI, official Test authentication/DB/E2E, storage headroom, provenance verification, and authorized release before merging/promoting.

**Additional failure handling:** 503 is returned on unavailable DB count/privilege evidence (RED then GREEN); never treat an error as zero verified records. Test and Production `/api/version` both return the prior SHA `c2129625aa6629c616fb31ce790950618b8d92b2`, not this candidate.
