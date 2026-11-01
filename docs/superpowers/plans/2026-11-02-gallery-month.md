# Verified Public Gallery Month Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors select a Seoul publication month among the most recent 24 approved gallery photos, with consistent web/Nest/Android fail-closed filtering.

**Architecture:** Reuse the bounded SECURITY DEFINER `content_list_published_photos` read model without schema/grant changes. Nest validates the sole `month=YYYY-MM` parameter and filters normalized approved rows using Asia/Seoul month boundaries, echoing the applied month; Next renders a labelled month input and verified empty/unavailable states; Android app-api verifies the echoed month and every returned timestamp, rejecting ignored filters and malformed responses. Do not claim full historical gallery search.

**Tech Stack:** NestJS, Next.js App Router, PostgreSQL 17, Vitest, TypeScript.

**Assumptions (non-interactive bounded design):** User's standing P1 end-to-end authorization covers this read-only discoverability enhancement. No new migrations, direct table access, financial writes, or authenticated route. Feature results are no-store/noindex; unfiltered canonical gallery remains indexable. No new caching of public content.

## Tasks
- [x] Capture origin/main SHA, open PR and branch inventory, prior QA; isolate fresh worktree.
- [x] Write failing backend month parsing/service/controller tests and frontend parser/response tests; record RED.
- [x] Implement backend validated query in both public controllers, month filter after existing approved-row normalization, and tests GREEN.
- [x] Implement gallery month UI, SEO, Android fail-closed response verification, and tests GREEN.
- [ ] Regenerate app-api contract only if route shape changes; validate exact contract.
- [ ] Check DEV PostgreSQL app-role READ ONLY with existing approved photo function, verify no direct table access additions.
- [ ] Run targeted, full unit, typecheck, lint, build, security, app-api, accessibility/SEO, CI, isolated Test exact SHA gates; capture exact evidence and blockers.
- [ ] Refresh origin/main and integration plan at midpoint and pre-merge. Create Draft PR with HOLD when any required gate is unproven; never deploy without independent Test/restore/production gates.
- [ ] Record QA, worklog, release decision, branch inventory and SHA; protect all unmerged changes.

**Rollback:** Revert this read-only branch or disable UI entry; no DB migration or data rollback required.
