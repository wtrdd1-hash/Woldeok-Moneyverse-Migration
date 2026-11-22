# Nov18 violet legacy-route correction — v2026.11.23.4

## Before work (2026-11-23 KST)
Owner requested design modifications, following the Nov18 review and the prior partial violet PR #3370. Read authority in `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, Nov18 design specification and existing QA. Re-fetched remote main `9876c09888`, parent violet `588972cd18`. Created an **isolated worktree from the committed source of PR #3370**, without modifying any Gemini worktree.

Approach: where archived Next-generated HTML is still shipped by Spring static resources, make only the visual brand/interaction layer align with navy/violet via a **small, scoped adapter CSS** loaded after legacy CSS, preserving data statuses, forms, original route/JS behavior, and existing Nov18 PNG archival files. Keep native Spring and preview pages independent. Pre-test failure; change with explicit file registry; test actual web CSS at multiple widths; QA, internal/GitHub logs, stacked PR. Neither authorized member ledger mutation nor Production deployment is part of this source change. All persistent approvals and exact Test/Production gates remain OPEN.

## In progress
- Source corpus: Spring `static/` has 290 HTML, 59 top-level and 231 nested. 222 nested snapshots reference `/_next/static/css/` and lack approved Nov18 brand adapter. Nine nested standalone (including preview) are **not** Next snapshots and are excluded from automated changes.
- Implementation/tests and final sign-off to follow.
