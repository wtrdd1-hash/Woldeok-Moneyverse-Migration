# Administrator Mobile Analytics Remediation Worklog — v2026.10.06.537

- Date: 2026-10-06
- Branch: `fix/admin-mobile-analytics-v2026.10.06.537`
- Baseline: `origin/main=30d1eb2b50ec49e57273e699e6db7b54859bb200`
- Trigger: supplied mobile screenshots show overlapping/clipped administrator controls in the SEO and analytics surfaces, plus floating user widgets covering administrator content.
- Scope: reproduce and correct the narrow-viewport layout defects without changing economy/database authority; add focused regressions; verify on isolated Test before any Production promotion.
- Concurrency boundary: isolated Git worktree created from latest fetched `origin/main`; concurrent workers must not be reset or overwritten.
- Documentation authority reviewed first: `DOCUMENTATION_POLICY.md`, integrated planning master, responsive guidelines, administrator responsive hard requirements, v530 emergency UI audit, AGENTS/PROJECT_MEMORY.
- Repository-wide document preflight: all tracked Markdown documents will be enumerated/read by checksum/title scan before source edits; relevant authority documents are read in detail.

## Pre-work defect hypotheses

1. SEO action controls do not reflow at narrow widths and allow long labels to collide.
2. The all-in-one analytics tab rail uses a desktop density model on mobile, producing overlapping labels and a poor horizontal-scroll affordance.
3. Global onboarding/support floating launchers remain mounted on administrator routes and occlude operational content.
4. Existing responsive tests do not cover the exact combined long-label/mobile states shown in the supplied evidence.

## Execution plan

1. Complete all-document inventory scan and relevant-source inspection.
2. Add failing mobile regression tests for the reproduced defects.
3. Implement the smallest responsive fixes.
4. Re-fetch `origin/main`; reconcile only if relevant paths changed.
5. Run targeted tests, full frontend tests/typecheck/build, and responsive browser QA.
6. Push the branch, validate the exact SHA on isolated Test, verify backend health, then use the project zero-downtime promotion process only if all release gates pass.
7. Record mid-work and final evidence plus internal and GitHub-facing update notes.

## Mid-work checkpoint — 2026-10-06

- Mandatory re-fetch: `origin/main` remains `30d1eb2b50ec49e57273e699e6db7b54859bb200`; no drift and no overlap with the v537 paths.
- Full Markdown corpus preflight completed: 1,767 files / 161,931 lines, corpus SHA-256 `c53772d9ac72d013c7f7c783004fbd0dfa41a8b357a163ba600e8d6f836ade0e`; 1,159 files matched the broad admin/mobile/analytics/SEO relevance scan. Relevant authority documents were separately read in detail.
- Root cause confirmed: SEO long actions were allowed to shrink inside a flex row; analytics category buttons were shrinkable inside a nowrap scroller; onboarding/support fixed widgets were globally mounted on administrator routes.
- RED evidence: focused administrator responsive regression failed before implementation because the route-aware floating-utility boundary did not exist.
- GREEN evidence: focused administrator responsive + SEO + analytics suite passes 3 files / 18 tests.
- Implemented: narrow SEO actions use 1-column/2-column/desktop-flex reflow with wrapping labels; analytics tabs use intrinsic-width children in a contained touch scroller; cohort card heading/badge reflow on mobile; onboarding/support floating utilities are not mounted under `/admin/**`.
- A mistakenly broad test invocation also exposed baseline failures outside this change: four existing SEO assertions still classify `/bank` as private while current sitemap/indexability code treats it as public, plus three suite-load failures in that broad run. These are recorded as unrelated baseline evidence and are not being hidden or misreported as v537 regressions.

## Pre-Test verification checkpoint
- Focused administrator mobile/SEO/analytics suite: 3 files / 18 tests PASS.
- Repository TypeScript typecheck: PASS.
- Production build: PASS.
- Repository lint: PASS with 0 errors and existing warning debt only.
- `git diff --check`: PASS.
- Full repository test completed with 1,059 passing and 4 failing frontend assertions, all confined to unchanged `/bank` sitemap/robots/indexability expectations. The same mismatch was observed before the final v537 implementation and no failing file is modified by this patch. This is recorded as a current-main baseline inconsistency, not a v537 regression.
- Next gate: commit/push exact candidate, deploy it to isolated Test, verify Test backend/version, then run authenticated five-pass administrator viewport QA before any Production action.

## Exact-SHA Test discovery and follow-up — 2026-10-06
- First candidate commit/push: `8f33ba92cb45ae7bc88e9b5ee7a1e0c36250f687`.
- Isolated Test staged at `/srv/moneyverse-data/releases/test-v537-admin-mobile-8f33ba92`; public Test version matched the exact SHA, backend `:3100/health` returned `status=ok`, public `/status` returned 200, and Test retained `X-Robots-Tag: noindex, nofollow`.
- Initial authenticated browser sweep: 25 administrator routes × 5 representative viewport passes = 125 checks; non-200 0, wrong-path 0, document overflow 0, administrator consumer-floating widgets 0, blank main 0.
- The same sweep exposed two candidate blockers on `/admin/seo`: React minified error #418 at the 430px and landscape passes, and the four changed primary actions measured 40px tall rather than the required 44px.
- Root cause analysis found first-render time text depended on `Date.now()` and a locale-formatted fabricated initial Indexing API success history; additionally `Button size="sm"` fixes height at 40px while the later `.moneyverse-button` rule prevents the attempted utility min-height from winning the cascade.
- Follow-up implementation serializes one server reference time into `SeoClientView`, uses it for relative-time first render, pins crawler log display to Asia/Seoul, removes the fabricated initial indexing-success row, and uses the 44px default button size for the four primary SEO actions.
- Follow-up TDD: RED 10 passed / 1 failed before implementation; GREEN 3 files / 20 tests PASS. Repository typecheck PASS; targeted ESLint 0 errors with pre-existing warnings only; `git diff --check` PASS.
- Mandatory refetch after the Test discovery still reports `origin/main=30d1eb2b50ec49e57273e699e6db7b54859bb200`; no upstream drift occurred.
- The first candidate remains Test evidence only. The follow-up commit must be rebuilt and restaged as a new exact SHA before Test or Production acceptance.


## Final exact-SHA Test acceptance — 2026-10-06
- Follow-up candidate: `b1a49d1fe379ce550c6f7602e8f3d5e2250fa2e7`.
- Isolated Test release: `/srv/moneyverse-data/releases/test-v537-admin-mobile-b1a49d1f`; current Test symlink points to this release and backend health returns `{"status":"ok"}`.
- Authenticated five-pass administrator QA completed: 26 routes, 5 pass groups, 13 viewport/state combinations, **338/338 checks PASS**.
- Failure counters: non-200 0, wrong path 0, page/body horizontal overflow 0, administrator consumer-floating widgets 0, blank main 0, page error 0.
- Changed-surface checks: 26/26 PASS; SEO primary-action minimum height measured 44px; SEO action overlap 0, analytics tab overlap 0, analytics heading/status overlap 0.
- At the time of this acceptance `origin/main` was `30d1eb2b50ec49e57273e699e6db7b54859bb200`; a later QA-only main change is handled in the next checkpoint.
- Production remains intentionally unchanged until GitHub integration/release gates are satisfied; the current Production version is not claimed to include v537.

## Main-drift reconciliation and final pre-PR verification — 2026-10-06
- A concurrent QA-only repair branch passed Build Test Candidate at `871539a7cba45e25a9aef87753f74d8d6ad20f2a`; PR #796 merged it to main as `103e0aa2a134eb533a2cf5cbd17cbb1e95b7dfeb`. It changes only three test files and does not alter application runtime behavior.
- Mandatory fetch therefore detected main drift from the original `30d1eb2b` baseline. The v537 source commits were cleanly rebased onto `103e0aa2` rather than overwriting concurrent work.
- Post-rebase local gate is green: focused administrator responsive/SEO/analytics 20/20, repository typecheck PASS, root/contract/database/backend/frontend test command PASS (backend 1,076 passed and 391 DB-backed tests skipped by the local environment; frontend 1,065 passed), lint PASS, production build PASS and `git diff --check` PASS.
- The prior `b1a49d1f` Test evidence is retained as diagnostic/acceptance history, but it is not release proof for the rebased SHA. The final pushed branch SHA must pass Build Test Candidate and be restaged to isolated Test for exact-version/backend/noindex/five-pass administrator QA before merge or Production action.

## CI dependency-audit gate — 2026-10-06
- PR #797 CI passed policy, lint, typecheck, build, migrations and tests, then failed closed on the production dependency audit because two transitive packages had newly published high/critical advisories.
- The audit gate was preserved. The root package overrides and lockfile were updated to patched transitive versions instead of suppressing or lowering the CI check.
- Local post-fix evidence: production dependency audit reports no known vulnerabilities, and the complete typecheck/test/lint/build/audit/diff-check chain exits 0.
- This changes candidate identity, so the new branch head must pass GitHub CI and exact-SHA isolated Test again before merge or Production.
