# C v1115 — SEO audit observation evidence plan

## Source and scope
Main has a protected SEO audit GET/POST BFF and a client, but no runtime evidence check for upstream metrics or IndexNow acceptance. No schema or financial writes. Preserve existing authority, CSRF and no-store behavior; do not modify A/B/QA/Gemini work.

## Implementation sequence
1. Add RED tests for contradictory crawler totals, untrusted bot labels and malformed submission receipts in `frontend/src/lib/admin-seo-audit-evidence.test.ts` and `frontend/src/app/api/admin/seo-audit/route.test.ts`.
2. Add `frontend/src/lib/admin-seo-audit-evidence.ts` pure parser for bounded counts, canonical bot distribution, audit provenance and accepted HTTP 200/202 receipts.
3. Enforce parser at `frontend/src/app/api/admin/seo-audit/route.ts`; preserve 401/403/503 authority semantics, return unknown telemetry instead of observed when invalid, and 502 for invalid success receipt.
4. Enforce parser at `frontend/src/components/admin-seo-audit-view.tsx`, clear stale evidence before refresh, prevent submitting when candidate count is zero, and retain mobile/a11y/noindex behavior.
5. Add UI regression tests; verify focused and full build/lint/typecheck/test/API/security/real PostgreSQL/CI gates against final HEAD. If any mandatory gate fails, keep Draft PR and release HOLD.
