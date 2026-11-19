# UI Preview Promoted as Homepage — Work Log v2026.11.19.32

**Date:** 2026-11-19 KST
**Scope:** Evidence review and documentation only; no UI source, server, database, API, deployment, or release changes.
**Task branch:** `docs/ui-preview-homepage-incident-v20261119-32`
**Baseline:** `origin/main` at `78a3ff446f` after fetch; isolated worktree. The concurrent mini-PC local `main` was at `fa36b7b091` and is **not** the task branch.

## Before work
- User supplied a mobile browser screenshot (783×1536, SHA-256 `306fa75c03997e91c94da4697219b3a3637608bc0931029567ea815879a6cfeb`) of `easy-scraping.com`, showing the text "신규 사용자 유입을 위한 홈 화면 3안".
- Read `AGENTS.md`, `DOCS_INDEX.md`, the Korean master reference, the 180-page responsive redesign plan, the UI image handoff v2026.11.19.31, design system guidance, and related QA records.
- Source `frontend/src/app/design-preview/page.tsx` labels its screen as a **comparison prototype**, not a selected production homepage.
- Source QA record `docs/qa/2026-11-19-admin-api-and-180-route-exhaustive-qa.ko.md` states the design-preview `index.html` was copied into the live root. A read-only GET to the public root returned HTML containing the 3-concept title.
- The approved planning direction is dark navy/violet/blue game-like economy UI; the screenshot shows a green-focused exploration and no evidence of user acceptance.
- Original 180 combined desktop/mobile design concept PNGs are referenced under `docs/design/all-pages-v2026.11.18.12/`; their handoff explicitly says conceptual and not verified pixel-identical to the approved image.

## Plan / current state
- [x] Inspect user evidence and current documentation hierarchy.
- [x] Identify source, QA declaration, live root marker, and differences against agreed planning.
- [x] Isolate this document-only task to a new branch/worktree; leave other agents' uncommitted and local-only work untouched.
- [x] Publish incident analysis and action/acceptance checklist in English and Korean.
- [ ] Re-fetch remote main, validate document consistency and links, update log, and open a review PR (no merge or production promotion).
- [ ] Record final validation and change notes.

## In progress
Initial checkpoint recorded before publishing the incident report. At intermediate checkpoint, published bilingual findings and GitHub update notes in the master index. Both internal updates remain on mini-PC only per .gitignore; do not force-add. Changes to UI assets or runtime are explicitly **out of scope**. Neither the authorship of the screenshot design nor completion of API functional tests can be inferred from the supplied screenshot.

## Finished
Pending.
