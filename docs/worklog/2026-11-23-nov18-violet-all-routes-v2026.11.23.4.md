# Nov18 violet legacy-route correction — v2026.11.23.4

## Before work (2026-11-23 KST)
Owner requested design modifications, following the Nov18 review and the prior partial violet PR #3370. Read authority in `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, Nov18 design specification and existing QA. Re-fetched remote main `9876c09888`, parent violet `588972cd18`. Created an **isolated worktree from the committed source of PR #3370**, without modifying any Gemini worktree.

Approach: where archived Next-generated HTML is still shipped by Spring static resources, make only the visual brand/interaction layer align with navy/violet via a **small, scoped adapter CSS** loaded after legacy CSS, preserving data statuses, forms, original route/JS behavior, and existing Nov18 PNG archival files. Keep native Spring and preview pages independent. Pre-test failure; change with explicit file registry; test actual web CSS at multiple widths; QA, internal/GitHub logs, stacked PR. Neither authorized member ledger mutation nor Production deployment is part of this source change. All persistent approvals and exact Test/Production gates remain OPEN.

## In progress
- Source corpus: Spring `static/` has 290 HTML, 59 top-level and 231 nested. 222 nested snapshots reference `/_next/static/css/` and lack approved Nov18 brand adapter. Nine nested standalone (including preview) are **not** Next snapshots and are excluded from automated changes.
- Implementation/tests and final sign-off to follow.

## Checkpoint — TDD, layout failure and recovery
- RED: original CSS adapter tests 2 failed, additional independent token test 1 failed, missing global CSS contract 2 failed, dark header/navy preflight test failed; all passed after targeted fixes.
- Source inspection: 222 Next snapshots referenced 7 unique CSS, but `828951...` (217 files) and `9d01...` (4) were missing. Initial static Chromium showed grotesquely oversized unstyled SVGs and default 8px body margin; color-only fixes would have misrepresented success. The existing 450KB `5f13...` complete Tailwind base restored normal header, SVG and menu geometry in offline visual trials. This is compatibility substitution, not exact old original CSS.
- Scoped SHA-versioned violet adapter used on 222; six of nine non-Next independent routes corrected primary brand only. Navy mobile dock/header; keeps positive/negative state data independent.
- MiniPC Chromium 6 routes×4 sizes=24/24, all source linked and computed violet CTA, 24/24 positive state unchanged, overflow0. Local Spring test exact CSS byte serving, full offline H2 Spring JUnit **674 passing** and bootJar success. Other worktrees untouched.
- Final main fetch and GitHub PR handoff follow; official Test backend and Production unaffected.

## Finish — source only, runtime HOLD
- Work and QA evidence documented in [QA](../qa/2026-11-23-nov18-violet-all-routes-v2026.11.23.4.md), [static screenshots](../design/nov18-violet-v2026.11.23.4/README.md) and versioned public/internal update notes.
- Exact 180-page native Thymeleaf functionality, independent Test, authenticated bank/ledger P0, complete multilingual browser and rollback tests remain OPEN; do not release the source candidate as production-complete.
