# Owner Active Session Scope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development; verify each gate before claiming success.

**Goal:** Add a member-visible, owner-scoped `other devices only` filter to the existing active-session list, including Android app-api response proof.

**Architecture:** Reuse the existing `account_active_sessions(p_user,p_current_session)` SECURITY DEFINER PostgreSQL function. Filter its owner-bound result only after DB retrieval; do not alter grants or session mutation semantics. The Next page uses a strict mode-aware response parser; Android gateway rejects invalid duplicate query values and any upstream success containing current/invalid session data.

**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL 17, app-api gateway.

**Spec:** `docs/planning/PROJECT_PLAN.md` and `docs/planning/PROJECT_PLAN.ko.md` (session/privacy and owner-scoped read policy); scoped implementation contract in this plan.

## Global Constraints
- English source and test code; Korean UI copy; member page noindex/no-store; no new migration.
- Default unfiltered response unchanged. `scope=other` is the sole new value; duplicate or malformed values are HTTP 400.
- Never accept an upstream HTTP 200 with a current session in `scope=other`, missing owner-evidence structure, or malformed session timestamps.
- No new raw metadata, session token, IP, user agent, direct table grants, WLD writes, or unsafe rollout.

## Review Focus
- Stale backend ignoring scope must fail closed in browser and Android.
- Empty other-session list is valid; a returned current session is not.
- Duplicated `scope` values are rejected before any DB/proxy call.
- Revocation actions continue to query unfiltered owner sessions and require reauthentication.
- Invalid filter does not silently display all sessions.

## Tasks
- [ ] Add RED backend controller/repository tests for all/other/invalid/duplicate and owner-bound SQL.
- [ ] Add RED web parser and page tests for other-only, invalid scope and no false all-list.
- [ ] Add RED Android gateway tests for duplicate/invalid, stale upstream, malformed 200, cache/noindex.
- [ ] Implement smallest backend read filter and query validation; GREEN.
- [ ] Implement scope-aware parser and accessible web filter links; GREEN.
- [ ] Implement Android gateway response validation; GREEN.
- [ ] Verify full test/build/lint/typecheck, SQL role/owner function, exact SHA CI, Test/Production gates.
- [ ] Update English/Korean worklogs, QA/Release HOLD, PR and branch audit; preserve unmerged work.

## Execution evidence
- TDD RED and GREEN logs in `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-0425-security-session-scope/`.
- Test fixtures cover stale backend, duplicate query, valid owner-only other session, noindex/no-store and SQL owner arguments.
