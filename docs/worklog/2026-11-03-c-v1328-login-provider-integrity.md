# C v1328 — Login provider source integrity (DRAFT / RELEASE HOLD)

## START — 2026-11-03 09:09 KST
- Debian 13.6 miniPC reached; seven primary services active and DEV PostgreSQL connected.
- Fresh `origin/main` SHA: `00a770ed7dadfd70f57189afe05b14d08f30f62f`; isolated branch `auto/hourly-c-v1328-20261103-0909`, worktree `/srv/moneyverse-data/tasks/mv-c-v1325-20261103-0909` (path retained from creation before v1328 naming).
- Reviewed AGENTS.md, README.md, README-KO.md, English canonical and Korean planning, latest PRs, CI, A/B, QA and overlapping C PRs. Existing #2589 (security score), #2593 (stock comparison), #2598 (reset outage) and #2590 (session privacy) must remain untouched.
- Confirmed gap on current main: `LoginProvidersView` trusts an unvalidated `auth/providers` payload and calls `.filter()` on arbitrary `providers`, so malformed upstream JSON can crash the sign-in page; upstream failure is presented as no OAuth provider; local-email login is shown even when the backend reports its session storage disabled. The Nest endpoint has a precise three-provider configuration contract. This is distinct from active PR titles reviewed.
- Approach: TDD strict provider evidence parser; differentiate unavailable vs verified-disabled; only show verified-enabled OAuth; retain local login when availability is unknown with explicit uncertainty, hide when explicitly disabled; accessible retry; enforce private/noindex HTTP headers on login provider routes; test backend source contract. No financial writes, migrations or changes to A/B/Gemini/QA work.
- Release is HOLD until exact SHA gates, authenticated E2E, official Test and CI all pass.

## MID — 2026-11-03 09:13 KST
- Re-fetched main and canonical plan; main unchanged at `00a770ed7dadfd70f57189afe05b14d08f30f62f`, no plan divergence.
- TDD RED: parser module absent, and global public `X-Robots-Tag` overrides page metadata; backend provider response lacked explicit no-store/noindex headers.
- GREEN: strict three-provider parser 12 tests, Next privacy header rule 1 test, SSR source-state UI 3 tests, Nest provider contract/header 2 tests. Focused tests PASS. Initial standalone frontend typecheck failed because workspace contract had not been built; built contract, full workspace typecheck PASS. This is an environment preparation failure, not a source fix.
- Source change: malformed or partial upstream cannot crash login; verified local_email disabled hides unusable form, unknown retains email attempt with truthful warning, OAuth links only from verified enabled providers; full reload retry and 44px controls; deployment-dependent Nest provider list is no-store/noindex. No migrations or balance changes.
- Next: run full exact-SHA gates, isolated HTTP and PostgreSQL checks; retain DRAFT/HOLD if any required gate is missing.
