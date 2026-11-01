# Release Gate — A 10:25 Verified Editorial Topic Discovery

**HOLD — no main merge, Test or Production rollout.**

Candidate is a read-only editorial discovery change, with no migration or ledger writes. Real DEV PostgreSQL function ACL was checked in READ ONLY / ROLLBACK, but this is not Production least-privilege certification.

Official Test public frontend/backend version is `bc8cd8a6c654af0336f550643f23049a58ee1d16`; Production API version is `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, while Production frontend publishes opaque build ID `1793450413898`. Neither proves this candidate is deployed. Do not equate frontend build ID with Git SHA.

Gate requires exact candidate SHA CI, clean isolated PostgreSQL, authenticated web/API/Android E2E, privacy/a11y/SEO, independent backup restore, existing P0 ACL remediation #993, GitOps approval and verified rollback artifact. Until then: **Production HOLD**. Rollback plan: no runtime change occurred; revert the new public topic UI and app-api allowlist via reviewed forward commit if later deployed, retaining immutable SQL and existing published articles.

**Candidate provenance (10:42 KST):** feature SHA `2be277b59d893b9752ecac334f313fc09f13727d`, branch `auto/hourly-a-20261101-1025-blog-topic-discovery`, Draft/HOLD PR #2298. Baseline main `f13bbce273ffc65e8576170992d82ea00c27a1c9`. Full frontend 2 pre-existing failures; exact-SHA CI pending. End remote branches 71 / open PRs 67; 0 merged/deleted. Candidate not on official Test or Production. Any later documentation-only SHA must be independently checked and must not be promoted without fresh exact-SHA CI and Test evidence.
