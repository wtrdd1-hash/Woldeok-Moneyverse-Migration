# SEO Truth Frontend and Spring Fallback Recovery

**Goal:** Stop the stale static SEO funnel from making unverified success claims in the live Next frontend, and ensure direct Spring SEO routes cannot report invented observations or false submit success.

**Spec:** `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/standards/SEO_SITEMAP_INDEXING_STANDARD.ko.md`, PR #3206 worklog.

**Architecture:** Build full isolated exact-SHA Next candidate from PR #3206 + v3 changes (no in-place build), stage on dedicated localhost port with matching Production BFF environment, run negative live API/header/routing QA, and switch Nginx public frontend upstream atomically with rollback only after all gates. Spring remains behind protected Node SEO gateway until strict parity; direct Spring SEO fallback must 503 rather than return placeholders.

**Testing:** RED→GREEN Spring direct contract sample tests, already RED→GREEN frontend truth/auth tests, 50 SEO regression tests, frontend typecheck and build; actual stage HTTP QA, then production 13/13 + version switch + rollback validation.

**Risks:** Frontend build from source newer than prior Production SHA may contain unrelated functional delta: check page/assets/public API compatibility, backend contract and rollback artifact independently. Actual staff authenticated GSC + IndexNow submission cannot be certified from anonymous requests. Spring all-domain process restart must not occur unless full independent exact-SHA Test permits.

**Stages:** (1) isolated branch/logs and current main (2) Spring fail-closed TDD (3) frontend build/Test (4) conditional blue-green Production (5) EN/KO internal+GitHub documents and stacked review PR; check main midpoint and pre-promotion.
