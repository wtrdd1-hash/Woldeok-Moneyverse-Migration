# C v1258 — KDIC virtual-coverage source truth (canonical)

**Status:** DRAFT / RELEASE HOLD. **Baseline:** `f13bbce273ffc65e8576170992d82ea00c27a1c9` (2026-11-01). No ledger or schema change.

## Verified gap

The public `/kdic` screen and layout presented real-world Korean statutory insurance, a 500,000 WLD guarantee, invented 10,000,000 WLD fund and two insured institutions as facts when the public API was unavailable. The legacy Nest `GET /api/v1/kdic/portal` returned fund/insurance aggregates from insurance-specific tables, while admin payout, premium and liquidity writers already returned `KDIC_LEDGER_SETTLEMENT_UNVERIFIED`. A member `GET /api/v1/kdic/my-coverage` returned success-shaped insured balances without a certified ledger settlement or legal coverage source. Virtual WLD is not statutory KRW deposits.

## Bounded design and implementation

Fail closed on public portal and authenticated owner coverage at Nest with `503 KDIC_COVERAGE_UNVERIFIED` *before* touching unverified repositories. Keep existing SessionGuard/AuthenticatedGuard on the owner route. Independently block Android app-api legacy upstream success for the two paths, returning private/no-store/noindex/no-referrer. Replace the web page with an accessible, mobile-friendly source-hold notice and navigation; remove all fabricated figures, insurance calculators, legal guarantee claims, SEO rich results and JSON-LD. No financial mutation or new DB grants. Administrative read-only diagnostics are deliberately unchanged and must not be interpreted as payout approval.

## Verification / release constraints

TDD RED on public controller and web; GREEN targeted tests for Nest, web and Android. Full lint/typecheck/build/unit/integration/app-api/real-PG/security/official exact-SHA Test/E2E and GitHub required checks must all PASS before merge. Existing global private HTTP header conflict #2225, independent full-route QA ledger, official Test namespace/rollback and dependency audit are release blockers. This branch does not deploy or alter Production.

## Validation checkpoint (2026-11-01, miniPC Debian 13.6)

- RED: Nest public coverage 2 failures; web source-hold 2 failures; Android gateway legacy success 2 failures (the combined RED frontend runner also hit a transient fork timeout). GREEN: Nest 2 PASS; web 2 PASS; Android 2 PASS.
- Full `pnpm typecheck` PASS; `pnpm lint` PASS with 0 errors / 1,020 pre-existing warnings; Backend Build PASS; Frontend production Build PASS; app-api contract PASS (184 endpoints); contract 41 PASS; DB package 62 PASS / 4 SKIP; security scripts 11 PASS.
- Backend complete suite 2,952 PASS / 517 SKIP (two-worker final run). Frontend complete suite 2,903 PASS / **2 FAIL**: existing administrator console session fixtures expired on November 1, tracked separately by QA Draft #2303. No bypass or modification of QA work.
- Isolated PostgreSQL 17.11: 316/316 migrations applied using disposable role/database, app-role direct ledger INSERT=false, 0 synthetic ledger transactions; container removed. No authenticated owner flow was certified by this SQL-only gate.
- `pnpm audit --prod --audit-level=high`: PASS, 0 known high-severity production findings. Full `pnpm audit`: FAIL, 9 findings (1 low, 8 moderate).
- QA route inventory generated; full-route certification FAIL because `artifacts/qa/full-route-ledger.json` is absent.
- Isolated candidate Next HTTP `/kdic` 200, false fund amount absent, hold text present; Android `/app-api/v1/kdic/portal` 503 with expected problem code and `private,no-store`. **Real HTTP SEO/privacy FAIL:** common headers override route `X-Robots-Tag` to `index, follow` and `Referrer-Policy` to `strict-origin-when-cross-origin`; existing Draft #2225 owns this fix. Do not duplicate.
- Official exact-SHA Test authenticated user E2E, independent backup restore, GitOps release gate and Production smoke remain BLOCKED. No main merge, Test or Production deployment. This is a protective P0 implementation, not a certified payout system.
