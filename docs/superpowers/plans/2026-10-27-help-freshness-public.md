# Verified Help Public Evidence Freshness — Engineering Plan (2026-10-27)
Status: engineering candidate only / DRAFT / RELEASE HOLD. Base origin/main c2a9306d.
1. RED: contract and repository tests require reviewed_until in both published-only public read projections. Real-PG fixture must assert expiry metadata is present and future.
2. GREEN: edit only the NEW, UNAPPLIED 280 migration (never an applied migration). Project review deadline through SECURITY DEFINER search/article functions, and backend read repository. No table grants.
3. RED/GREEN: public KO/EN UI renders deterministic UTC review deadline, fails closed on malformed/expired metadata. Search and detail preserve no-store/noindex; Android app-api public read path returns the same field without admin endpoints.
4. Regression: isolated PG17 with restricted app role and source-expiry negatives; full unit, contract, typecheck, lint, build, security, accessibility/SEO, official exact-SHA Test only if release prerequisites permit.
5. Final: reread main and EN/KO integrated plans, preserve all other branches/PRs, draft/hold PR, no main merge or deployment without every release gate. Document SHA, files, test evidence and rollback.
