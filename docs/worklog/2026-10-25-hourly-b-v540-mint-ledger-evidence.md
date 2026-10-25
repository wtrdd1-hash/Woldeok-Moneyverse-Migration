# Backend B v540 — Mint/burn ledger provenance hold (2026-10-25)

## Environment / baseline

- Debian 13.6 miniPC, required system status/shell/file-read MCP calls attempted; file-read returned empty and shell inspection supplied source. Backend/Frontend/Bot/Nginx/Docker active.
- Start/mid main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fetched origin/main); independent worktree `mv-b-v540-20261025-2235` on branch `auto/hourly-b-mint-ledger-truth-v540-20261025-2235`.
- Reviewed AGENTS, README, EN/KO living plans, open PRs and QA #1317. Existing #1122 and #1162 secure HTTP admin boundaries but do not prevent process-local MintService fake settlement. No overlap with A/C/QA code files.
- miniPC root filesystem ~98% used, data volume ~65% used. No cleanup of other worktrees or live data.

## Reproduced P0

- `MintService` initialized a fictional 500,000,000 WLD accepted genesis and 1,250,000 WLD burn, with fake certificate/transaction hashes.
- Issuance, acceptance and burn generated process-local records and success Discord alerts without a PostgreSQL financial ledger settlement.
- Central-bank M0/M1/M2 API treated those figures as audited and applied invented multipliers.
- New 7-case security regression suite: **RED 7/7** on unmodified main.

## Code and contract

- `backend/src/mint/mint.service.ts`: all seven mint/burn/read operations now reject with HTTP 503 `MINT_LEDGER_EVIDENCE_UNAVAILABLE`. Removed synthetic records, mutable arrays, fabricated certificates, misleading totals and success Discord messages.
- `backend/src/central-bank/central-bank.service.ts`: independent HTTP 503 boundary for mint acceptance and monetary aggregates, including when an internal service mock supplies fake data. Unrelated base-rate, reserve requirement and commercial rate methods untouched.
- `backend/src/mint/mint.controller.ts` and `backend/src/central-bank/central-bank.controller.ts`: `Cache-Control: no-store` on affected endpoints. Existing auth, consent, admin and CSRF guards retained.
- Updated existing mint/central-bank tests and added `mint-ledger-boundary.test.ts`. No DB schema, migrations, privileges, WLD balance, ledger or deployment changes.
- Affected routes: `GET /api/v1/mint/batches`, `/batches/:id`, `/seigniorage`, `/audit-certificates`; `POST /api/v1/mint/batches`, `/burn`; `POST /api/v1/central-bank/mint-batches/:id/accept`; `GET /api/v1/central-bank/monetary-aggregates` now 503. The mint HTTP path is admin-only, while central-bank aggregate remains member-authenticated. No response success is fabricated.
- This is a **temporary protective hold**, not implementation of mint/burn settlement, audit certification, or actual M0/M1/M2 calculations. Separate admin economy monetary APIs were not modified and require their own verification.

## Test evidence / gates

- New boundary RED 7/7, GREEN 7/7. Final focused mint and central-bank suite **15/15 PASS**.
- Backend full: **1,320 PASS / 398 SKIPPED**. DB package **15 PASS / 3 SKIPPED**. Contract **38 PASS**.
- Backend build PASS, root typecheck PASS, root lint PASS (0 errors, 1,128 warnings). Repository security and control-byte scans PASS.
- Frontend Webpack build PASS. Default Turbopack build FAIL due to linked workspace dependency resolution. Frontend full **1,397 PASS / 6 FAIL** (SEO 3, mobile login 1, calculator registration 1, admin monetary telemetry 1). Root test FAIL for the same 6.
- Production dependency audit FAIL (2 High: body-parser/multer). Full audit FAIL (2 Critical, 10 High, 11 Moderate, 3 Low). QA #1317 contains an unmerged fix candidate.
- Isolated real PostgreSQL migration/ACL verification: NOT RUN (no DB/migration changes). Authenticated end-to-end and official Test exact-SHA: BLOCKED. Required CI final result: PENDING after push. No release gate may be inferred from local passes.

## Merge, deployment, cleanup and safety

- Draft PR only. Do not merge until default build, full tests, security audit, required CI, isolated Test exact-SHA and GitOps release gates pass. No Test or Production promotion.
- No branch/worktree cleanup, no other automation modifications, no live DB writes. If future restoration is needed, use a new DB-owned ledger-linked, idempotent and auditable mint/burn implementation with independent source-of-truth verification.
