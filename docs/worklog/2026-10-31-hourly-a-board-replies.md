# 2026-10-31 16:25 KST — A: public board reply-count filter

## Before work
- Status: IN PROGRESS / RELEASE HOLD. Canonical main at start: `1a3625f3c5e426c857e2b44a412d7949ac4a6257`; branch: `auto/hourly-a-20261031-1625-board-replies`.
- Debian 13.6 miniPC status initially showed active services and connected development DB. During audit, process/thread exhaustion caused `Cannot fork`, `EAGAIN` and unknown service health; fall back to the connected GitHub path without touching running workloads.
- Observed remote branches: 96 from GitHub API first page; open PRs: 87 at audit. Counts may change concurrently. Existing open A/B/C, planning and QA PRs are protected; no branch cleanup without merge-equivalence proof.
- Read latest `AGENTS.md`, `README.md`, English `docs/planning/PROJECT_PLAN.md` (canonical), Korean `PROJECT_PLAN.ko.md`, previous A report and recent QA. No existing open PR specifically implements public board reply-count filtering.
- Design assumption under delegated non-interactive task: on `/board`, offer All / With replies / Without replies, strictly within the *latest 50 public posts*, with stock and title filters combinable. No full-archive claims, writes, role grants, or migrations. Android app-api forwards the same public query but rejects invalid or unverified filtered HTTP 200 results.
- Implementation order: RED tests for backend query and guards, web parser/form, Android gateway; GREEN minimal backend SQL filter and web/app-api integration; rerun focused and full gates; re-fetch main and plan; PR Draft/HOLD unless every exact-SHA release gate passes.
- Rollback before merge: close Draft PR, preserve branch and evidence. No production mutation.

## In progress
- Worklog created before source changes. MiniPC-dependent tests currently BLOCKED by transient process exhaustion, not PASS.
- Planned files: `backend/src/board/stock-community.controller.ts`, `stock-community.service.ts`, `stock-community.service.test.ts`, `frontend/src/app/board/page.tsx`, `board-title-search.ts`, `board-title-search.test.ts`, `frontend/src/app/app-api/v1/[...path]/route.ts`, `route.test.ts`, bilingual worklogs and implementation plan.

## Finished
- PENDING. Record exact SHA, CI and Test/Production evidence before completion.
