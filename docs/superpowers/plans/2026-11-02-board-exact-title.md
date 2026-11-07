# Exact-title public board discovery — implementation plan

1. Backend contract: add RED service and controller tests for `match=exact` requiring q; case-insensitive SQL equality over the existing latest-50 SECURITY DEFINER read model; expose explicit exact-match provenance even for empty results. Reject unknown/duplicate/malformed query parameters with 400.
2. Web: RED parser and page tests for an accessible match-mode selector; forward only normalized exact mode and verify backend provenance and matching post titles before rendering success; failure is unavailable, not empty. Keep SEO noindex and cache disabled for filtered results.
3. Android: RED app-api gateway tests for exact-query forwarding, fail-closed provenance/row validation, no-store/noindex and no-referrer on success and failures.
4. GREEN, focused tests, full test/typecheck/lint/build/security and isolated DB read-only SQL; exact-SHA CI and official Test E2E. Any failure => Draft HOLD, no main/production mutation.
