# FE-C explicit language precedence v2026.11.23.1 (EN)

Scope: Spring `UiLocale.resolvePublic` only, with isolated regression tests. Explicit `?lang=JA` on a public Spring route now wins over a previously persisted `wdmv_locale=ko`; without an explicit query, the manual cookie continues to win over `Accept-Language`. Unsupported query values do not override the cookie. The query is not persisted automatically; account preference and global shell remain out of scope.

TDD evidence: `UiLocaleExplicitLanguagePriorityTest` RED 2 run / 1 failure; after the minimal fix GREEN 2 run / 0 failures / 0 skipped. Existing PR #3326's eight messaging route tests are not on current main, so were not run or certified in this branch. `git diff --check` passed. No production, PostgreSQL, browser or full exact-SHA release gate performed; FULL RELEASE HOLD.

FE-C owns this narrow locale resolver/test change. FE-A owns shell and language selector; no shared shell edits. No financial or user data modified.
