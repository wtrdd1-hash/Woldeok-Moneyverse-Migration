# TDD implementation steps
1. Create parser/filter and Android regression tests; run RED against main code.
2. Implement Nest query parser and snapshot filtering, and both public controllers.
3. Implement Next query parser, accessible search field, error and empty states, noindex/no-store.
4. Implement Android gateway query validation and response evidence check.
5. Run target tests, typecheck, lint, builds, database checks, API contract, security/SEO/a11y and full suites.
6. Fetch latest main mid-run and before integration; record SHA, branch/PR/CI, blockers and rollback. Open Draft/HOLD PR only if evidence allows; no unsafe deployment.
