# 2026-10-29 — Development A: verified notification search (DRAFT / RELEASE HOLD)

## Before work — 22:22 KST
- Source main: `0a4327f73e0d2d4dc5deb614a1bb9b8cb04ee6d2`; isolated branch `auto/hourly-a-notification-keyword-20261029-2225`.
- Debian 13.6 miniPC, service status active, DEV PostgreSQL connected. Existing main checkout has unrelated uncommitted edits; it is untouched.
- Read AGENTS.md, README.md, bilingual PROJECT_PLAN and integrated master, current QA/CI, 5 open PRs, 9 remote branches. Preserve all other workers' refs and changes.
- Selected P1: member-only historical notification search with strict validation, owner/session binding, signed keyset pagination, read-only database query, Next BFF, Android contract, accessible member UI. No ledger or notification mutation.
- Dependencies: schema lineage for `in_app_notifications` is not proven, official Test exact-SHA E2E and finance/backup release gates are blocked. Never claim a release without all gates.

## Plan
1. Add failing backend/frontend validation and cursor tests (RED).
2. Implement safe backend search + BFF + member search UI, using existing schema without changing applied migrations or granting table permissions (GREEN).
3. Verify PostgreSQL owner/date/index behavior with isolated synthetic fixture and fail closed on missing schema/index.
4. Run required gates, capture actual failures, refresh main and PR inventory, publish Draft PR, preserve unmerged work.

## In progress
- Baseline source and QA examined. Work remains isolated.

## Finished
- Pending exact-SHA verification and release decision.

## In progress — 22:29 KST
- RED tests initially failed because the search modules/routes did not exist; implemented backend DTO, owner/session HMAC cursor, read-only indexed PostgreSQL query with 2s statement timeout, Next CSRF BFF, gated responsive member UI and Android app-api no-store/noindex response.
- Feature is OFF unless `NOTIFICATION_SEARCH_ENABLED=true` is set on both Backend and Frontend. No migrations were written: current `in_app_notifications` DDL lineage is unproven; existing owner/date index was read directly from DEV metadata. No table privilege changes.
- Backend focused 4 PASS; Frontend focused BFF/parser 5 PASS; existing `app-gateway.test.ts` help-related assertion fails independently. Initial Typecheck failed on a nullable request header; corrected and Frontend typecheck PASS. Full gates and isolated real PostgreSQL still pending.
- Mid-run origin/main refreshed. Do not merge or promote without exact-SHA full gates and official Test.
