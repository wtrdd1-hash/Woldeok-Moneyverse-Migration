# A1225 Shop verified two-item comparison — recovery implementation plan

> For agentic workers: use isolated worktree, test-driven-development, systematic-debugging and verification-before-completion skills. Preserve active #1677 and all 352 rescue references.

**Goal:** Restore the unmerged P1 shop cost comparison from preserved commit `db018d11f` on authoritative `origin/main` `a28bed9aa40ff74d492824ae12892a7d52132fdd`.

**Architecture:** Authenticated/consented GET `/api/v1/shop/compare?ids=uuid,uuid` reuses `ShopCatalogRepository.catalog(actor)` and the migration-123 `shop_catalog_list_v2` read model. Backend computes exact bigint-string differences. The member-only shop UI uses a two-item selector; the Android app-api gateway proxies with private/no-store, including failures. No mutation, new grants, or migration.

**Tech stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

**Spec:** Original implementation and tests from preserved SHA `db018d11f` and QA findings. This recovery does not imply approval to deploy.

## Global constraints
- Never edit applied migrations or ledger data; do not use Production/dev 5433 for tests.
- Keep owner/session guards and private cache boundary; preserve existing privacy noindex header when resolving app gateway conflicts.
- Preserve all unique unmerged branches/PRs and other agents' work.
- Do not merge/deploy unless all full gates, exact-SHA isolated Test and GitOps release controls pass.

## Tasks
- [x] Confirm latest main, policies, English/Korean plans, QA and active PRs.
- [x] Create isolated worktree and observe RED comparison test (missing implementation).
- [x] Port backend comparison, API, Android gateway, shop selector and regression tests; reconcile privacy noindex conflict without relaxing policy.
- [x] Run targeted unit/e2e tests and an isolated PostgreSQL 17.11 test with actual migration-123 read-model function body and table ACL denial.
- [ ] Obtain full frontend, root CI, exact-SHA authenticated Test, security, accessibility/SEO, backup restore and production release gates. Any failure means Draft/HOLD.

## Review focus
Actor identity binding; unavailable items; unsafe integer coercion; cache leakage; accessibility and stale selection; concurrent PR #1677 conflict; migration/ledger immutability.
