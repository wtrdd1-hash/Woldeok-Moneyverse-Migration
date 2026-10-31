# Gallery Search Candidate — RELEASE HOLD

Candidate branch `auto/hourly-a-20261101-0325-gallery-alt-search`; base main `f13bbce273ffc65e8576170992d82ea00c27a1c9`.

- Source DB function: `public.content_list_published_photos(integer)`, existing migration 098; no new migration, privileges or financial writes.
- Candidate and CI SHA: pending final commit and verification.
- Test: not deployed; exact-SHA authenticated E2E BLOCKED.
- Production: no deployment, DB writes, service restart or rollback. Existing Production remains unchanged by this task.
- Required before merge/release: full green build, lint, typecheck, unit/integration, Android contract, real PostgreSQL role/security, accessibility, SEO, exact-SHA CI, official Test, backup restore, GitOps release gate and post-release smoke/version/login/DB proof.
- Rollback: do not promote. If later released and regression appears, revert code via reviewed PR/release manifest; no schema/data rollback needed.
- Branch cleanup: zero deletions; all other non-main branches retained due unmerged unique work.
