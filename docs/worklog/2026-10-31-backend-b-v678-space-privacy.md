# Backend B v678 — Actor-bound personal space reads (P0, Draft/HOLD)

**Baseline:** `origin/main` `761a55a094fb9dd383d213e817305e68c79fa23c` (2026-10-31 KST).

## Reproduced gap

The authenticated `GET /api/v1/spaces/:id` and `GET /api/v1/spaces/:id/tax/status` passed only the URL space id to SQL, so any logged-in member knowing a UUID could retrieve another owner's private/club layout or tax status. The member-facing `GET /api/v1/spaces/tax/delinquencies` selected every delinquent space regardless of its privacy flag and attempted to read `public.identities`, which the clean app role cannot SELECT. This is a verified source authorization defect and clean-schema role failure, **not evidence that Production member data was accessed**.

## Implementation contract

- The controller passes the authenticated session user id through the service to the repository for detail and tax status. Client-supplied user IDs are not trusted.
- Detail is visible to its owner or to an authenticated member when `privacy='public'`; `private` and `club` are owner-only until a reviewed club-membership authorization contract exists. Non-visible IDs return 404, without disclosing existence.
- Tax status is owner-only, including for publicly visible spaces. The layout-update preflight also binds both actor and id; the SQL mutation function already enforces owner scope.
- Delinquency feed includes only `privacy='public'` rows and deliberately redacts display names (`비공개`); no direct `identities` SELECT. The response shape and routes are unchanged.
- No financial mutation is enabled. No WLD balance, ledger, schema, migration or existing applied migration changes.

## Evidence and outstanding risks

- RED: five focused regression tests failed on the original main; the clean app-role PostgreSQL delinquency query failed `permission denied for table identities` before correction.
- GREEN: 24 focused tests; isolated PostgreSQL 17.11 with **311 migrations** and two distinct users passed five DB regressions (owner/foreign detail, tax, list, delinquency, layout, unchanged ledger count).
- Remaining **P1 #2087**: `moneyverse_app` still has direct `SELECT` on `public.user_spaces` in clean schema; the repository-side actor filter is not a DB least-privilege boundary. This must be replaced by owner-scoped `SECURITY DEFINER` functions in a forward-only, correctly stacked migration, with independent review before merge.
- Local full gates (2026-10-31 07:42–07:49 KST): lint PASS (0 errors/1,049 warnings), typecheck PASS, Backend 2,784 PASS / 506 SKIP, Frontend 2,770 PASS, full build PASS, mobile API contract 184 endpoints PASS, focused release 5 PASS, production dependency audit 0 known vulnerabilities, git diff --check PASS. No official Test exact-SHA or authenticated E2E has been executed. CI results belong to the Draft PR once available. Production promotion prohibited until all mandatory gates and independent release attestation pass.
