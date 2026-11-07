# Season Settlement Containment Implementation Plan

> For agentic workers: use the test-driven-development and verification-before-completion skills; preserve the RELEASE HOLD.

**Goal:** Prevent a member session from prematurely closing an active season or generating reward claims through the legacy settlement endpoint.

**Architecture:** Fail closed at the Nest HTTP controller, service and PostgreSQL repository entrypoints without changing database state or applied migrations. A separate, coordinated forward-only migration must revoke the app role's direct EXECUTE permission and replace the function with a reviewed operator-only lifecycle-checked settlement path.

**Tech stack:** NestJS, TypeScript, Vitest, PostgreSQL 17.

**Spec:** `docs/planning/PROJECT_PLAN.md` (English authority), Korean parity in `PROJECT_PLAN.ko.md`.

## Constraints and review focus

- Keep session/authentication/consent/CSRF guards intact.
- No unreviewed migration number: multiple pending `318` candidates collide.
- Do not execute the existing settlement SQL against any shared DB.
- Preserve season event discovery and reward-claim hold.
- Treat the remaining `moneyverse_app` EXECUTE grant as P0 residual exposure; this code change is not a full DB privilege fix.

## Execution

- [x] Confirm source path: `SeasonController.settle` → `SeasonService.settle` → `PostgresSeasonRepository.settle` → `season_settle_rewards(uuid)`.
- [x] Inspect migration 265's EXECUTE grant and absent season end-time enforcement.
- [x] Write failing repository/service/controller tests and observe 3 RED failures.
- [x] Add coded 503 holds at each layer and preserve existing guard chain.
- [x] Update historical service success assertion to the safe contract.
- [x] Add actual HTTP checks for 401, 403, 503 and zero settlement invocations.
- [ ] Run all required CI, PostgreSQL privilege tests, official Test exact-SHA, authenticated E2E and independent restore.
- [ ] Only merge after all release gates pass; otherwise Draft/HOLD.
