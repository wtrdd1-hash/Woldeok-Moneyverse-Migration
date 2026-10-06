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
