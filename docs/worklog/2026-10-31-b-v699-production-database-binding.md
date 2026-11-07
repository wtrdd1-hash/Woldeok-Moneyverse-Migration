# B v699 — Public production database binding (P0, DRAFT / RELEASE HOLD)

## Before work
- QA v1422 verified the live public Production Nest process connects to `woldeok_moneyverse_dev` with `moneyverse_app`. This is a runtime misbinding, not evidence of balance loss.
- Source `backend/src/core/config.ts` trusts any `DATABASE_URL` for the public production host. No explicit expected database name is checked.
- Baseline main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; unrelated PRs #2206/#2213/#2214 protected.
- Plan: TDD RED tests for canonical host and database identity, implement fail-closed boot config guard, focused tests, workspace gates and isolated DB checks. No automatic restart or deployment: the existing public deployment would be refused until operators configure and independently attest a correct production database.

## In progress
- TDD RED: 7 of 9 new tests failed on unmodified main; 37 existing/new tests passed.
- TDD GREEN: 46/46 focused config tests pass after implementation and adversarial query-option tests.
- Public production origin and `www` alias require `NODE_ENV=production`, an explicit `PRODUCTION_DATABASE_NAME`, and matching PostgreSQL `DATABASE_URL` path. DEV/Test/staging/restore namespaces are denied even if the operator mistakenly approves the same name. Unsupported URL options are denied to prevent the driver overriding the database path. Error messages omit URL credentials.
- Existing isolated Test host remains unaffected. No database connection is made during configuration validation. This guard does not repair the current live Production DB binding or independently attest database ACLs.
- Full build/lint/tests/isolated PostgreSQL/CI and exact-SHA official Test remain to be checked.

## Finished
- Pending. RELEASE HOLD until all CI, isolated exact-SHA Test, finance, restore and GitOps gates pass.
