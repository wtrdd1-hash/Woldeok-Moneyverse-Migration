# Verified help issue report: bounded implementation plan

## Scope
A signed-in member can report an incorrect, unclear, or outdated currently approved help revision, without publishing or modifying the article. Reports create an existing owner-private support conversation. The server never trusts a client-supplied article title or owner ID; a report binds to the approved revision UUID and a server-constructed body. A stale or withdrawn edition fails closed. One UUID idempotency key may not silently acknowledge a different payload; verify the persisted support message before returning a receipt. Feature is OFF unless both help and report flags are enabled.

## Files / verification
1. `backend/src/help/help-report.controller.test.ts`: RED on invalid locale/slug/revision/reason/length, missing auth/CSRF metadata, stale/withdrawn publication, duplicate-key mismatched readback, success.
2. `backend/src/help/help-report.controller.ts`, `backend/src/help/help.module.ts`: add guarded POST, resolve exact published article via existing `help_public_article_revision`, create support thread through existing SECURITY DEFINER function, verify owner-only readback; return only private receipt.
3. `frontend/src/app/help/report-action.test.ts`, `frontend/src/app/help/report-action.ts`, `frontend/src/app/help/report-form.tsx`, `frontend/src/app/help/[slug]/page.tsx`: RED/GREEN, validated server action, CSRF, accessible reason/details form and receipt link, fail closed on uncertainty.
4. `frontend/src/lib/app-gateway.test.ts`, `frontend/src/lib/app-gateway.ts`: RED/GREEN, allow only one article-bound report route to Android; deny admin/preview/traversal.
5. Run focused tests, lint, typecheck, build, app API, real PostgreSQL, full CI. If any gate fails, preserve Draft and HOLD.

## Rollback
Feature flags OFF and revert code only; no schema or finance changes. Existing support conversations are immutable and must not be deleted by rollback.
