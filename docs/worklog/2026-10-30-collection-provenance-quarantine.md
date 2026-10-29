# 2026-10-30 — Collection provenance quarantine (P0 / HOLD)

## Before work
- MiniPC Debian 13.6 services and DEV PostgreSQL reachable. Latest main: `62c6cd038951d65c94b709302bdaec6e75b080b6`.
- New isolated branch/worktree: `auto/hourly-a-collection-truth-20261030-0653`.
- Read AGENTS, README, English/Korean project plans, integrated planning, QA and open PRs. C is working on club/business, B on account security, A previous work on task duration; collections scope does not overlap.
- Source P0: repository seeds four badges on GET; frontend renders hard-coded badges/localStorage on API failure; curation GET can INSERT. No verified issuance source exists in inspected application code. Existing DB records must be preserved pending provenance reconciliation.
- Design: `docs/superpowers/plans/2026-10-30-collection-provenance-quarantine.md`.

## In progress
- [ ] RED regression evidence
- [ ] Backend fail-closed and no-write read path
- [ ] Frontend truthful state and Android private gateway
- [ ] Isolated PostgreSQL and security checks
- [ ] Final exact SHA CI / integration decision

## Finished
Pending verification. Release HOLD until all gates pass.

### Mid-run discovery (07:02 KST)
- Isolated PostgreSQL 17.11 applied 304/304 main migrations with matching SHA-256 manifests. `moneyverse_app` has no SELECT/INSERT/UPDATE/DELETE on `user_collections`. The original direct table read fails `42501`, and simply removing the seed would leave the feature unavailable.
- Correction: new forward-only migration 306 provides **only** a SECURITY DEFINER owner-scoped count function, with PUBLIC EXECUTE revoked and no table grants. No existing migration is edited. Legacy records remain quarantined, not deleted or certified.

### Verification checkpoint (07:15 KST)
- RED→GREEN: 3 backend and 3 frontend failures reproduced before implementation; 1 additional missing count-function RED. Backend targeted 6 PASS, frontend/Android/API targeted 41 PASS.
- Isolated PostgreSQL: 305/305 migrations (002–306), real owner A/B/third count 2/1/0, direct app SELECT/INSERT/UPDATE/DELETE false, unauthorized UPDATE rejected 42501. Test container removed.
- Full TypeScript PASS; database unit 56 PASS / 4 SKIP; changed ESLint PASS; security audit no known vulnerabilities.
- Full lint FAIL 3 baseline stale-tab errors; backend full 2,353 PASS / 240 FAIL / 494 SKIP; frontend full exceeded 105s and contains existing failures; mobile API contract FAIL generated docs drift (reverted generated artifacts).
- Frontend Next compilation/TypeScript/607 static pages PASS, but standalone copy ENOSPC on `/srv/moneyverse-data` (197GB 100% used). Safely removed only this worktree's generated `.next`; no other developer files touched.
- Official Test exact SHA and authenticated E2E, independent restore, release gates remain BLOCKED. No merge or Production deployment.

### Post-review correction (07:17 KST)
- Additional RED test reproduced a raw `42501` DB failure leaking through GET as 500; backend now returns explicit 503 `collection provenance metadata unavailable`, never an invented empty verified collection. Backend target 7 PASS, typecheck and changed lint PASS.
- Public Test and Production `/health` HTTP 200 and `/api/version` both report old `c2129625aa6629c616fb31ce790950618b8d92b2`; neither serves this candidate. Read-only only. Official authenticated exact-SHA Test remains BLOCKED.
- PR #1955 is Draft. No PR/branch deletion, main merge, Test/Production deployment, DB mutation or rollback.
